const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    contentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'url', 'multi'],
      required: true,
    },
    rawInput: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    credibilityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high'],
      required: true,
    },
    textAnalysisScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    visualAnalysisScore: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    factCheckMatch: {
      type: Boolean,
      default: false,
    },
    sourceVerified: {
      type: Boolean,
      default: false,
    },
    supportingEvidence: {
      type: [String],
      default: [],
    },
    reasons: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
contentSchema.index({ contentId: 1 });
contentSchema.index({ createdAt: -1 });
contentSchema.index({ user: 1 });
contentSchema.index({ riskLevel: 1 });
contentSchema.index({ credibilityScore: 1 });

// TTL index for automatic cleanup of old content (optional - 90 days)
// Uncomment if you want automatic deletion of old content
// contentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;

