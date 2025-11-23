const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    mediaType: {
      type: String,
      enum: ['text', 'image'],
      required: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    correctAnswer: {
      type: String,
      enum: ['real', 'fake'],
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for difficulty-based queries
challengeSchema.index({ difficulty: 1 });

// Index for random selection
challengeSchema.index({ createdAt: -1 });

const Challenge = mongoose.model('Challenge', challengeSchema);

module.exports = Challenge;

