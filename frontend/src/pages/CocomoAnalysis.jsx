import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { useCurrency } from '../context/CurrencyContext';
import { useCocomo } from '../context/CocomoContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const CocomoAnalysis = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { addCocomoProject, cocomoProjects } = useCocomo(); // Use the COCOMO context
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  const [formData, setFormData] = useState({
    projectId: '',
    projectName: '', // Add project name for display
    modelType: 'semi-detached',
    sizeKloc: 10,
    laborRatePerMonth: 5000,
    scaleFactors: {
      prec: 3.72, // Precedentedness
      flex: 4.05, // Development Flexibility
      resl: 4.24, // Architecture/Risk Resolution
      team: 3.29, // Team Cohesion
      pmat: 4.68  // Process Maturity
    },
    costDrivers: {
      rely: 1.00,
      data: 1.00,
      cplx: 1.00,
      time: 1.00,
      stor: 1.00,
      pvol: 1.00,
      acap: 1.00,
      pcap: 1.00,
      pcon: 1.00,
      aexp: 1.00,
      plex: 1.00,
      ltex: 1.00,
      tool: 1.00,
      site: 1.00,
      sced: 1.00
    },
    notes: ''
  });

  // Load projects from API
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const response = await api.get('/projects?limit=100');
      let loadedProjects = response.data.data || [];

      // If the user's database has 0 projects, provide sample options
      if (loadedProjects.length === 0) {
        loadedProjects = [
          { _id: 'sample-1', name: 'Sample: E-commerce Platform' },
          { _id: 'sample-2', name: 'Sample: Mobile App Development' },
          { _id: 'sample-3', name: 'Sample: CRM System' }
        ];
      }

      setProjects(loadedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      // Set dummy projects for testing
      setProjects([
        { _id: 'sample-1', name: 'Sample: E-commerce Platform' },
        { _id: 'sample-2', name: 'Sample: Mobile App Development' },
        { _id: 'sample-3', name: 'Sample: CRM System' }
      ]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleCostDriverChange = (driver, value) => {
    setFormData({
      ...formData,
      costDrivers: {
        ...formData.costDrivers,
        [driver]: parseFloat(value)
      }
    });
  };

  const handleScaleFactorChange = (factor, value) => {
    setFormData({
      ...formData,
      scaleFactors: {
        ...formData.scaleFactors,
        [factor]: parseFloat(value)
      }
    });
  };

  const calculateCocomo = () => {
    try {
      // COCOMO II calculation
      // COCOMO II calculation constants
      const A = 2.94;
      const B = 0.91;

      // Scale factors weights
      const sfWeights = {
        prec: 0.01, flex: 0.01, resl: 0.01, team: 0.01, pmat: 0.01
      };

      // Calculate exponent E
      const sfSum = Object.entries(formData.scaleFactors).reduce(
        (sum, [key, value]) => sum + (value * sfWeights[key]), 0
      );
      const E = B + 0.01 * sfSum;

      // Calculate effort multiplier product
      const emProduct = Object.values(formData.costDrivers).reduce(
        (product, value) => product * value, 1.0
      );

      // Calculate effort
      const effort = A * Math.pow(formData.sizeKloc, E) * emProduct;

      // Calculate time
      const C = 3.67;
      const D = 0.28;
      const F = D + 0.2 * (E - B);
      const time = C * Math.pow(effort, F);

      // Calculate staff and cost
      const staff = effort / time;
      const cost = effort * formData.laborRatePerMonth;

      // Phase distribution
      const distributions = {
        organic: { plans: 0.06, design: 0.16, prog: 0.68, test: 0.10 },
        'semi-detached': { plans: 0.07, design: 0.17, prog: 0.64, test: 0.12 },
        embedded: { plans: 0.08, design: 0.18, prog: 0.60, test: 0.14 }
      };
      const dist = distributions[formData.modelType];

      const newResults = {
        effort: Math.round(effort * 100) / 100,
        time: Math.round(time * 100) / 100,
        staff: Math.round(staff * 10) / 10,
        cost: Math.round(cost * 100) / 100,
        productivity: Math.round((formData.sizeKloc * 1000) / effort),
        parameters: {
          E: Math.round(E * 1000) / 1000,
          F: Math.round(F * 1000) / 1000,
          sfSum: Math.round(sfSum * 100) / 100,
          emProduct: Math.round(emProduct * 100) / 100
        },
        phases: {
          plansAndRequirements: Math.round(effort * dist.plans * 100) / 100,
          productDesign: Math.round(effort * dist.design * 100) / 100,
          programming: Math.round(effort * dist.prog * 100) / 100,
          integrationAndTest: Math.round(effort * dist.test * 100) / 100
        },
        confidence: {
          low: Math.round(effort * 0.8 * 100) / 100,
          high: Math.round(effort * 1.2 * 100) / 100
        }
      };

      setResults(newResults);
      toast.success('Calculation completed!');

      return newResults;
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Error in calculation');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate first if not calculated
    let finalResults = results;
    if (!finalResults) {
      finalResults = calculateCocomo();
    }

    if (!formData.projectName?.trim()) {
      toast.error('Please enter or select a project name');
      return;
    }

    if (!finalResults) {
      toast.error('Please calculate results first');
      return;
    }

    setLoading(true);
    let finalProjectId = null;
    try {
      // Find existing project by name
      const existingProject = projects.find(p => p.name.toLowerCase() === formData.projectName.trim().toLowerCase());

      if (existingProject) {
        finalProjectId = existingProject._id;
      } else {
        // Create new project implicitly
        const newProjectData = {
          name: formData.projectName.trim(),
          duration: 1,
          projectType: 'Software',
          teamSize: 1,
          complexityLevel: 'Medium',
          laborCostPerHour: formData.laborRatePerMonth / 160 || 50,
          materialCost: 0,
          equipmentCost: 0,
          miscExpenses: 0
        };
        const res = await api.post('/projects', newProjectData);
        finalProjectId = res.data.data._id;
      }

      // Create COCOMO project data
      const cocomoData = {
        id: Date.now().toString(),
        name: formData.projectName.trim() || `COCOMO Project`,
        projectId: finalProjectId,
        modelType: formData.modelType,
        sizeKloc: formData.sizeKloc,
        laborRatePerMonth: formData.laborRatePerMonth,
        scaleFactors: formData.scaleFactors,
        costDrivers: formData.costDrivers,
        effort: finalResults.effort,
        schedule: finalResults.time,
        staff: finalResults.staff,
        totalCost: finalResults.cost,
        productivity: finalResults.productivity,
        status: 'draft',
        createdAt: new Date(),
        notes: formData.notes
      };

      // Add to COCOMO context (this will update the dashboard in real-time)
      addCocomoProject(cocomoData);

      // Save to API
      await api.post('/cocomo', cocomoData);

      toast.success('COCOMO analysis created and saved to history!');

      // Navigate back to dashboard to see the updated data
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('COCOMO submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to create analysis');
    } finally {
      setLoading(false);
    }
  };

  // Example data for quick testing
  const loadExampleData = () => {
    setFormData({
      ...formData,
      projectId: projects[0]?._id || '',
      modelType: 'semi-detached',
      sizeKloc: 25,
      laborRatePerMonth: 6000,
      scaleFactors: {
        prec: 4.96, // High
        flex: 3.04, // Low
        resl: 2.83, // Low
        team: 3.29, // Nominal
        pmat: 6.24  // High
      }
    });

    // Auto-calculate after setting data
    setTimeout(() => calculateCocomo(), 100);
  };

  return (
    <div className="min-h-screen bg-[#05070A] light-theme:bg-gray-50 relative overflow-hidden">
      {/* Ambient Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <Navbar />
      <motion.div className="container-custom py-8 relative z-10" variants={pageVariants} initial="hidden" animate="visible">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-indigo-400">
            COCOMO II Analysis
          </h1>
          <button
            onClick={loadExampleData}
            className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm hover:bg-emerald-500/20 transition-all font-medium"
          >
            Load Example
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection and Basic Parameters */}
          <div className="glass-panel p-6">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2">
              <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded">1</span>
              Basic Parameters
            </h2>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Project Name</label>
                <input
                  type="text"
                  list="cocomo-project-list"
                  placeholder="Select or type a new project..."
                  value={formData.projectName || ''}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  className="premium-input"
                />
                <datalist id="cocomo-project-list">
                  {projects.map(p => (
                    <option key={p._id} value={p.name} />
                  ))}
                </datalist>
                {loadingProjects && <p className="text-xs text-gray-500 mt-1">Loading projects...</p>}
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Model Type</label>
                <select
                  value={formData.modelType}
                  onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
                  className="premium-input"
                >
                  <option value="organic">Organic (Small teams, familiar)</option>
                  <option value="semi-detached">Semi-detached (Medium)</option>
                  <option value="embedded">Embedded (Complex, constraints)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Size (KLOC)</label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.sizeKloc}
                  onChange={(e) => setFormData({ ...formData, sizeKloc: parseFloat(e.target.value) || 0 })}
                  className="premium-input text-center"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">Labor Rate ($/month)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={formData.laborRatePerMonth}
                  onChange={(e) => setFormData({ ...formData, laborRatePerMonth: parseFloat(e.target.value) || 0 })}
                  className="premium-input text-center"
                />
              </div>
            </div>
          </div>

          {/* Scale Factors */}
          <div className="glass-panel p-6">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2">
              <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded">2</span>
              Scale Factors
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">PREC - Precedentedness</label>
                <input
                  type="range"
                  min="0"
                  max="6.20"
                  step="0.01"
                  value={formData.scaleFactors.prec}
                  onChange={(e) => handleScaleFactorChange('prec', e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{formData.scaleFactors.prec}</span>
                  <span className="text-xs text-gray-500">Very High: 6.20</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">FLEX - Development Flexibility</label>
                <input
                  type="range"
                  min="0"
                  max="6.07"
                  step="0.01"
                  value={formData.scaleFactors.flex}
                  onChange={(e) => handleScaleFactorChange('flex', e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{formData.scaleFactors.flex}</span>
                  <span className="text-xs text-gray-500">Very High: 6.07</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">RESL - Architecture/Risk Resolution</label>
                <input
                  type="range"
                  min="0"
                  max="7.07"
                  step="0.01"
                  value={formData.scaleFactors.resl}
                  onChange={(e) => handleScaleFactorChange('resl', e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{formData.scaleFactors.resl}</span>
                  <span className="text-xs text-gray-500">Very High: 7.07</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">TEAM - Team Cohesion</label>
                <input
                  type="range"
                  min="0"
                  max="5.48"
                  step="0.01"
                  value={formData.scaleFactors.team}
                  onChange={(e) => handleScaleFactorChange('team', e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{formData.scaleFactors.team}</span>
                  <span className="text-xs text-gray-500">Very High: 5.48</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">PMAT - Process Maturity</label>
                <input
                  type="range"
                  min="0"
                  max="7.80"
                  step="0.01"
                  value={formData.scaleFactors.pmat}
                  onChange={(e) => handleScaleFactorChange('pmat', e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">{formData.scaleFactors.pmat}</span>
                  <span className="text-xs text-gray-500">Very High: 7.80</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Drivers */}
          <div className="glass-panel p-6">
            <h2 className="text-white font-medium mb-4 flex items-center gap-2">
              <span className="p-1 bg-indigo-500/20 text-indigo-400 rounded">3</span>
              Cost Drivers
            </h2>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">RELY - Reliability</label>
                <select
                  value={formData.costDrivers.rely}
                  onChange={(e) => handleCostDriverChange('rely', e.target.value)}
                  className="w-full p-2 bg-[#0B0F15] border border-[#2A313C]/50 rounded text-white text-xs focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                >
                  <option value="0.75">Very Low (0.75)</option>
                  <option value="0.88">Low (0.88)</option>
                  <option value="1.00">Nominal (1.00)</option>
                  <option value="1.15">High (1.15)</option>
                  <option value="1.40">Very High (1.40)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">CPLX - Complexity</label>
                <select
                  value={formData.costDrivers.cplx}
                  onChange={(e) => handleCostDriverChange('cplx', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="0.70">Very Low (0.70)</option>
                  <option value="0.85">Low (0.85)</option>
                  <option value="1.00">Nominal (1.00)</option>
                  <option value="1.15">High (1.15)</option>
                  <option value="1.30">Very High (1.30)</option>
                  <option value="1.65">Extra High (1.65)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">TIME - Time Constraint</label>
                <select
                  value={formData.costDrivers.time}
                  onChange={(e) => handleCostDriverChange('time', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="1.00">Nominal (1.00)</option>
                  <option value="1.11">High (1.11)</option>
                  <option value="1.30">Very High (1.30)</option>
                  <option value="1.66">Extra High (1.66)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">ACAP - Analyst Capability</label>
                <select
                  value={formData.costDrivers.acap}
                  onChange={(e) => handleCostDriverChange('acap', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="1.42">Very Low (1.42)</option>
                  <option value="1.19">Low (1.19)</option>
                  <option value="1.00">Nominal (1.00)</option>
                  <option value="0.85">High (0.85)</option>
                  <option value="0.71">Very High (0.71)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">PCAP - Programmer Capability</label>
                <select
                  value={formData.costDrivers.pcap}
                  onChange={(e) => handleCostDriverChange('pcap', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="1.34">Very Low (1.34)</option>
                  <option value="1.15">Low (1.15)</option>
                  <option value="1.00">Nominal (1.00)</option>
                  <option value="0.88">High (0.88)</option>
                  <option value="0.76">Very High (0.76)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 light-theme:text-gray-600 mb-1 block">TOOL - Software Tools</label>
                <select
                  value={formData.costDrivers.tool}
                  onChange={(e) => handleCostDriverChange('tool', e.target.value)}
                  className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900"
                >
                  <option value="1.17">Very Low (1.17)</option>
                  <option value="1.09">Low (1.09)</option>
                  <option value="1.00">Nominal (1.00)</option>
                  <option value="0.90">High (0.90)</option>
                  <option value="0.78">Very High (0.78)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-end gap-3">
             <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes for this estimate..."
              rows="1"
              className="premium-input flex-1"
            />
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="premium-btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="premium-btn-primary"
            >
              ⚡ {loading ? 'Saving...' : 'Save & Calculate'}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="bg-gradient-to-r from-emerald-900/30 to-[#151A22] light-theme:from-emerald-50 light-theme:to-white rounded-2xl border border-emerald-500/30 p-6 shadow-2xl">
              <h2 className="text-white light-theme:text-gray-900 font-medium mb-4">COCOMO Results</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-600">Effort (person-months)</p>
                  <p className="text-xl text-white light-theme:text-gray-900 font-semibold">{results.effort}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-600">Time (months)</p>
                  <p className="text-xl text-white light-theme:text-gray-900 font-semibold">{results.time}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-600">Average Staff</p>
                  <p className="text-xl text-white light-theme:text-gray-900 font-semibold">{results.staff}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 light-theme:text-gray-600">Cost</p>
                  <p className="text-xl text-emerald-400 font-semibold">{formatCurrency(results.cost)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm text-gray-300 light-theme:text-gray-700 mb-2">Phase Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 light-theme:text-gray-600">Plans & Requirements</span>
                      <span className="text-white light-theme:text-gray-900">{results.phases.plansAndRequirements} pm</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 light-theme:text-gray-600">Product Design</span>
                      <span className="text-white light-theme:text-gray-900">{results.phases.productDesign} pm</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 light-theme:text-gray-600">Programming</span>
                      <span className="text-white light-theme:text-gray-900">{results.phases.programming} pm</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 light-theme:text-gray-600">Integration & Test</span>
                      <span className="text-white light-theme:text-gray-900">{results.phases.integrationAndTest} pm</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-gray-300 light-theme:text-gray-700 mb-2">Confidence Interval (75%)</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 light-theme:text-gray-600">Low</span>
                      <span className="text-white light-theme:text-gray-900">{results.confidence.low} pm</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 light-theme:text-gray-600">High</span>
                      <span className="text-white light-theme:text-gray-900">{results.confidence.high} pm</span>
                    </div>
                    <div className="flex justify-between text-xs pt-2 border-t border-gray-700">
                      <span className="text-gray-400 light-theme:text-gray-600">Productivity</span>
                      <span className="text-white light-theme:text-gray-900">{results.productivity} LOC/pm</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-[#0B0F15] light-theme:bg-gray-50 rounded-md">
                <p className="text-xs text-gray-400 light-theme:text-gray-600">
                  Parameters: E = {results.parameters.E}, F = {results.parameters.F},
                  SF Sum = {results.parameters.sfSum}, EM Product = {results.parameters.emProduct}
                </p>
              </div>
            </div>
          )}

          {/* Notes and Submit */}
          <div className="bg-[#151A22] light-theme:bg-white rounded-lg border border-[#2A313C] light-theme:border-gray-200 p-6">
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows="3"
              className="w-full p-2 bg-[#1E252E] light-theme:bg-white border border-[#2A313C] light-theme:border-gray-200 rounded-md text-white light-theme:text-gray-900 mb-4"
            />

            <div className="flex gap-3">
              <motion.button
                type="submit"
                disabled={loading || !results}
                whileHover={!loading && results ? { scale: 1.02 } : {}}
                whileTap={!loading && results ? { scale: 0.98 } : {}}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium shadow-lg shadow-indigo-500/20 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : 'Save & Update Dashboard'}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2.5 bg-[#1E252E] text-gray-300 rounded-md hover:bg-[#2A313C] border border-[#2A313C] transition-colors"
              >
                Back to Dashboard
              </motion.button>
            </div>

            {results && (
              <p className="text-xs text-emerald-400 mt-3 text-center">
                ✓ Click "Save & Update Dashboard" to see real-time updates
              </p>
            )}
          </div>
        </form>

        {/* Example of how dashboard updates */}
        {cocomoProjects.length > 0 && (
          <div className="mt-6 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-lg">
            <p className="text-sm text-indigo-400">
              📊 Dashboard Status: {cocomoProjects.length} COCOMO project(s) saved
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CocomoAnalysis;