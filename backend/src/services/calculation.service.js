/**
 * Calculate project costs based on input parameters
 * @param {Object} projectData - Project input data
 * @returns {Object} Cost breakdown
 */
exports.calculateProjectCost = (projectData) => {
  const {
    duration,
    teamSize,
    laborCostPerHour,
    materialCost,
    equipmentCost,
    miscExpenses,
    complexityLevel
  } = projectData;

  // Standard work hours per month (160 hours = 40 hours/week * 4 weeks)
  const WORK_HOURS_PER_MONTH = 160;
  
  // Calculate labor cost
  const totalWorkHours = duration * WORK_HOURS_PER_MONTH;
  const baseLaborCost = teamSize * totalWorkHours * laborCostPerHour;
  
  // Apply complexity multiplier
  const complexityMultiplier = {
    'Low': 1.0,
    'Medium': 1.2,
    'High': 1.5
  }[complexityLevel] || 1.0;
  
  const laborCost = baseLaborCost * complexityMultiplier;

  // Apply project type specific adjustments
  const projectTypeMultiplier = {
    'Software': 1.0,
    'Construction': 1.3,
    'Event': 0.9,
    'Manufacturing': 1.1
  }[projectData.projectType] || 1.0;

  const adjustedMaterialCost = materialCost * projectTypeMultiplier;
  const adjustedEquipmentCost = equipmentCost * projectTypeMultiplier;
  const adjustedMiscCost = miscExpenses * projectTypeMultiplier;

  // Calculate total cost
  const totalCost = laborCost + 
                    adjustedMaterialCost + 
                    adjustedEquipmentCost + 
                    adjustedMiscCost;

  return {
    laborCost: Math.round(laborCost * 100) / 100,
    materialCost: Math.round(adjustedMaterialCost * 100) / 100,
    equipmentCost: Math.round(adjustedEquipmentCost * 100) / 100,
    miscCost: Math.round(adjustedMiscCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100
  };
};