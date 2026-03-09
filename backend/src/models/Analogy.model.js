const mongoose = require('mongoose');

const analogyMatchSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  similarityScore: { type: Number, min: 0, max: 100 },
  name: String,
  actualCost: Number,
  actualDuration: Number,
  actualTeamSize: Number,
  differences: mongoose.Schema.Types.Mixed
});

const analogyResultSchema = new mongoose.Schema({
  estimatedCost: { type: Number, default: 0 },
  confidenceScore: { type: Number, default: 0, min: 0, max: 100 },
  similarProjects: [analogyMatchSchema],
  adjustmentFactors: mongoose.Schema.Types.Mixed,
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High']
  },
  recommendations: [String]
});

const analogyModelSchema = new mongoose.Schema({
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
  // Source project features
  features: {
    projectType: String,
    teamSize: Number,
    duration: Number,
    complexity: String,
    estimatedCost: Number,
    technologyStack: [String],
    methodology: String,
    domain: String
  },
  // Search parameters
  searchParams: {
    minSimilarity: { type: Number, default: 70 },
    maxResults: { type: Number, default: 5 },
    useWeightedSimilarity: { type: Boolean, default: true }
  },
  // Results
  results: analogyResultSchema,
  
  notes: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Archived'],
    default: 'Draft'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analogy', analogyModelSchema);