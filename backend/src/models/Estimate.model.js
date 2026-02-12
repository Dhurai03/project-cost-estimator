const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  estimateNumber: {
    type: String,
    required: true,
    unique: true
  },
  costBreakdown: {
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
    totalCost: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Draft', 'Final', 'Archived'],
    default: 'Draft'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate estimate number before saving
estimateSchema.pre('save', async function(next) {
  if (!this.estimateNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await mongoose.model('Estimate').countDocuments();
    this.estimateNumber = `EST-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Estimate', estimateSchema);