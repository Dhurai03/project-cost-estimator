const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({
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
  estimateNumber: {
    type: String,
    unique: true,
    sparse: true // Allow null/undefined temporarily
  },
  projectDetails: {
    name: String,
    duration: Number,
    projectType: String,
    teamSize: Number,
    complexityLevel: String
  },
  costInputs: {
    laborCostPerHour: Number,
    materialCost: Number,
    equipmentCost: Number,
    miscExpenses: Number
  },
  costBreakdown: {
    laborCost: Number,
    materialCost: Number,
    equipmentCost: Number,
    miscCost: Number,
    totalCost: Number
  },
  multipliers: {
    complexityMultiplier: { type: Number, default: 1.0 },
    projectTypeMultiplier: { type: Number, default: 1.0 }
  },
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Archived'],
    default: 'Draft'
  },
  notes: {
    type: String,
    default: ''
  },
  currency: {
    type: String,
    default: 'USD'
  }
}, {
  timestamps: true
});

// ✅ FIXED: Generate estimate number BEFORE validation
estimateSchema.pre('validate', async function(next) {
  try {
    if (!this.estimateNumber) {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      // Get count of all estimates
      const count = await mongoose.model('Estimate').countDocuments();
      
      this.estimateNumber = `EST-${year}${month}-${String(count + 1).padStart(4, '0')}`;
      console.log('✅ Generated estimate number:', this.estimateNumber);
    }
    next();
  } catch (error) {
    console.error('❌ Error generating estimate number:', error);
    next(error);
  }
});

// Make estimateNumber required after we generate it
estimateSchema.path('estimateNumber').required(true);

module.exports = mongoose.model('Estimate', estimateSchema);