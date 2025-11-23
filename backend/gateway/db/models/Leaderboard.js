const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for ranking queries (sorted by XP descending)
leaderboardSchema.index({ xp: -1 });

// Index for user lookups
leaderboardSchema.index({ user: 1 });

// Index for level-based queries
leaderboardSchema.index({ level: -1 });

// Update lastUpdated on save
leaderboardSchema.pre('save', function (next) {
  this.lastUpdated = new Date();
  next();
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;

