/**
 * Analogy-Based Estimation Service
 * Uses historical project data for estimation
 */
class AnalogyService {
  // Feature weights for similarity calculation
  static featureWeights = {
    projectType: 0.25,
    teamSize: 0.15,
    duration: 0.15,
    complexity: 0.20,
    technologyStack: 0.15,
    methodology: 0.05,
    domain: 0.05
  };

  // Similarity thresholds
  static similarityThresholds = {
    excellent: 90,
    good: 80,
    fair: 70,
    poor: 50
  };

  /**
   * Calculate similarity score between two projects
   */
  static calculateSimilarity(source, target) {
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [feature, weight] of Object.entries(this.featureWeights)) {
      const similarity = this.calculateFeatureSimilarity(
        feature, 
        source[feature], 
        target[feature]
      );
      
      totalScore += similarity * weight;
      totalWeight += weight;
    }
    
    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
  }

  /**
   * Calculate similarity for individual features
   */
  static calculateFeatureSimilarity(feature, sourceValue, targetValue) {
    if (!sourceValue || !targetValue) return 0.5; // Default when missing
    
    switch (feature) {
      case 'projectType':
        return sourceValue === targetValue ? 1.0 : 0.3;
        
      case 'teamSize':
        const diff = Math.abs(sourceValue - targetValue);
        const maxDiff = 20; // Maximum expected difference
        return Math.max(0, 1 - (diff / maxDiff));
        
      case 'duration':
        const durationDiff = Math.abs(sourceValue - targetValue);
        const maxDurationDiff = 12; // 12 months max difference
        return Math.max(0, 1 - (durationDiff / maxDurationDiff));
        
      case 'complexity':
        const complexityMap = { 'Low': 1, 'Medium': 2, 'High': 3 };
        const sourceLevel = complexityMap[sourceValue] || 2;
        const targetLevel = complexityMap[targetValue] || 2;
        const levelDiff = Math.abs(sourceLevel - targetLevel);
        return 1 - (levelDiff * 0.33); // 0.33 per level difference
        
      case 'technologyStack':
        if (!Array.isArray(sourceValue) || !Array.isArray(targetValue)) return 0.5;
        const common = sourceValue.filter(tech => targetValue.includes(tech));
        const total = new Set([...sourceValue, ...targetValue]).size;
        return total > 0 ? common.length / total : 0.5;
        
      case 'methodology':
        return sourceValue === targetValue ? 1.0 : 0.4;
        
      case 'domain':
        return sourceValue === targetValue ? 1.0 : 0.4;
        
      default:
        return 0.5;
    }
  }

  /**
   * Find similar historical projects
   */
  static findSimilarProjects(sourceProject, historicalProjects, minSimilarity = 70, maxResults = 5) {
    const similarities = [];
    
    for (const project of historicalProjects) {
      // Skip if same project
      if (project._id?.toString() === sourceProject._id?.toString()) continue;
      
      const similarity = this.calculateSimilarity(
        sourceProject,
        project
      );
      
      if (similarity >= minSimilarity) {
        similarities.push({
          projectId: project._id,
          similarityScore: Math.round(similarity * 100) / 100,
          name: project.name,
          actualCost: project.totalCost,
          actualDuration: project.duration,
          actualTeamSize: project.teamSize,
          differences: this.identifyDifferences(sourceProject, project)
        });
      }
    }
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarityScore - a.similarityScore);
    
    return similarities.slice(0, maxResults);
  }

  /**
   * Identify key differences between projects
   */
  static identifyDifferences(source, target) {
    const differences = {};
    
    if (source.projectType !== target.projectType) {
      differences.projectType = {
        source: source.projectType,
        target: target.projectType
      };
    }
    
    if (source.complexityLevel !== target.complexityLevel) {
      differences.complexity = {
        source: source.complexityLevel,
        target: target.complexityLevel
      };
    }
    
    const teamDiff = Math.abs((source.teamSize || 0) - (target.teamSize || 0));
    if (teamDiff > 3) {
      differences.teamSize = {
        source: source.teamSize,
        target: target.teamSize,
        diff: teamDiff
      };
    }
    
    const durationDiff = Math.abs((source.duration || 0) - (target.duration || 0));
    if (durationDiff > 2) {
      differences.duration = {
        source: source.duration,
        target: target.duration,
        diff: durationDiff
      };
    }
    
    return differences;
  }

  /**
   * Calculate weighted estimate from similar projects
   */
  static calculateWeightedEstimate(similarProjects) {
    if (similarProjects.length === 0) {
      return {
        estimatedCost: 0,
        confidenceScore: 0,
        riskLevel: 'High',
        recommendations: ['No similar projects found. Consider using other estimation methods.']
      };
    }
    
    let totalWeight = 0;
    let weightedCost = 0;
    
    for (const project of similarProjects) {
      // Weight = similarity score squared to emphasize closer matches
      const weight = Math.pow(project.similarityScore / 100, 2);
      weightedCost += project.actualCost * weight;
      totalWeight += weight;
    }
    
    const estimatedCost = totalWeight > 0 ? weightedCost / totalWeight : 0;
    
    // Calculate confidence based on number and quality of matches
    const avgSimilarity = similarProjects.reduce((sum, p) => sum + p.similarityScore, 0) / similarProjects.length;
    const matchCountBonus = Math.min(similarProjects.length / 3, 1); // Max bonus at 3+ matches
    
    let confidenceScore = avgSimilarity * matchCountBonus;
    confidenceScore = Math.min(confidenceScore, 100);
    
    // Determine risk level
    let riskLevel = 'High';
    if (confidenceScore >= 80) riskLevel = 'Low';
    else if (confidenceScore >= 60) riskLevel = 'Medium';
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(similarProjects, confidenceScore);
    
    return {
      estimatedCost: Math.round(estimatedCost * 100) / 100,
      confidenceScore: Math.round(confidenceScore * 100) / 100,
      riskLevel,
      recommendations
    };
  }

  /**
   * Generate recommendations based on analysis
   */
  static generateRecommendations(similarProjects, confidenceScore) {
    const recommendations = [];
    
    if (similarProjects.length === 0) {
      recommendations.push('No similar historical projects found');
      return recommendations;
    }
    
    if (confidenceScore < 50) {
      recommendations.push('Consider getting more detailed requirements');
      recommendations.push('Use multiple estimation methods for cross-validation');
    }
    
    if (similarProjects.length < 3) {
      recommendations.push('Limited number of similar projects. Consider industry benchmarks');
    }
    
    const avgSimilarity = similarProjects.reduce((sum, p) => sum + p.similarityScore, 0) / similarProjects.length;
    if (avgSimilarity < 60) {
      recommendations.push('Projects are not very similar. Adjust parameters or use COCOMO II');
    }
    
    // Add specific recommendations based on differences
    const allDiffs = similarProjects.flatMap(p => Object.keys(p.differences || {}));
    if (allDiffs.includes('complexity')) {
      recommendations.push('Complexity levels differ significantly - adjust estimate accordingly');
    }
    if (allDiffs.includes('teamSize')) {
      recommendations.push('Team size variations - consider productivity differences');
    }
    
    return recommendations;
  }

  /**
   * Complete analogy-based estimation
   */
  static async estimate(data) {
    const { sourceProject, historicalProjects, searchParams = {} } = data;
    
    const {
      minSimilarity = 70,
      maxResults = 5,
      useWeightedSimilarity = true
    } = searchParams;
    
    // Find similar projects
    const similarProjects = this.findSimilarProjects(
      sourceProject,
      historicalProjects,
      minSimilarity,
      maxResults
    );
    
    // Calculate weighted estimate
    const estimation = this.calculateWeightedEstimate(similarProjects);
    
    return {
      results: {
        ...estimation,
        similarProjects
      },
      metadata: {
        totalHistoricalProjects: historicalProjects.length,
        similarProjectsFound: similarProjects.length,
        minSimilarityUsed: minSimilarity,
        estimationMethod: useWeightedSimilarity ? 'weighted' : 'average'
      }
    };
  }
}

module.exports = AnalogyService;