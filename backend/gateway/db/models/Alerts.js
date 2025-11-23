const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true,
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'allowed', 'removed'],
      default: 'pending',
    },
    notes: {
      type: String,
      default: '',
      maxlength: 1000,
    },
    actionedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    actionedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
alertSchema.index({ content: 1 });
alertSchema.index({ status: 1 });
alertSchema.index({ riskLevel: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ flaggedBy: 1 });

// Compound index for common queries
alertSchema.index({ status: 1, riskLevel: 1 });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;

