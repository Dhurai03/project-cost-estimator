const mongoose = require('mongoose');

const cocomoScaleFactorSchema = {
  prec: { type: Number, default: 3.72, min: 0, max: 6.20 }, // Precedentedness
  flex: { type: Number, default: 4.05, min: 0, max: 6.07 }, // Development Flexibility
  resl: { type: Number, default: 4.24, min: 0, max: 7.07 }, // Architecture/Risk Resolution
  team: { type: Number, default: 3.29, min: 0, max: 5.48 }, // Team Cohesion
  pmat: { type: Number, default: 4.68, min: 0, max: 7.80 }  // Process Maturity
};

const cocomoCostDriverSchema = {
  // Product factors
  rely: { type: Number, default: 1.00, min: 0.75, max: 1.40 }, // Required Reliability
  data: { type: Number, default: 1.00, min: 0.90, max: 1.28 }, // Database Size
  cplx: { type: Number, default: 1.00, min: 0.70, max: 1.74 }, // Product Complexity
  // Platform factors
  time: { type: Number, default: 1.00, min: 1.00, max: 1.63 }, // Execution Time Constraint
  stor: { type: Number, default: 1.00, min: 1.00, max: 1.46 }, // Main Storage Constraint
  pvol: { type: Number, default: 1.00, min: 0.87, max: 1.30 }, // Platform Volatility
  // Personnel factors
  acap: { type: Number, default: 1.00, min: 0.71, max: 1.42 }, // Analyst Capability
  pcap: { type: Number, default: 1.00, min: 0.67, max: 1.33 }, // Programmer Capability
  pcon: { type: Number, default: 1.00, min: 0.81, max: 1.29 }, // Personnel Continuity
  aexp: { type: Number, default: 1.00, min: 0.81, max: 1.22 }, // Applications Experience
  plex: { type: Number, default: 1.00, min: 0.85, max: 1.19 }, // Platform Experience
  ltex: { type: Number, default: 1.00, min: 0.84, max: 1.20 }, // Language/Tool Experience
  // Project factors
  tool: { type: Number, default: 1.00, min: 0.78, max: 1.17 }, // Use of Software Tools
  site: { type: Number, default: 1.00, min: 0.80, max: 1.22 }, // Multisite Development
  sced: { type: Number, default: 1.00, min: 1.00, max: 1.43 } // Required Development Schedule
};

const cocomoResultSchema = {
  sizeKloc: { type: Number, default: 0 },
  effortPersonMonths: { type: Number, default: 0 },
  developmentTimeMonths: { type: Number, default: 0 },
  averageStaff: { type: Number, default: 0 },
  productivity: { type: Number, default: 0 }, // LOC/person-month
  cost: { type: Number, default: 0 },
  phaseDistribution: {
    plansAndRequirements: { type: Number, default: 0 },
    productDesign: { type: Number, default: 0 },
    programming: { type: Number, default: 0 },
    integrationAndTest: { type: Number, default: 0 }
  }
};

const cocomoModelSchema = new mongoose.Schema({
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
  modelType: {
    type: String,
    enum: ['organic', 'semi-detached', 'embedded'],
    default: 'organic'
  },
  sizeSource: {
    type: String,
    enum: ['direct', 'converted_from_fp'],
    default: 'direct'
  },
  sizeKloc: { type: Number, required: true, min: 0 },
  
  // Scale Factors
  scaleFactors: cocomoScaleFactorSchema,
  
  // Cost Drivers
  costDrivers: cocomoCostDriverSchema,
  
  // Results
  results: cocomoResultSchema,
  
  // Confidence metrics
  confidenceInterval: {
    low: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    probability: { type: Number, default: 0.75 } // 75% confidence
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

module.exports = mongoose.model('Cocomo', cocomoModelSchema);