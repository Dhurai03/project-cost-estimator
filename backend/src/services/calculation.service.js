/**
 * Calculate project costs based on input parameters
 * @param {Object} projectData - Project input data
 * @returns {Object} Cost breakdown matching Project model
 */
exports.calculateProjectCost = (projectData) => {
  const {
    duration,
    teamSize,
    laborCostPerHour,
    materialCost,
    equipmentCost,
    miscExpenses,
    complexityLevel,
    projectType
  } = projectData;

  // ✅ FIX: Use 160 hours per month (40hrs/week × 4 weeks) to match frontend
  const WORK_HOURS_PER_MONTH = 160;
  
  // 1️⃣ LABOR COST CALCULATION
  const totalWorkHours = duration * WORK_HOURS_PER_MONTH;
  const baseLaborCost = teamSize * totalWorkHours * laborCostPerHour;
  
  const complexityMultiplier = {
    'Low': 1.0,
    'Medium': 1.2,
    'High': 1.5
  }[complexityLevel] || 1.0;
  
  const laborCost = baseLaborCost * complexityMultiplier;

  // 2️⃣ PROJECT TYPE MULTIPLIER
  const projectTypeMultiplier = {
    'Software': 1.0,
    'Construction': 1.3,
    'Event': 0.9,
    'Manufacturing': 1.1
  }[projectType] || 1.0;

  const adjustedMaterialCost = materialCost * projectTypeMultiplier;
  const adjustedEquipmentCost = equipmentCost * projectTypeMultiplier;
  const adjustedMiscCost = miscExpenses * projectTypeMultiplier;

  // 3️⃣ TOTAL COST
  const totalCost = laborCost + 
                    adjustedMaterialCost + 
                    adjustedEquipmentCost + 
                    adjustedMiscCost;

  // ✅ Return format matching Project model
  return {
    laborCost: Math.round(laborCost * 100) / 100,
    materialCost: Math.round(adjustedMaterialCost * 100) / 100,
    equipmentCost: Math.round(adjustedEquipmentCost * 100) / 100,
    miscCost: Math.round(adjustedMiscCost * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100
  };
};