const mongoose = require('mongoose');

const estimateHistorySchema = new mongoose.Schema({
  estimate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estimate',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['CREATED', 'UPDATED', 'DELETED', 'EXPORTED_PDF', 'EXPORTED_CSV', 'STATUS_CHANGED'],
    required: true
  },
  previousStatus: {
    type: String,
    enum: ['Draft', 'Final', 'Archived']
  },
  newStatus: {
    type: String,
    enum: ['Draft', 'Final', 'Archived']
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for faster queries
estimateHistorySchema.index({ estimate: 1, timestamp: -1 });
estimateHistorySchema.index({ user: 1, timestamp: -1 });
estimateHistorySchema.index({ action: 1, timestamp: -1 });

module.exports = mongoose.model('EstimateHistory', estimateHistorySchema);