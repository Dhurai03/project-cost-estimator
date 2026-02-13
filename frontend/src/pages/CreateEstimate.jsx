import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useProjects } from '../hooks/useProjects';
import { useEstimates } from '../hooks/useEstimates';
import { useCurrency } from '../context/CurrencyContext';
import { useData } from '../context/DataContext';
import toast from 'react-hot-toast';

// Heroicons as components
const Icons = {
  // Project type icons
  Software: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Construction: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Event: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
    </svg>
  ),
  Manufacturing: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21H5a1 1 0 01-1-1v-9M3 3l3 6m0 0l3-6m-3 6h14M5 21h14a1 1 0 001-1v-9M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
    </svg>
  ),
  
  // Complexity level icons
  Low: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 10l7-7 7 7M5 14l7 7 7-7" />
    </svg>
  ),
  Medium: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12l4-4m-4 4l4 4" />
    </svg>
  ),
  High: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7-7-7M19 10l-7-7-7 7" />
    </svg>
  ),
  
  // Form icons
  ProjectName: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  Duration: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TeamSize: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Labor: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Material: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Equipment: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Misc: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  ),
  Notes: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Calculate: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  Back: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Create: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
    </svg>
  )
};

const PROJECT_TYPES = [
  { value: 'Software', label: 'Software', icon: <Icons.Software /> },
  { value: 'Construction', label: 'Construction', icon: <Icons.Construction /> },
  { value: 'Event', label: 'Event', icon: <Icons.Event /> },
  { value: 'Manufacturing', label: 'Manufacturing', icon: <Icons.Manufacturing /> }
];

const COMPLEXITY_LEVELS = [
  { value: 'Low', label: 'Low', icon: <Icons.Low /> },
  { value: 'Medium', label: 'Medium', icon: <Icons.Medium /> },
  { value: 'High', label: 'High', icon: <Icons.High /> }
];

const CreateEstimate = () => {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { createEstimate } = useEstimates();
  const { refreshAllData } = useData();
  const { formatCurrency } = useCurrency();
  
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

  // ✅ FIXED: handleChange function was missing
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ FIXED: calculateEstimate function was missing
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
      
      // ✅ TRIGGER DASHBOARD REFRESH
      await refreshAllData();
      
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
              <div className="flex items-center gap-2 mb-5">
                <Icons.ProjectName />
                <h2 className="text-white font-medium text-sm">Project Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Project Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Project Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.ProjectName />
                    </span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      placeholder="e.g., E-commerce Platform"
                      required
                    />
                  </div>
                </div>
                
                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Duration (months)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.Duration />
                    </span>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      placeholder="e.g., 6"
                      min="1"
                      required
                    />
                  </div>
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
                        className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1
                          ${formData.projectType === type.value
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-[#1E252E] border-[#2A313C] text-gray-400 hover:border-indigo-500 hover:text-white'
                          }`}
                      >
                        <span className="w-6 h-6">{type.icon}</span>
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
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.TeamSize />
                    </span>
                    <input
                      type="number"
                      name="teamSize"
                      value={formData.teamSize}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      placeholder="e.g., 5"
                      min="1"
                      required
                    />
                  </div>
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
                        className={`p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-1
                          ${formData.complexityLevel === level.value
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'bg-[#1E252E] border-[#2A313C] text-gray-400 hover:border-indigo-500 hover:text-white'
                          }`}
                      >
                        <span className="w-6 h-6">{level.icon}</span>
                        <span className="text-xs font-medium">{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Inputs */}
            <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Icons.Calculate />
                <h2 className="text-white font-medium text-sm">Cost Inputs</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Labor Cost / Hour
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.Labor />
                    </span>
                    <input
                      type="number"
                      name="laborCostPerHour"
                      value={formData.laborCostPerHour}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      placeholder="e.g., 50"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Material Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.Material />
                    </span>
                    <input
                      type="number"
                      name="materialCost"
                      value={formData.materialCost}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      placeholder="e.g., 10000"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Equipment Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.Equipment />
                    </span>
                    <input
                      type="number"
                      name="equipmentCost"
                      value={formData.equipmentCost}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">
                    Miscellaneous
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Icons.Misc />
                    </span>
                    <input
                      type="number"
                      name="miscExpenses"
                      value={formData.miscExpenses}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
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
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={calculateEstimate}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                           text-white text-sm font-medium rounded-md
                           transition-all duration-200 flex items-center gap-2
                           focus:ring-4 focus:ring-indigo-600/20 focus:outline-none"
                >
                  <Icons.Calculate />
                  Calculate Estimate
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            {calculatedCost && (
              <div className="bg-[#151A22] rounded-lg border border-[#2A313C] p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Icons.Calculate />
                  <h2 className="text-white font-medium text-sm">Cost Breakdown</h2>
                </div>
                
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
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500">
                      <Icons.Notes />
                    </span>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 bg-[#1E252E] border border-[#2A313C] rounded-md 
                               text-white text-sm placeholder-gray-500
                               focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 
                               outline-none transition-all duration-200"
                      rows="3"
                      placeholder="Add any additional notes or comments..."
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setCalculatedCost(null)}
                    className="px-5 py-2.5 bg-[#1E252E] hover:bg-[#2A313C] 
                             text-gray-300 text-sm font-medium rounded-md
                             border border-[#2A313C] transition-all duration-200
                             flex items-center gap-2
                             focus:ring-4 focus:ring-gray-600/20 focus:outline-none"
                  >
                    <Icons.Back />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 
                             text-white text-sm font-medium rounded-md
                             transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2
                             focus:ring-4 focus:ring-indigo-600/20 focus:outline-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </span>
                    ) : (
                      <>
                        <Icons.Create />
                        Create Estimate
                      </>
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