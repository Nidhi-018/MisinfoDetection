const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

/**
 * Create or update leaderboard entry
 */
async function createOrUpdateLeaderboard(userId, xp, level = null) {
  try {
    // Calculate level if not provided (every 100 XP = 1 level)
    if (level === null) {
      const user = await User.findById(userId);
      if (user) {
        level = Math.floor((user.xp + xp) / 100) + 1;
      } else {
        level = Math.floor(xp / 100) + 1;
      }
    }
    
    const leaderboard = await Leaderboard.findOneAndUpdate(
      { user: userId },
      { 
        $inc: { xp: xp },
        $set: { level, lastUpdated: new Date() }
      },
      { 
        new: true, 
        upsert: true,
        runValidators: true 
      }
    ).populate('user', 'name email badges');
    
    return leaderboard;
  } catch (error) {
    throw error;
  }
}

/**
 * Get leaderboard entry by user ID
 */
async function getLeaderboardByUserId(userId) {
  try {
    const leaderboard = await Leaderboard.findOne({ user: userId })
      .populate('user', 'name email badges');
    return leaderboard;
  } catch (error) {
    throw error;
  }
}

/**
 * Update XP for a user
 */
async function updateXP(userId, points) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Update user XP
    user.xp += points;
    if (user.xp < 0) user.xp = 0;
    await user.save();
    
    // Update leaderboard
    const level = Math.floor(user.xp / 100) + 1;
    const leaderboard = await createOrUpdateLeaderboard(userId, 0, level);
    
    return {
      user,
      leaderboard,
      xpEarned: points,
      totalXP: user.xp,
      level,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get top players
 */
async function getTopPlayers(limit = 100) {
  try {
    const topPlayers = await Leaderboard.find()
      .populate('user', 'name email badges')
      .sort({ xp: -1 })
      .limit(limit);
    
    // Add rank
    const topPlayersWithRank = topPlayers.map((entry, index) => ({
      rank: index + 1,
      ...entry.toObject(),
    }));
    
    return topPlayersWithRank;
  } catch (error) {
    throw error;
  }
}

/**
 * Get leaderboard with pagination
 */
async function getLeaderboard(page = 1, limit = 100) {
  try {
    const skip = (page - 1) * limit;
    const leaderboard = await Leaderboard.find()
      .populate('user', 'name email badges')
      .sort({ xp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Leaderboard.countDocuments();
    
    // Add rank
    const leaderboardWithRank = leaderboard.map((entry, index) => ({
      rank: skip + index + 1,
      ...entry.toObject(),
    }));
    
    return {
      leaderboard: leaderboardWithRank,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Delete leaderboard entry
 */
async function deleteLeaderboard(userId) {
  try {
    const leaderboard = await Leaderboard.findOneAndDelete({ user: userId });
    return leaderboard;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrUpdateLeaderboard,
  getLeaderboardByUserId,
  updateXP,
  getTopPlayers,
  getLeaderboard,
  deleteLeaderboard,
};

