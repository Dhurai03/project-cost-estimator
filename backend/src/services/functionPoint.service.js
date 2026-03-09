/**
 * Function Point Analysis Service
 */

// Standard Function Point Weights
const WEIGHTS = {
  externalInputs: { simple: 3, average: 4, complex: 6 },
  externalOutputs: { simple: 4, average: 5, complex: 7 },
  externalInquiries: { simple: 3, average: 4, complex: 6 },
  internalFiles: { simple: 7, average: 10, complex: 15 },
  externalInterfaces: { simple: 5, average: 7, complex: 10 }
};

// Default language LOC per FP mapping (approximate industry averages)
const LOC_PER_FP = {
  'Java': 53,
  'C#': 54,
  'C++': 50,
  'Python': 24,
  'JavaScript': 47,
  'PHP': 67,
  'HTML': 40,
  'SQL': 13,
  'Default': 50
};

/**
 * Calculates Unadjusted Function Points (UFP)
 */
const calculateUFP = (functionCounts) => {
  let ufp = 0;
  
  if (!functionCounts) return 0;

  for (const component in WEIGHTS) {
    if (functionCounts[component]) {
      for (const complexity in WEIGHTS[component]) {
        const count = parseInt(functionCounts[component][complexity]) || 0;
        const weight = WEIGHTS[component][complexity];
        ufp += count * weight;
      }
    }
  }

  return ufp;
};

/**
 * Calculates Value Adjustment Factor (VAF)
 */
const calculateVAF = (valueAdjustmentFactors) => {
  if (!valueAdjustmentFactors) return 1.0;

  let totalFactors = 0;
  for (const factor in valueAdjustmentFactors) {
    const value = parseInt(valueAdjustmentFactors[factor]) || 0;
    // ensure value is between 0 and 5
    const clampedValue = Math.max(0, Math.min(5, value));
    totalFactors += clampedValue;
  }

  // VAF formula: 0.65 + (0.01 * Total Degree of Influence)
  return 0.65 + (0.01 * totalFactors);
};

/**
 * Calculate all Function Point metrics
 * 
 * @param {Object} params
 * @param {Object} params.functionCounts
 * @param {Object} params.valueAdjustmentFactors
 * @param {String} params.language
 * @param {Number} params.ratePerHour
 * @returns {Object} result metrics
 */
exports.calculateAll = ({ functionCounts, valueAdjustmentFactors, language, ratePerHour }) => {
  const rph = parseFloat(ratePerHour) || 50;
  const lang = language || 'Default';
  const locMultiplier = LOC_PER_FP[lang] || LOC_PER_FP['Default'];

  // 1. Calculate Unadjusted Function Points (UFP)
  const ufp = calculateUFP(functionCounts);

  // 2. Calculate Value Adjustment Factor (VAF)
  const vaf = calculateVAF(valueAdjustmentFactors);

  // 3. Calculate Adjusted Function Points (AFP)
  const afp = ufp * vaf;

  // 4. Estimate Lines of Code (LOC)
  const estimatedLOC = afp * locMultiplier;

  // 5. Estimate Effort (Assuming average of 1 FP = 8-10 hours, let's use 10 for simplicity)
  // Or we can use LOC based estimate. Let's use FP-based effort: Effort (hours) = AFP * 10
  const estimatedEffortHours = afp * 10; 

  // 6. Estimate Cost
  const estimatedCost = estimatedEffortHours * rph;

  return {
    unadjustedFunctionPoints: Math.round(ufp * 100) / 100,
    valueAdjustmentFactor: Math.round(vaf * 1000) / 1000,
    adjustedFunctionPoints: Math.round(afp * 100) / 100,
    estimatedLinesOfCode: Math.round(estimatedLOC),
    estimatedEffort: Math.round(estimatedEffortHours * 100) / 100,
    estimatedCost: Math.round(estimatedCost * 100) / 100
  };
};
