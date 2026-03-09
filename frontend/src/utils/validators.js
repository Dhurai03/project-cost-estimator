// Form validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateProjectForm = (formData) => {
  const errors = {};
  
  if (!formData.name?.trim()) {
    errors.name = 'Project name is required';
  }
  
  if (!formData.duration || formData.duration < 1) {
    errors.duration = 'Duration must be at least 1 month';
  }
  
  if (!formData.teamSize || formData.teamSize < 1) {
    errors.teamSize = 'Team size must be at least 1';
  }
  
  if (!formData.laborCostPerHour || formData.laborCostPerHour < 0) {
    errors.laborCostPerHour = 'Labor cost must be a positive number';
  }
  
  if (!formData.materialCost || formData.materialCost < 0) {
    errors.materialCost = 'Material cost must be a positive number';
  }
  
  if (!formData.equipmentCost || formData.equipmentCost < 0) {
    errors.equipmentCost = 'Equipment cost must be a positive number';
  }
  
  if (!formData.miscExpenses || formData.miscExpenses < 0) {
    errors.miscExpenses = 'Miscellaneous expenses must be a positive number';
  }
  
  // Validate percentages
  if (formData.riskPercentage && (formData.riskPercentage < 0 || formData.riskPercentage > 100)) {
    errors.riskPercentage = 'Risk percentage must be between 0 and 100';
  }
  
  if (formData.gstPercentage && (formData.gstPercentage < 0 || formData.gstPercentage > 100)) {
    errors.gstPercentage = 'GST percentage must be between 0 and 100';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};