const contentService = require('../db/services/contentService');
const feedbackService = require('../db/services/feedbackService');
const mongoose = require('mongoose');

/**
 * Get user's analysis history
 */
async function getUserHistory(req, res, next) {
  try {
    const userId = req.user?.userId || req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'userId is required' },
      });
    }

    // Convert userId to ObjectId if it's a valid ObjectId string
    let userObjectId = userId;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      userObjectId = new mongoose.Types.ObjectId(userId);
    }

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);

    const result = await contentService.getUserContent(userObjectId, page, limit);

    // Format response
    const history = result.content.map((content) => ({
      id: content.contentId,
      type: content.type,
      credibility_score: content.credibilityScore,
      risk_level: content.riskLevel,
      summary: content.summary,
      created_at: content.createdAt,
    }));

    res.json({
      history,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get analysis result by ID
 */
async function getAnalysisResult(req, res, next) {
  try {
    const { id } = req.params;
    
    const content = await contentService.getContentByContentId(id);
    
    if (!content) {
      return res.status(404).json({
        error: { status: 404, message: 'Analysis result not found' },
      });
    }

    // Format response
    const response = {
      id: content.contentId,
      type: content.type,
      credibility_score: content.credibilityScore,
      risk_level: content.riskLevel,
      text_analysis_score: content.textAnalysisScore,
      visual_analysis_score: content.visualAnalysisScore,
      source_verified: content.sourceVerified,
      fact_check_match: content.factCheckMatch,
      reasons: content.reasons,
      supporting_evidence: content.supportingEvidence,
      summary: content.summary,
      metadata: content.metadata,
      created_at: content.createdAt,
      user: content.user ? {
        id: content.user._id,
        name: content.user.name,
        email: content.user.email,
      } : null,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user's content (only if user owns it)
 */
async function deleteUserContent(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: { status: 401, message: 'Unauthorized', details: 'Authentication required' },
      });
    }

    // Get content to verify ownership
    const content = await contentService.getContentByContentId(id);
    
    if (!content) {
      return res.status(404).json({
        error: { status: 404, message: 'Content not found' },
      });
    }

    // Check ownership (convert userId to ObjectId for comparison)
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    if (content.user && content.user.toString() !== userObjectId.toString()) {
      return res.status(403).json({
        error: { status: 403, message: 'Forbidden', details: 'You can only delete your own content' },
      });
    }

    // Delete content
    await contentService.deleteContent(content._id);

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get feedback for a content item
 */
async function getContentFeedback(req, res, next) {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);

    // Get content first
    const content = await contentService.getContentByContentId(id);
    
    if (!content) {
      return res.status(404).json({
        error: { status: 404, message: 'Content not found' },
      });
    }

    // Get feedback
    const result = await feedbackService.getFeedbackByContent(content._id, page, limit);
    const stats = await feedbackService.calculateFeedbackStats(content._id);

    // Format response
    const feedbackFormatted = result.feedback.map((fb) => ({
      id: fb._id,
      user: fb.user ? {
        id: fb.user._id,
        name: fb.user.name,
      } : null,
      feedback: fb.feedback,
      notes: fb.notes,
      created_at: fb.createdAt,
    }));

    res.json({
      feedback: feedbackFormatted,
      stats,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user's feedback
 */
async function updateFeedback(req, res, next) {
  try {
    const { feedbackId } = req.params;
    const { feedback, notes } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: { status: 401, message: 'Unauthorized', details: 'Authentication required' },
      });
    }

    if (!feedback || !['agree', 'disagree'].includes(feedback)) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'feedback must be "agree" or "disagree"' },
      });
    }

    // Get existing feedback to verify ownership
    const existingFeedback = await feedbackService.getFeedbackById(feedbackId);
    
    if (!existingFeedback) {
      return res.status(404).json({
        error: { status: 404, message: 'Feedback not found' },
      });
    }

    // Check ownership
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    if (existingFeedback.user.toString() !== userObjectId.toString()) {
      return res.status(403).json({
        error: { status: 403, message: 'Forbidden', details: 'You can only update your own feedback' },
      });
    }

    // Update feedback
    const updated = await feedbackService.updateFeedback(feedbackId, {
      feedback,
      notes: notes || existingFeedback.notes,
    });

    res.json({
      success: true,
      feedback: {
        id: updated._id,
        feedback: updated.feedback,
        notes: updated.notes,
        updated_at: updated.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user's feedback
 */
async function deleteFeedback(req, res, next) {
  try {
    const { feedbackId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: { status: 401, message: 'Unauthorized', details: 'Authentication required' },
      });
    }

    // Get existing feedback to verify ownership
    const existingFeedback = await feedbackService.getFeedbackById(feedbackId);
    
    if (!existingFeedback) {
      return res.status(404).json({
        error: { status: 404, message: 'Feedback not found' },
      });
    }

    // Check ownership
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;
    
    if (existingFeedback.user.toString() !== userObjectId.toString()) {
      return res.status(403).json({
        error: { status: 403, message: 'Forbidden', details: 'You can only delete your own feedback' },
      });
    }

    // Delete feedback
    await feedbackService.deleteFeedback(feedbackId);

    res.json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserHistory,
  getAnalysisResult,
  deleteUserContent,
  getContentFeedback,
  updateFeedback,
  deleteFeedback,
};

