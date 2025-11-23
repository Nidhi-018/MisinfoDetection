const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    authProvider: {
      type: String,
      default: 'local',
    },
    providerId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique email + providerId combination
userSchema.index({ email: 1, providerId: 1 }, { unique: true });

// Index for email lookups
userSchema.index({ email: 1 });

// Index for role-based queries
userSchema.index({ role: 1 });

// Index for leaderboard queries
userSchema.index({ xp: -1 });

// Virtual for level calculation (every 100 XP = 1 level)
userSchema.virtual('level').get(function () {
  return Math.floor(this.xp / 100) + 1;
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

const User = mongoose.model('User', userSchema);

module.exports = User;

