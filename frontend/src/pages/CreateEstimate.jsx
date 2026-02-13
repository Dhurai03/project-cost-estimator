import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';
import { useCurrency } from '../context/CurrencyContext'; // ✅ ADD THIS
import toast from 'react-hot-toast';

const PROJECT_TYPES = [
  { value: 'Software', label: 'Software', icon: '💻' },
  { value: 'Construction', label: 'Construction', icon: '🏗️' },
  { value: 'Event', label: 'Event', icon: '🎉' },
  { value: 'Manufacturing', label: 'Manufacturing', icon: '🏭' }
];

const COMPLEXITY_LEVELS = [
  { value: 'Low', label: 'Low', icon: '🟢' },
  { value: 'Medium', label: 'Medium', icon: '🟡' },
  { value: 'High', label: 'High', icon: '🔴' }
];

const CreateEstimate = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { createEstimate } = useEstimates();
  const { formatCurrency } = useCurrency(); // ✅ ADD THIS
  
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    projectType: '',
    teamSize: '',
    complexityLevel: '',
    laborCostPerHour: '',
    materialCost: '',
    equipmentCost: '',
    miscExpenses: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [calculatedCost, setCalculatedCost] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateEstimate = () => {
    const requiredFields = [
      'name', 'duration', 'projectType', 'teamSize', 
      'complexityLevel', 'laborCostPerHour', 'materialCost',
      'equipmentCost', 'miscExpenses'
    ];

    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const duration = parseFloat(formData.duration);
    const teamSize = parseFloat(formData.teamSize);
    const laborCostPerHour = parseFloat(formData.laborCostPerHour);
    const materialCost = parseFloat(formData.materialCost);
    const equipmentCost = parseFloat(formData.equipmentCost);
    const miscExpenses = parseFloat(formData.miscExpenses);
    
    const WORK_HOURS_PER_MONTH = 160;
    const totalWorkHours = duration * WORK_HOURS_PER_MONTH;
    const baseLaborCost = teamSize * totalWorkHours * laborCostPerHour;
    
    const complexityMultiplier = {
      'Low': 1.0,
      'Medium': 1.2,
      'High': 1.5
    }[formData.complexityLevel] || 1.0;
    
    const laborCost = baseLaborCost * complexityMultiplier;
    
    const projectTypeMultiplier = {
      'Software': 1.0,
      'Construction': 1.3,
      'Event': 0.9,
      'Manufacturing': 1.1
    }[formData.projectType] || 1.0;
    
    const adjustedMaterialCost = materialCost * projectTypeMultiplier;
    const adjustedEquipmentCost = equipmentCost * projectTypeMultiplier;
    const adjustedMiscCost = miscExpenses * projectTypeMultiplier;
    
    const totalCost = laborCost + adjustedMaterialCost + adjustedEquipmentCost + adjustedMiscCost;

    console.log('✅ Calculation:', {
      duration,
      teamSize,
      laborCostPerHour,
      totalWorkHours,
      baseLaborCost,
      complexityMultiplier,
      laborCost,
      projectTypeMultiplier,
      adjustedMaterialCost,
      adjustedEquipmentCost,
      adjustedMiscCost,
      totalCost
    });

    setCalculatedCost({
      laborCost,
      materialCost: adjustedMaterialCost,
      equipmentCost: adjustedEquipmentCost,
      miscCost: adjustedMiscCost,
      totalCost
    });
    
    toast.success('Estimate calculated successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!calculatedCost) {
      toast.error('Please calculate the estimate first');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📝 Creating project with data:', {
        ...formData,
        duration: parseFloat(formData.duration),
        teamSize: parseFloat(formData.teamSize),
        laborCostPerHour: parseFloat(formData.laborCostPerHour),
        materialCost: parseFloat(formData.materialCost),
        equipmentCost: parseFloat(formData.equipmentCost),
        miscExpenses: parseFloat(formData.miscExpenses)
      });

      const project = await createProject({
        ...formData,
        duration: parseFloat(formData.duration),
        teamSize: parseFloat(formData.teamSize),
        laborCostPerHour: parseFloat(formData.laborCostPerHour),
        materialCost: parseFloat(formData.materialCost),
        equipmentCost: parseFloat(formData.equipmentCost),
        miscExpenses: parseFloat(formData.miscExpenses)
      });

      console.log('✅ Project created:', project);

      const estimate = await createEstimate(project._id, formData.notes);
      
      console.log('✅ Estimate created:', estimate);
      
      toast.success('Estimate created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Failed to create estimate:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create estimate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F15]">
      <Navbar />
      
      <div className="container-custom py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Create New Estimate</h1>
            <p className="text-gray-400 text-sm">Fill in the project details to generate a cost estimate.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Information */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-6">
              <h2 className="text-white font-medium text-sm mb-5">Project Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., E-commerce Platform"
                    required
                  />
                </div>
                
                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Duration (months)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., 6"
                    min="1"
                    required
                  />
                </div>
                
                {/* Project Type */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Project Type
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PROJECT_TYPES.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, projectType: type.value})}
                        className={`p-3 rounded-lg border transition-all duration-200
                          ${formData.projectType === type.value
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-[#1E252E] border-[#2A313C] text-gray-400 hover:border-indigo-500 hover:text-white'
                          }`}
                      >
                        <span className="text-xl block mb-1">{type.icon}</span>
                        <span className="text-xs font-medium">{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Team Size */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Team Size
                  </label>
                  <input
                    type="number"
                    name="teamSize"
                    value={formData.teamSize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., 5"
                    min="1"
                    required
                  />
                </div>
                
                {/* Complexity Level */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Complexity Level
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {COMPLEXITY_LEVELS.map(level => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setFormData({...formData, complexityLevel: level.value})}
                        className={`p-3 rounded-lg border transition-all duration-200
                          ${formData.complexityLevel === level.value
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-[#1E252E] border-[#2A313C] text-gray-400 hover:border-indigo-500 hover:text-white'
                          }`}
                      >
                        <span className="text-xl block mb-1">{level.icon}</span>
                        <span className="text-xs font-medium">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Inputs */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-6">
              <h2 className="text-white font-medium text-sm mb-5">Cost Inputs</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Labor Cost / Hour ($)
                  </label>
                  <input
                    type="number"
                    name="laborCostPerHour"
                    value={formData.laborCostPerHour}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., 50"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Material Cost ($)
                  </label>
                  <input
                    type="number"
                    name="materialCost"
                    value={formData.materialCost}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., 10000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Equipment Cost ($)
                  </label>
                  <input
                    type="number"
                    name="equipmentCost"
                    value={formData.equipmentCost}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., 5000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Miscellaneous ($)
                  </label>
                  <input
                    type="number"
                    name="miscExpenses"
                    value={formData.miscExpenses}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    placeholder="e.g., 2000"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={calculateEstimate}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                           text-white text-sm font-medium rounded-md
                           transition-all duration-200
                           focus:ring-4 focus:ring-indigo-600/20 focus:outline-none"
                >
                  Calculate Estimate
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            {calculatedCost && (
              <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-6">
                <h2 className="text-white font-medium text-sm mb-5">Cost Breakdown</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-[#1E252E] rounded-md border border-[#2A313C]">
                      <span className="text-xs text-gray-400">Labor Cost:</span>
                      <span className="text-xs font-semibold text-indigo-400">
                        {formatCurrency(calculatedCost.laborCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-[#1E252E] rounded-md border border-[#2A313C]">
                      <span className="text-xs text-gray-400">Material Cost:</span>
                      <span className="text-xs font-semibold text-indigo-400">
                        {formatCurrency(calculatedCost.materialCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-[#1E252E] rounded-md border border-[#2A313C]">
                      <span className="text-xs text-gray-400">Equipment Cost:</span>
                      <span className="text-xs font-semibold text-indigo-400">
                        {formatCurrency(calculatedCost.equipmentCost)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-[#1E252E] rounded-md border border-[#2A313C]">
                      <span className="text-xs text-gray-400">Misc Cost:</span>
                      <span className="text-xs font-semibold text-indigo-400">
                        {formatCurrency(calculatedCost.miscCost)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-[#1E252E] rounded-lg p-5 flex flex-col justify-center items-center border border-indigo-500/30">
                    <span className="text-xs text-gray-400 mb-1">Total Estimated Cost</span>
                    <span className="text-2xl font-bold text-indigo-400 mb-1">
                      {formatCurrency(calculatedCost.totalCost)}
                    </span>
                    <span className="text-xs text-gray-500">including all costs</span>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                             text-white text-sm placeholder-gray-500
                             focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                             outline-none transition-all duration-200"
                    rows="3"
                    placeholder="Add any additional notes or comments..."
                  ></textarea>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setCalculatedCost(null)}
                    className="px-5 py-2.5 bg-[#1E252E] hover:bg-[#2A313C] 
                             text-gray-300 text-sm font-medium rounded-md
                             border border-[#2A313C] transition-all duration-200
                             focus:ring-4 focus:ring-gray-600/20 focus:outline-none"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                             text-white text-sm font-medium rounded-md
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                             focus:ring-4 focus:ring-indigo-600/20 focus:outline-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      'Create Estimate'
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEstimate;