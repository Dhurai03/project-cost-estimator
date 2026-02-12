const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
    maxlength: [100, 'Project name cannot be more than 100 characters']
  },
  duration: {
    type: Number,
    required: [true, 'Please provide project duration'],
    min: [1, 'Duration must be at least 1 month']
  },
  projectType: {
    type: String,
    required: [true, 'Please select project type'],
    enum: {
      values: ['Software', 'Construction', 'Event', 'Manufacturing'],
      message: '{VALUE} is not supported'
    }
  },
  teamSize: {
    type: Number,
    required: [true, 'Please provide team size'],
    min: [1, 'Team size must be at least 1']
  },
  complexityLevel: {
    type: String,
    required: [true, 'Please select complexity level'],
    enum: {
      values: ['Low', 'Medium', 'High'],
      message: '{VALUE} is not supported'
    }
  },
  laborCostPerHour: {
    type: Number,
    required: [true, 'Please provide labor cost per hour'],
    min: [0, 'Labor cost cannot be negative']
  },
  materialCost: {
    type: Number,
    required: [true, 'Please provide material cost'],
    min: [0, 'Material cost cannot be negative']
  },
  equipmentCost: {
    type: Number,
    required: [true, 'Please provide equipment cost'],
    min: [0, 'Equipment cost cannot be negative']
  },
  miscExpenses: {
    type: Number,
    required: [true, 'Please provide miscellaneous expenses'],
    min: [0, 'Miscellaneous expenses cannot be negative']
  },
  totalCost: {
    type: Number,
    required: true
  },
  laborCost: {
    type: Number,
    required: true
  },
  materialCost: {
    type: Number,
    required: true
  },
  equipmentCost: {
    type: Number,
    required: true
  },
  miscCost: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);