import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const AnalogyEstimation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    features: {
      projectType: 'Web Application', // Default
      teamSize: 3,
      duration: 6, // Months
      complexity: 'Medium',
      technologyStack: 'MERN',
      methodology: 'Agile',
      domain: 'E-commerce'
    },
    searchParams: {
      minSimilarity: 70,
      maxResults: 3,
      useWeightedSimilarity: true
    },
    notes: ''
  });

  // Mock historical database - In a perfect app, this comes from /api/projects/history
  const historicalDatabase = [
    { _id: 'h1', name: 'Alpha Web Store', actualCost: 45000, actualDuration: 5, actualTeamSize: 3, type: 'Web Application', complexity: 'Medium', stack: 'MERN' },
    { _id: 'h2', name: 'Beta CRM', actualCost: 85000, actualDuration: 8, actualTeamSize: 5, type: 'Web Application', complexity: 'High', stack: 'Django/React' },
    { _id: 'h3', name: 'Gamma Mobile App', actualCost: 60000, actualDuration: 6, actualTeamSize: 4, type: 'Mobile Application', complexity: 'Medium', stack: 'React Native' },
    { _id: 'h4', name: 'Delta CMS', actualCost: 35000, actualDuration: 4, actualTeamSize: 2, type: 'Web Application', complexity: 'Low', stack: 'WordPress' },
    { _id: 'h5', name: 'Epsilon Enterprise Data', actualCost: 150000, actualDuration: 12, actualTeamSize: 8, type: 'Data Engineering', complexity: 'High', stack: 'Python/Airflow' }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await api.get('/projects?limit=100');
      let loadedProjects = response.data.data || [];
      if (loadedProjects.length === 0) {
        loadedProjects = [{ _id: 'sample-1', name: 'Sample: E-commerce Platform' }];
      }
      setProjects(loadedProjects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleFeatureChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [field]: value }
    }));
  };

  const calculateAnalogy = () => {
    try {
      // 1. Scoring Logic: Compare formData.features to historicalDatabase
      let matches = [];
      const target = formData.features;

      historicalDatabase.forEach(history => {
        let score = 0;
        let maxScore = 5; // Type, TeamSize, Duration, Complexity, Stack

        // Weight features
        if (history.type === target.projectType) score += 1.5;
        if (history.complexity === target.complexity) score += 1.5;
        if (history.stack.includes(target.technologyStack)) score += 1.0;
        
        // Number closeness (Team Size)
        const teamDiff = Math.abs(history.actualTeamSize - target.teamSize);
        if (teamDiff === 0) score += 0.5;
        else if (teamDiff <= 2) score += 0.25;

        // Number closeness (Duration)
        const durDiff = Math.abs(history.actualDuration - target.duration);
        if (durDiff === 0) score += 0.5;
        else if (durDiff <= 2) score += 0.25;

        // Normalize to percentage
        const similarityScore = Math.round((score / maxScore) * 100);

        if (similarityScore >= formData.searchParams.minSimilarity) {
          matches.push({
            ...history,
            similarityScore
          });
        }
      });

      // Sort by best match
      matches.sort((a, b) => b.similarityScore - a.similarityScore);
      matches = matches.slice(0, formData.searchParams.maxResults);

      if (matches.length === 0) {
        toast.error('No historical projects met the minimum similarity threshold. Try lowering the threshold.');
        return null;
      }

      // 2. Extrapolate New Estimate
      // We use a weighted average of the matched projects' actual costs
      let totalWeight = 0;
      let weightedCostSum = 0;

      matches.forEach(match => {
        const weight = match.similarityScore / 100;
        totalWeight += weight;
        weightedCostSum += match.actualCost * weight;
      });

      const estimatedCost = Math.round(weightedCostSum / totalWeight);

      // Determine Risk/Confidence
      const averageSimilarity = matches.reduce((sum, match) => sum + match.similarityScore, 0) / matches.length;
      let riskLevel = 'High';
      let confidenceScore = Math.round(averageSimilarity);
      
      if (confidenceScore > 85) riskLevel = 'Low';
      else if (confidenceScore > 75) riskLevel = 'Medium';

      const newResults = {
        estimatedCost,
        confidenceScore,
        similarProjects: matches,
        riskLevel,
        recommendations: [
          `Estimated cost is strongly tied to ${matches[0].name}.`,
          `Ensure ${target.technologyStack} engineers are available to meet the ${target.duration} month duration.`
        ]
      };

      setResults(newResults);
      toast.success('Analogy Search & Calculation Completed!');
      return newResults;

    } catch (err) {
      console.error(err);
      toast.error('Error calculating analogy');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalResults = results;
    if (!finalResults) {
      finalResults = calculateAnalogy();
    }

    if (!formData.projectName?.trim()) {
      toast.error('Please enter or select a project name');
      return;
    }

    if (!finalResults) return;

    setLoading(true);
    let finalProjectId = null;
    try {
      // 1. Resolve Project ID (Find existing or Create new)
      const existingProject = projects.find(p => p.name.toLowerCase() === formData.projectName.trim().toLowerCase());
      
      if (existingProject) {
        finalProjectId = existingProject._id;
      } else {
        const newProjectData = {
          name: formData.projectName.trim(),
          duration: formData.features.duration || 6,
          projectType: 'Software',
          teamSize: formData.features.teamSize || 3,
          complexityLevel: formData.features.complexity || 'Medium',
          laborCostPerHour: 50,
          materialCost: 0,
          equipmentCost: 0,
          miscExpenses: 0
        };
        const res = await api.post('/projects', newProjectData);
        finalProjectId = res.data.data._id;
      }

      const payload = {
        projectId: finalProjectId,
        features: formData.features,
        searchParams: formData.searchParams,
        results: finalResults,
        notes: formData.notes
      };

      await api.post('/analogy', payload);
      toast.success('Analogy Estimation saved successfully!');
      
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Analogy submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to save analysis');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F15] light-theme:bg-gray-50">
      <Navbar />
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white light-theme:text-gray-900">
            Analogy-Based Estimation
          </h1>
          <button
            type="button"
            onClick={() => calculateAnalogy()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Find Matches & Estimate
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
            <h2 className="text-white light-theme:text-gray-900 font-medium mb-4">Target Project</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Project Name</label>
                <input
                  type="text"
                  list="analogy-project-list"
                  placeholder="Select or type a new project..."
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
                <datalist id="analogy-project-list">
                  {projects.map(p => (
                    <option key={p._id} value={p.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Project Type</label>
                <select
                  value={formData.features.projectType}
                  onChange={(e) => handleFeatureChange('projectType', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="Web Application">Web Application</option>
                  <option value="Mobile Application">Mobile Application</option>
                  <option value="Data Engineering">Data Engineering</option>
                  <option value="API Service">API / Microservice</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Complexity</label>
                <select
                  value={formData.features.complexity}
                  onChange={(e) => handleFeatureChange('complexity', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="Low">Low - Standard CRUD</option>
                  <option value="Medium">Medium - Integrations/Auth</option>
                  <option value="High">High - Complex Algorithms/Data</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Primary Tech Stack</label>
                <input
                  type="text"
                  value={formData.features.technologyStack}
                  onChange={(e) => handleFeatureChange('technologyStack', e.target.value)}
                  placeholder="e.g. MERN, Django, Python"
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Est. Team Size</label>
                <input
                  type="number"
                  value={formData.features.teamSize}
                  onChange={(e) => handleFeatureChange('teamSize', parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Est. Duration (Months)</label>
                <input
                  type="number"
                  value={formData.features.duration}
                  onChange={(e) => handleFeatureChange('duration', parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
            <h2 className="text-white light-theme:text-gray-900 font-medium mb-4">Algorithm Constraints</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Minimum Similarity Threshold (%)</label>
                <input
                  type="number"
                  min="0" max="100"
                  value={formData.searchParams.minSimilarity}
                  onChange={(e) => setFormData(prev => ({...prev, searchParams: {...prev.searchParams, minSimilarity: parseInt(e.target.value) || 0}}))}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Results Area */}
          {results && (
            <div className="bg-gradient-to-r from-indigo-900/30 to-[#151A22] light-theme:from-indigo-50 light-theme:to-white rounded-lg border border-indigo-500/30 p-6">
              <h2 className="text-indigo-400 light-theme:text-indigo-600 font-medium mb-4">Analogy Engine Results</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Extrapolated Total Cost</p>
                  <p className="text-3xl font-bold text-emerald-400">${results.estimatedCost.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Confidence Score</p>
                  <p className="text-2xl font-semibold text-white light-theme:text-gray-900">{results.confidenceScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Risk Profile</p>
                  <span className={`inline-block px-3 py-1 mt-1 rounded text-sm font-medium
                    ${results.riskLevel === 'Low' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                    ${results.riskLevel === 'Medium' ? 'bg-amber-500/20 text-amber-400' : ''}
                    ${results.riskLevel === 'High' ? 'bg-rose-500/20 text-rose-400' : ''}
                  `}>
                    {results.riskLevel} Risk
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 light-theme:text-gray-700 mb-3">Historical Source Matches:</h3>
                <div className="space-y-3">
                  {results.similarProjects.map((match, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#0B0F15] light-theme:bg-gray-100 p-3 rounded border border-[#2A313C] light-theme:border-gray-200">
                      <div>
                        <p className="text-white light-theme:text-gray-900 font-medium text-sm">{match.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{match.type} • {match.complexity} • {match.stack}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-medium text-sm">${match.actualCost.toLocaleString()}</p>
                        <p className="text-xs text-indigo-400 mt-1">{match.similarityScore}% Match</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submission */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
             <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Reasoning or notes..."
              rows="2"
              className="w-full p-3 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !results}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Saving...' : 'Save Analogy Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnalogyEstimation;
