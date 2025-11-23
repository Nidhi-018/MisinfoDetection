const Challenge = require('../models/Challenge');

/**
 * Create a new challenge
 */
async function createChallenge(challengeData) {
  try {
    const challenge = new Challenge(challengeData);
    await challenge.save();
    return challenge;
  } catch (error) {
    throw error;
  }
}

/**
 * Get challenge by ID
 */
async function getChallengeById(challengeId) {
  try {
    const challenge = await Challenge.findById(challengeId);
    return challenge;
  } catch (error) {
    throw error;
  }
}

/**
 * Update challenge
 */
async function updateChallenge(challengeId, updateData) {
  try {
    const challenge = await Challenge.findByIdAndUpdate(challengeId, updateData, {
      new: true,
      runValidators: true,
    });
    return challenge;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete challenge
 */
async function deleteChallenge(challengeId) {
  try {
    const challenge = await Challenge.findByIdAndDelete(challengeId);
    return challenge;
  } catch (error) {
    throw error;
  }
}

/**
 * List challenges with pagination
 */
async function listChallenges(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;
    const challenges = await Challenge.find(filters)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Challenge.countDocuments(filters);
    
    return {
      challenges,
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
 * Get random challenges (for game)
 */
async function getRandomChallenges(n = 10, difficulty = null) {
  try {
    const filter = difficulty ? { difficulty } : {};
    
    // Get total count
    const total = await Challenge.countDocuments(filter);
    
    if (total === 0) {
      return [];
    }
    
    // Get random sample
    const randomSkip = Math.floor(Math.random() * Math.max(0, total - n));
    const challenges = await Challenge.find(filter)
      .skip(randomSkip)
      .limit(n);
    
    // Shuffle and return (in case we want more randomness)
    return challenges.sort(() => Math.random() - 0.5);
  } catch (error) {
    throw error;
  }
}

/**
 * Validate answer for a challenge
 */
async function validateAnswer(challengeId, answer) {
  try {
    const challenge = await Challenge.findById(challengeId);
    
    if (!challenge) {
      throw new Error('Challenge not found');
    }
    
    const isCorrect = challenge.correctAnswer.toLowerCase() === answer.toLowerCase();
    
    return {
      isCorrect,
      correctAnswer: challenge.correctAnswer,
      explanation: challenge.explanation,
      difficulty: challenge.difficulty,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get challenges by difficulty
 */
async function getChallengesByDifficulty(difficulty, page = 1, limit = 10) {
  try {
    return await listChallenges(page, limit, { difficulty });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createChallenge,
  getChallengeById,
  updateChallenge,
  deleteChallenge,
  listChallenges,
  getRandomChallenges,
  validateAnswer,
  getChallengesByDifficulty,
};

