const Content = require('../models/Content');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new content analysis result
 */
async function createContent(contentData) {
  try {
    // Generate contentId if not provided
    if (!contentData.contentId) {
      contentData.contentId = uuidv4();
    }
    
    const content = new Content(contentData);
    await content.save();
    return content;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error('Content with this contentId already exists');
    }
    throw error;
  }
}

/**
 * Get content by ID
 */
async function getContentById(contentId) {
  try {
    const content = await Content.findById(contentId).populate('user', 'name email');
    return content;
  } catch (error) {
    throw error;
  }
}

/**
 * Get content by contentId (UUID)
 */
async function getContentByContentId(contentId) {
  try {
    const content = await Content.findOne({ contentId }).populate('user', 'name email');
    return content;
  } catch (error) {
    throw error;
  }
}

/**
 * Update content
 */
async function updateContent(contentId, updateData) {
  try {
    const content = await Content.findByIdAndUpdate(contentId, updateData, {
      new: true,
      runValidators: true,
    });
    return content;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete content
 */
async function deleteContent(contentId) {
  try {
    const content = await Content.findByIdAndDelete(contentId);
    return content;
  } catch (error) {
    throw error;
  }
}

/**
 * List content with pagination
 */
async function listContent(page = 1, limit = 10, filters = {}) {
  try {
    const skip = (page - 1) * limit;
    const content = await Content.find(filters)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Content.countDocuments(filters);
    
    return {
      content,
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
 * Save analysis result (convenience method)
 */
async function saveAnalysisResult(result) {
  try {
    const contentData = {
      contentId: result.id || uuidv4(),
      type: result.type,
      rawInput: result.rawInput || result.metadata || {},
      credibilityScore: result.credibility_score || result.credibilityScore,
      riskLevel: result.risk_level || result.riskLevel,
      textAnalysisScore: result.text_analysis_score || result.textAnalysisScore,
      visualAnalysisScore: result.visual_analysis_score || result.visualAnalysisScore,
      factCheckMatch: result.fact_check_match || result.factCheckMatch || false,
      sourceVerified: result.source_verified || result.sourceVerified || false,
      supportingEvidence: result.supporting_evidence || result.supportingEvidence || [],
      reasons: result.reasons || [],
      summary: result.summary || '',
      user: result.userId || result.user || null,
      metadata: result.metadata || {},
    };
    
    return await createContent(contentData);
  } catch (error) {
    throw error;
  }
}

/**
 * Get recent analyses
 */
async function getRecentAnalyses(limit = 10) {
  try {
    const analyses = await Content.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return analyses;
  } catch (error) {
    throw error;
  }
}

/**
 * Search content by risk level
 */
async function searchByRiskLevel(riskLevel, page = 1, limit = 10) {
  try {
    return await listContent(page, limit, { riskLevel });
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's content history
 */
async function getUserContent(userId, page = 1, limit = 10) {
  try {
    return await listContent(page, limit, { user: userId });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createContent,
  getContentById,
  getContentByContentId,
  updateContent,
  deleteContent,
  listContent,
  saveAnalysisResult,
  getRecentAnalyses,
  searchByRiskLevel,
  getUserContent,
};

