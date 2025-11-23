const User = require('../models/User');

/**
 * Create a new user
 */
async function createUser(userData) {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User with this email already exists');
    }
    throw error;
  }
}

/**
 * Get user by ID
 */
async function getUserById(userId) {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Update user
 */
async function updateUser(userId, updateData) {
  try {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  try {
    const user = await User.findByIdAndDelete(userId);
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * List users with pagination
 */
async function listUsers(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;
    const users = await User.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filters);
    
    return {
      users,
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
 * Increment user XP
 */
async function incrementXP(userId, xp) {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { xp: xp } },
      { new: true }
    );
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Award badge to user
 */
async function awardBadge(userId, badge) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (!user.badges.includes(badge)) {
      user.badges.push(badge);
      await user.save();
    }
    
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * Get or create user by email (useful for OAuth)
 */
async function getOrCreateUser(email, userData = {}) {
  try {
    let user = await getUserByEmail(email);
    
    if (!user) {
      user = await createUser({
        email,
        name: userData.name || email.split('@')[0],
        authProvider: userData.authProvider || 'local',
        providerId: userData.providerId || null,
        ...userData,
      });
    }
    
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  listUsers,
  incrementXP,
  awardBadge,
  getOrCreateUser,
};

