import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const FunctionPointAnalysis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Initialize all complex structures
  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '',
    laborRatePerHour: 50,
    languageMultiplier: 50, // Default LOC per FP (e.g., Java/C#)
    functionCounts: {
      externalInputs: { simple: 0, average: 0, complex: 0 },
      externalOutputs: { simple: 0, average: 0, complex: 0 },
      externalInquiries: { simple: 0, average: 0, complex: 0 },
      internalFiles: { simple: 0, average: 0, complex: 0 },
      externalInterfaces: { simple: 0, average: 0, complex: 0 }
    },
    valueAdjustmentFactors: {
      dataCommunications: 3,
      distributedFunctions: 3,
      performance: 3,
      heavilyUsedConfig: 3,
      transactionRate: 3,
      onlineDataEntry: 3,
      endUserEfficiency: 3,
      onlineUpdate: 3,
      complexProcessing: 3,
      reusability: 3,
      installationEase: 3,
      operationalEase: 3,
      multipleSites: 3,
      facilitateChange: 3
    },
    notes: ''
  });

  // Weights per standard IFPUG methodology
  const weights = {
    externalInputs: { simple: 3, average: 4, complex: 6 },
    externalOutputs: { simple: 4, average: 5, complex: 7 },
    externalInquiries: { simple: 3, average: 4, complex: 6 },
    internalFiles: { simple: 7, average: 10, complex: 15 },
    externalInterfaces: { simple: 5, average: 7, complex: 10 }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await api.get('/projects?limit=100');
      let loadedProjects = response.data.data || [];
      
      if (loadedProjects.length === 0) {
        loadedProjects = [
          { _id: 'sample-1', name: 'Sample: E-commerce Platform' }
        ];
      }
      setProjects(loadedProjects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleFuncCountChange = (category, complexity, value) => {
    setFormData(prev => ({
      ...prev,
      functionCounts: {
        ...prev.functionCounts,
        [category]: {
          ...prev.functionCounts[category],
          [complexity]: parseInt(value) || 0
        }
      }
    }));
  };

  const handleVAFChange = (factor, value) => {
    setFormData(prev => ({
      ...prev,
      valueAdjustmentFactors: {
        ...prev.valueAdjustmentFactors,
        [factor]: parseInt(value) || 0
      }
    }));
  };

  const calculateFPA = () => {
    try {
      // 1. Calculate Unadjusted Function Points (UFP)
      let ufp = 0;
      Object.keys(formData.functionCounts).forEach(category => {
        Object.keys(formData.functionCounts[category]).forEach(complexity => {
          const count = formData.functionCounts[category][complexity];
          const weight = weights[category][complexity];
          ufp += count * weight;
        });
      });

      // 2. Calculate Total Degree of Influence (TDI)
      const tdi = Object.values(formData.valueAdjustmentFactors).reduce((sum, val) => sum + val, 0);

      // 3. Calculate Value Adjustment Factor (VAF)
      const vaf = 0.65 + (0.01 * tdi);

      // 4. Calculate Adjusted Function Points (AFP)
      const afp = ufp * vaf;

      // 5. Estimate LOC
      const loc = afp * formData.languageMultiplier;

      // 6. Estimate Effort (Basic assumption: 1 FP takes roughly 8-10 hours depending on team)
      // We will use 10 hours per FP as a baseline
      const effortHours = afp * 10;
      
      // 7. Estimate Cost
      const cost = effortHours * formData.laborRatePerHour;

      const newResults = {
        unadjustedFunctionPoints: Math.round(ufp),
        totalDegreeOfInfluence: tdi,
        valueAdjustmentFactor: Math.round(vaf * 100) / 100,
        adjustedFunctionPoints: Math.round(afp),
        estimatedLinesOfCode: Math.round(loc),
        estimatedEffort: Math.round(effortHours),
        estimatedCost: Math.round(cost * 100) / 100
      };

      setResults(newResults);
      toast.success('FPA Calculation Completed!');
      return newResults;
    } catch (err) {
      console.error(err);
      toast.error('Error during calculation');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    let finalResults = results;
    if (!finalResults) {
      finalResults = calculateFPA();
    }

    if (!formData.projectName?.trim()) {
      toast.error('Please enter or select a project name');
      return;
    }

    if (!finalResults) {
      return; // Validation failed inside calculateFPA
    }

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
          duration: 1,
          projectType: 'Software',
          teamSize: 1,
          complexityLevel: 'Medium',
          laborCostPerHour: formData.laborRatePerHour || 50,
          materialCost: 0,
          equipmentCost: 0,
          miscExpenses: 0
        };
        const res = await api.post('/projects', newProjectData);
        finalProjectId = res.data.data._id;
      }

      // 2. Structure payload for backend
      const payload = {
        projectId: finalProjectId,
        functionCounts: formData.functionCounts,
        valueAdjustmentFactors: formData.valueAdjustmentFactors,
        language: formData.language || 'Default',
        ratePerHour: formData.laborRatePerHour,
        notes: formData.notes
      };

      await api.post('/function-points', payload);
      toast.success('Function Point Analysis saved successfully!');
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('FPA submission error:', error);
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
            Function Point Analysis (FPA)
          </h1>
          <button
            type="button"
            onClick={() => calculateFPA()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Calculate FPA
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Top Section: Project and Basic settings */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
            <h2 className="text-white light-theme:text-gray-900 font-medium mb-4">Project Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Project Name</label>
                <input
                  type="text"
                  list="project-list"
                  placeholder="Select or type a new project..."
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
                <datalist id="project-list">
                  {projects.map(p => (
                    <option key={p._id} value={p.name} />
                  ))}
                </datalist>
              </div>
              
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Labor Rate ($/hour)</label>
                <input
                  type="number"
                  value={formData.laborRatePerHour}
                  onChange={(e) => setFormData({...formData, laborRatePerHour: parseFloat(e.target.value) || 0})}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Language (Avg LOC per FP)</label>
                <select
                  value={formData.languageMultiplier}
                  onChange={(e) => setFormData({...formData, languageMultiplier: parseFloat(e.target.value) || 50})}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="53">Java (53 LOC/FP)</option>
                  <option value="50">C# (50 LOC/FP)</option>
                  <option value="40">Python (40 LOC/FP)</option>
                  <option value="128">C (128 LOC/FP)</option>
                  <option value="20">SQL (20 LOC/FP)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Function Point Counts */}
            <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
               <h2 className="text-white light-theme:text-gray-900 font-medium mb-4">Function Counts</h2>
               <p className="text-xs text-gray-400 mb-6">Enter the quantity of functions identified in each category based on complexity.</p>
               
               <div className="space-y-6">
                 {[
                   { key: 'externalInputs', label: 'External Inputs (EI)' },
                   { key: 'externalOutputs', label: 'External Outputs (EO)' },
                   { key: 'externalInquiries', label: 'External Inquiries (EQ)' },
                   { key: 'internalFiles', label: 'Internal Logical Files (ILF)' },
                   { key: 'externalInterfaces', label: 'External Interface Files (EIF)' }
                 ].map(category => (
                   <div key={category.key} className="border-b border-[#2A313C] pb-4 last:border-0 last:pb-0">
                     <p className="text-sm font-medium text-gray-300 light-theme:text-gray-700 mb-2">{category.label}</p>
                     <div className="grid grid-cols-3 gap-3">
                       {['simple', 'average', 'complex'].map(complexity => (
                         <div key={complexity}>
                           <label className="text-[10px] uppercase text-gray-500 block mb-1">{complexity}</label>
                           <input
                             type="number"
                             min="0"
                             value={formData.functionCounts[category.key][complexity]}
                             onChange={(e) => handleFuncCountChange(category.key, complexity, e.target.value)}
                             className="w-full text-center p-1.5 bg-[#1E252E] light-theme:bg-gray-50 border border-[#2A313C] light-theme:border-gray-200 rounded text-white light-theme:text-gray-900 text-sm"
                           />
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Value Adjustment Factors */}
            <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white light-theme:text-gray-900 font-medium">Value Adjustment Factors (GSCs)</h2>
                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">Scale: 0-5</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {[
                  { key: 'dataCommunications', label: 'Data Communications' },
                  { key: 'distributedFunctions', label: 'Distributed Functions' },
                  { key: 'performance', label: 'Performance' },
                  { key: 'heavilyUsedConfig', label: 'Heavily Used Config' },
                  { key: 'transactionRate', label: 'Transaction Rate' },
                  { key: 'onlineDataEntry', label: 'Online Data Entry' },
                  { key: 'endUserEfficiency', label: 'End User Efficiency' },
                  { key: 'onlineUpdate', label: 'Online Update' },
                  { key: 'complexProcessing', label: 'Complex Processing' },
                  { key: 'reusability', label: 'Reusability' },
                  { key: 'installationEase', label: 'Installation Ease' },
                  { key: 'operationalEase', label: 'Operational Ease' },
                  { key: 'multipleSites', label: 'Multiple Sites' },
                  { key: 'facilitateChange', label: 'Facilitate Change' }
                ].map(factor => (
                  <div key={factor.key} className="flex justify-between items-center border-b border-[#2A313C]/50 light-theme:border-gray-100 pb-2">
                    <label className="text-xs text-gray-300 light-theme:text-gray-700 truncate pr-2" title={factor.label}>
                      {factor.label}
                    </label>
                    <select
                      value={formData.valueAdjustmentFactors[factor.key]}
                      onChange={(e) => handleVAFChange(factor.key, e.target.value)}
                      className="w-14 p-1 text-center bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded text-white light-theme:text-gray-900 text-xs"
                    >
                      {[0,1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Results Area */}
          {results && (
            <div className="bg-gradient-to-r from-emerald-900/30 to-[#151A22] light-theme:from-emerald-50 light-theme:to-white rounded-lg border border-emerald-500/30 p-6">
              <h2 className="text-emerald-400 light-theme:text-emerald-600 font-medium mb-4">Total Estimates</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Unadjusted FP (UFP)</p>
                  <p className="text-xl font-semibold text-white light-theme:text-gray-900">{results.unadjustedFunctionPoints}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Adjusted FP (AFP)</p>
                  <p className="text-xl font-semibold text-white light-theme:text-gray-900">{results.adjustedFunctionPoints}</p>
                  <p className="text-[10px] text-emerald-400 mt-1">Multiplier: {results.valueAdjustmentFactor}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Est. Effort</p>
                  <p className="text-xl font-semibold text-white light-theme:text-gray-900">{results.estimatedEffort} <span className="text-sm font-normal text-gray-500">hrs</span></p>
                  <p className="text-[10px] text-gray-500 mt-1">{results.estimatedLinesOfCode} est. LOC</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-500 mb-1">Total Estimated Cost</p>
                  <p className="text-2xl font-bold text-emerald-400">${results.estimatedCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}

          {/* Submission */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
             <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes for this estimate..."
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
                {loading ? 'Saving...' : 'Save FPA Report'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FunctionPointAnalysis;
