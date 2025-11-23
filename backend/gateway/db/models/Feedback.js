const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Content',
      required: true,
    },
    feedback: {
      type: String,
      enum: ['agree', 'disagree'],
      required: true,
    },
    notes: {
      type: String,
      default: '',
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate feedback from same user on same content
feedbackSchema.index({ user: 1, content: 1 }, { unique: true });

// Index for content-based queries
feedbackSchema.index({ content: 1 });

// Index for user-based queries
feedbackSchema.index({ user: 1 });

// Index for timestamp queries
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;

