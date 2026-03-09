const mongoose = require('mongoose');

const functionPointSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  // Function counts by complexity
  functionCounts: {
    externalInputs: {
      simple: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      complex: { type: Number, default: 0 }
    },
    externalOutputs: {
      simple: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      complex: { type: Number, default: 0 }
    },
    externalInquiries: {
      simple: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      complex: { type: Number, default: 0 }
    },
    internalFiles: {
      simple: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      complex: { type: Number, default: 0 }
    },
    externalInterfaces: {
      simple: { type: Number, default: 0 },
      average: { type: Number, default: 0 },
      complex: { type: Number, default: 0 }
    }
  },
  // Value Adjustment Factors (14 GSCs)
  valueAdjustmentFactors: {
    dataCommunications: { type: Number, default: 3, min: 0, max: 5 },
    distributedFunctions: { type: Number, default: 3, min: 0, max: 5 },
    performance: { type: Number, default: 3, min: 0, max: 5 },
    heavilyUsedConfig: { type: Number, default: 3, min: 0, max: 5 },
    transactionRate: { type: Number, default: 3, min: 0, max: 5 },
    onlineDataEntry: { type: Number, default: 3, min: 0, max: 5 },
    endUserEfficiency: { type: Number, default: 3, min: 0, max: 5 },
    onlineUpdate: { type: Number, default: 3, min: 0, max: 5 },
    complexProcessing: { type: Number, default: 3, min: 0, max: 5 },
    reusability: { type: Number, default: 3, min: 0, max: 5 },
    installationEase: { type: Number, default: 3, min: 0, max: 5 },
    operationalEase: { type: Number, default: 3, min: 0, max: 5 },
    multipleSites: { type: Number, default: 3, min: 0, max: 5 },
    facilitateChange: { type: Number, default: 3, min: 0, max: 5 }
  },
  // Calculated values
  results: {
    unadjustedFunctionPoints: { type: Number, default: 0 },
    valueAdjustmentFactor: { type: Number, default: 1.0 },
    adjustedFunctionPoints: { type: Number, default: 0 },
    estimatedLinesOfCode: { type: Number, default: 0 }, // Conversion to LOC
    estimatedEffort: { type: Number, default: 0 }, // Person-hours
    estimatedCost: { type: Number, default: 0 }
  },
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Archived'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FunctionPoint', functionPointSchema);