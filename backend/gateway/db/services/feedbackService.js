const Feedback = require('../models/Feedback');
const Content = require('../models/Content');

/**
 * Create a new feedback entry
 */
async function createFeedback(feedbackData) {
  try {
    const feedback = new Feedback(feedbackData);
    await feedback.save();
    await feedback.populate('user', 'name email');
    await feedback.populate('content', 'contentId type credibilityScore riskLevel');
    return feedback;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('User has already provided feedback for this content');
    }
    throw error;
  }
}

/**
 * Get feedback by ID
 */
async function getFeedbackById(feedbackId) {
  try {
    const feedback = await Feedback.findById(feedbackId)
      .populate('user', 'name email')
      .populate('content', 'contentId type credibilityScore riskLevel');
    return feedback;
  } catch (error) {
    throw error;
  }
}

/**
 * Update feedback
 */
async function updateFeedback(feedbackId, updateData) {
  try {
    const feedback = await Feedback.findByIdAndUpdate(feedbackId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('user', 'name email')
      .populate('content', 'contentId type credibilityScore riskLevel');
    return feedback;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete feedback
 */
async function deleteFeedback(feedbackId) {
  try {
    const feedback = await Feedback.findByIdAndDelete(feedbackId);
    return feedback;
  } catch (error) {
    throw error;
  }
}

/**
 * List feedback with pagination
 */
async function listFeedback(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;
    const feedback = await Feedback.find(filters)
      .populate('user', 'name email')
      .populate('content', 'contentId type credibilityScore riskLevel')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Feedback.countDocuments(filters);
    
    return {
      feedback,
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
 * Calculate feedback statistics for a content
 */
async function calculateFeedbackStats(contentId) {
  try {
    const allFeedback = await Feedback.find({ content: contentId });
    
    const total = allFeedback.length;
    const agreeCount = allFeedback.filter((f) => f.feedback === 'agree').length;
    const disagreeCount = allFeedback.filter((f) => f.feedback === 'disagree').length;
    
    const agreePercentage = total > 0 ? ((agreeCount / total) * 100).toFixed(1) : 0;
    const disagreePercentage = total > 0 ? ((disagreeCount / total) * 100).toFixed(1) : 0;
    
    return {
      total,
      agreeCount,
      disagreeCount,
      agreePercentage: parseFloat(agreePercentage),
      disagreePercentage: parseFloat(disagreePercentage),
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Get feedback for a specific content
 */
async function getFeedbackByContent(contentId, page = 1, limit = 10) {
  try {
    return await listFeedback(page, limit, { content: contentId });
  } catch (error) {
    throw error;
  }
}

/**
 * Get feedback by user
 */
async function getFeedbackByUser(userId, page = 1, limit = 10) {
  try {
    return await listFeedback(page, limit, { user: userId });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
  listFeedback,
  calculateFeedbackStats,
  getFeedbackByContent,
  getFeedbackByUser,
};

