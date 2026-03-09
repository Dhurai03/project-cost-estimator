/**
 * COCOMO II Service
 * Based on USC COCOMO II Model Definition
 */
class CocomoService {
  // Scale factor exponents (B) for different project types
  static scaleFactors = {
    organic: 1.05,
    'semi-detached': 1.12,
    embedded: 1.20
  };

  // Multipliers for scale factors (summation)
  static scaleFactorWeights = {
    prec: 0.01, // Precedentedness
    flex: 0.01, // Development Flexibility
    resl: 0.01, // Architecture/Risk Resolution
    team: 0.01, // Team Cohesion
    pmat: 0.01  // Process Maturity
  };

  // Effort multipliers for cost drivers
  static effortMultipliers = {
    // Product factors
    rely: { vl: 0.75, l: 0.88, n: 1.00, h: 1.15, vh: 1.40, xh: 1.40 },
    data: { l: 0.90, n: 1.00, h: 1.14, vh: 1.28 },
    cplx: { vl: 0.70, l: 0.85, n: 1.00, h: 1.15, vh: 1.30, xh: 1.65 },
    
    // Platform factors
    time: { n: 1.00, h: 1.11, vh: 1.30, xh: 1.66 },
    stor: { n: 1.00, h: 1.05, vh: 1.17, xh: 1.46 },
    pvol: { l: 0.87, n: 1.00, h: 1.15, vh: 1.30 },
    
    // Personnel factors
    acap: { vl: 1.42, l: 1.19, n: 1.00, h: 0.85, vh: 0.71 },
    pcap: { vl: 1.34, l: 1.15, n: 1.00, h: 0.88, vh: 0.76 },
    pcon: { vl: 1.29, l: 1.12, n: 1.00, h: 0.90, vh: 0.81 },
    aexp: { vl: 1.22, l: 1.10, n: 1.00, h: 0.88, vh: 0.81 },
    plex: { vl: 1.19, l: 1.09, n: 1.00, h: 0.91, vh: 0.85 },
    ltex: { vl: 1.20, l: 1.09, n: 1.00, h: 0.91, vh: 0.84 },
    
    // Project factors
    tool: { vl: 1.17, l: 1.09, n: 1.00, h: 0.90, vh: 0.78 },
    site: { vl: 1.22, l: 1.09, n: 1.00, h: 0.93, vh: 0.86, xh: 0.80 },
    sced: { vl: 1.43, l: 1.14, n: 1.00, h: 1.00, vh: 1.00 }
  };

  /**
   * Calculate Effort (Person-Months)
   * PM = A × Size^E × Π(EMi)
   * where E = B + 0.01 × Σ(SFj)
   */
  static calculateEffort(sizeKloc, modelType, scaleFactors, costDrivers) {
    // Base constant A for COCOMO II
    const A = 2.94;
    
    // Calculate exponent E
    const sfSum = Object.entries(scaleFactors).reduce((sum, [key, value]) => {
      return sum + (value * this.scaleFactorWeights[key] || 0);
    }, 0);
    
    // In COCOMO II, B is a strict constant of 0.91
    const B = 0.91;
    const E = B + 0.01 * sfSum;
    
    // Calculate effort multiplier product
    const emProduct = Object.values(costDrivers).reduce((product, value) => {
      return product * value;
    }, 1.0);
    
    // Calculate effort
    const effort = A * Math.pow(sizeKloc, E) * emProduct;
    
    return {
      effort,
      exponent: E,
      sfSum,
      emProduct
    };
  }

  /**
   * Calculate Development Time (Months)
   * TDEV = C × PM^F
   * where F = D + 0.2 × (E - B)
   */
  static calculateTime(effort, E, modelType) {
    const C = 3.67;
    const D = 0.28;
    const B = 0.91; // COCOMO II constant
    
    const F = D + 0.2 * (E - B);
    const time = C * Math.pow(effort, F);
    
    return { time, F };
  }

  /**
   * Calculate Average Staff
   */
  static calculateStaff(effort, time) {
    return effort / time;
  }

  /**
   * Calculate Productivity (LOC/PM)
   */
  static calculateProductivity(sizeKloc, effort) {
    return (sizeKloc * 1000) / effort;
  }

  /**
   * Calculate Phase Distribution
   */
  static calculatePhaseDistribution(effort, modelType) {
    // Percentage distribution based on model type
    const distributions = {
      organic: {
        plansAndRequirements: 0.06,
        productDesign: 0.16,
        programming: 0.68,
        integrationAndTest: 0.10
      },
      'semi-detached': {
        plansAndRequirements: 0.07,
        productDesign: 0.17,
        programming: 0.64,
        integrationAndTest: 0.12
      },
      embedded: {
        plansAndRequirements: 0.08,
        productDesign: 0.18,
        programming: 0.60,
        integrationAndTest: 0.14
      }
    };
    
    const dist = distributions[modelType] || distributions['semi-detached'];
    
    return {
      plansAndRequirements: effort * dist.plansAndRequirements,
      productDesign: effort * dist.productDesign,
      programming: effort * dist.programming,
      integrationAndTest: effort * dist.integrationAndTest
    };
  }

  /**
   * Calculate Confidence Interval
   * Using standard COCOMO II accuracy: ±20-30%
   */
  static calculateConfidence(effort, time, modelType) {
    let variance = 0.20; // 20% default
    
    if (modelType === 'organic') variance = 0.15;
    if (modelType === 'embedded') variance = 0.30;
    
    return {
      low: effort * (1 - variance),
      high: effort * (1 + variance),
      probability: 0.75
    };
  }

  /**
   * Complete COCOMO II calculation
   */
  static calculateAll(data) {
    const { 
      sizeKloc, 
      modelType, 
      scaleFactors, 
      costDrivers,
      laborRatePerMonth = 5000
    } = data;
    
    // Step 1: Calculate effort
    const { effort, exponent, sfSum, emProduct } = this.calculateEffort(
      sizeKloc, 
      modelType, 
      scaleFactors, 
      costDrivers
    );
    
    // Step 2: Calculate time
    const { time, F } = this.calculateTime(effort, exponent, modelType);
    
    // Step 3: Calculate staff
    const staff = this.calculateStaff(effort, time);
    
    // Step 4: Calculate productivity
    const productivity = this.calculateProductivity(sizeKloc, effort);
    
    // Step 5: Calculate phase distribution
    const phaseDistribution = this.calculatePhaseDistribution(effort, modelType);
    
    // Step 6: Calculate cost
    const cost = effort * laborRatePerMonth;
    
    // Step 7: Calculate confidence interval
    const confidence = this.calculateConfidence(effort, time, modelType);
    
    return {
      sizeKloc,
      effortPersonMonths: Math.round(effort * 100) / 100,
      developmentTimeMonths: Math.round(time * 100) / 100,
      averageStaff: Math.round(staff * 10) / 10,
      productivity: Math.round(productivity),
      cost: Math.round(cost * 100) / 100,
      phaseDistribution: {
        plansAndRequirements: Math.round(phaseDistribution.plansAndRequirements * 100) / 100,
        productDesign: Math.round(phaseDistribution.productDesign * 100) / 100,
        programming: Math.round(phaseDistribution.programming * 100) / 100,
        integrationAndTest: Math.round(phaseDistribution.integrationAndTest * 100) / 100
      },
      confidenceInterval: {
        low: Math.round(confidence.low * 100) / 100,
        high: Math.round(confidence.high * 100) / 100,
        probability: confidence.probability
      },
      parameters: {
        exponent: Math.round(exponent * 100) / 100,
        sfSum: Math.round(sfSum * 100) / 100,
        emProduct: Math.round(emProduct * 100) / 100,
        F: Math.round(F * 100) / 100
      }
    };
  }
}

module.exports = CocomoService;