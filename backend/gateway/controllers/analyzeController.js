const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const mongoose = require('mongoose');
const contentService = require('../db/services/contentService');
const feedbackService = require('../db/services/feedbackService');
const alertService = require('../db/services/alertService');
const mlClient = require('../services/mlClient');
const reverseSearchMock = require('../services/reverseSearchMock');
const factCheckMock = require('../services/factCheckMock');

/**
 * Analyze text content
 */
async function analyzeText(req, res, next) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'Text is required and must be a non-empty string' },
      });
    }

    // Call ML service
    const mlResult = await mlClient.analyzeText(text);

    // Perform reverse search
    const reverseSearchResults = await reverseSearchMock.reverseSearchText(text);

    // Perform fact-check
    const factCheckResult = await factCheckMock.factCheckText(text);

    // Calculate credibility score
    const credibilityScore = calculateCredibilityScore(mlResult, reverseSearchResults, factCheckResult);

    // Determine risk level
    const riskLevel = determineRiskLevel(credibilityScore);

    // Build reasons array
    const reasons = buildReasons(mlResult, reverseSearchResults, factCheckResult);

    // Build supporting evidence
    const supportingEvidence = buildSupportingEvidence(reverseSearchResults, factCheckResult);

    // Create analysis result
    const analysisResult = {
      id: uuidv4(),
      type: 'text',
      credibility_score: credibilityScore,
      risk_level: riskLevel,
      text_analysis_score: mlResult.text_analysis_score,
      visual_analysis_score: null,
      source_verified: reverseSearchResults.length > 0,
      fact_check_match: factCheckResult !== null,
      reasons,
      supporting_evidence: supportingEvidence,
      summary: mlResult.summary || 'Text analysis completed',
      rawInput: { text },
      metadata: {
        text_length: text.length,
        analyzed_at: new Date().toISOString(),
      },
      user: req.user?.userId ? (mongoose.Types.ObjectId.isValid(req.user.userId) 
        ? new mongoose.Types.ObjectId(req.user.userId) 
        : req.user.userId) : null,
    };

    // Save to MongoDB
    const savedContent = await contentService.saveAnalysisResult(analysisResult);

    // Create alert for high-risk content
    if (riskLevel === 'high') {
      try {
        await alertService.createAlertForHighRisk(
          savedContent._id,
          req.user?.userId || null,
          riskLevel
        );
      } catch (alertError) {
        console.error('Error creating alert:', alertError);
        // Don't fail the request if alert creation fails
      }
    }

    // Format response
    const response = {
      id: savedContent.contentId,
      type: savedContent.type,
      credibility_score: savedContent.credibilityScore,
      risk_level: savedContent.riskLevel,
      text_analysis_score: savedContent.textAnalysisScore,
      visual_analysis_score: savedContent.visualAnalysisScore,
      source_verified: savedContent.sourceVerified,
      fact_check_match: savedContent.factCheckMatch,
      reasons: savedContent.reasons,
      supporting_evidence: savedContent.supportingEvidence,
      summary: savedContent.summary,
      metadata: savedContent.metadata,
      created_at: savedContent.createdAt,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Analyze image content
 */
async function analyzeImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'Image file is required' },
      });
    }

    const imagePath = req.file.path;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    try {
      // Call ML service
      const mlResult = await mlClient.analyzeImage(imagePath);

      // Perform reverse search
      const reverseSearchResults = await reverseSearchMock.reverseSearchImage(imagePath);

      // Perform fact-check using OCR text
      const factCheckResult = await factCheckMock.factCheckImage(imagePath, mlResult.ocr_text);

      // Calculate credibility score
      const credibilityScore = calculateCredibilityScore(
        mlResult,
        reverseSearchResults,
        factCheckResult,
        true
      );

      // Determine risk level
      const riskLevel = determineRiskLevel(credibilityScore);

      // Build reasons array
      const reasons = buildReasons(mlResult, reverseSearchResults, factCheckResult, true);

      // Build supporting evidence
      const supportingEvidence = buildSupportingEvidence(reverseSearchResults, factCheckResult);

      // Extract EXIF data if available (simplified - in production use exif-reader library)
      const exifData = extractExifData(imagePath);

      // Create analysis result
      const analysisResult = {
        id: uuidv4(),
        type: 'image',
        credibility_score: credibilityScore,
        risk_level: riskLevel,
        text_analysis_score: null,
        visual_analysis_score: mlResult.visual_analysis_score,
        source_verified: reverseSearchResults.length > 0,
        fact_check_match: factCheckResult !== null,
        reasons,
        supporting_evidence: supportingEvidence,
        summary: mlResult.summary || 'Image analysis completed',
        rawInput: { imagePath, fileName: req.file.originalname },
        metadata: {
          file_size: fileSize,
          mime_type: mimeType,
          exif: exifData,
          manipulation_probability: mlResult.manipulation_prob,
          analyzed_at: new Date().toISOString(),
        },
        user: req.user?.userId ? (mongoose.Types.ObjectId.isValid(req.user.userId) 
          ? new mongoose.Types.ObjectId(req.user.userId) 
          : req.user.userId) : null,
      };

      // Save to MongoDB
      const savedContent = await contentService.saveAnalysisResult(analysisResult);

      // Create alert for high-risk content
      if (riskLevel === 'high') {
        try {
          const userIdForAlert = req.user?.userId 
            ? (mongoose.Types.ObjectId.isValid(req.user.userId) 
              ? new mongoose.Types.ObjectId(req.user.userId) 
              : req.user.userId)
            : null;
          await alertService.createAlertForHighRisk(
            savedContent._id,
            userIdForAlert,
            riskLevel
          );
        } catch (alertError) {
          console.error('Error creating alert:', alertError);
          // Don't fail the request if alert creation fails
        }
      }

      // Clean up uploaded file if PERSIST_UPLOADS is false
      if (process.env.PERSIST_UPLOADS !== 'true') {
        fs.unlink(imagePath, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }

      // Format response
      const response = {
        id: savedContent.contentId,
        type: savedContent.type,
        credibility_score: savedContent.credibilityScore,
        risk_level: savedContent.riskLevel,
        text_analysis_score: savedContent.textAnalysisScore,
        visual_analysis_score: savedContent.visualAnalysisScore,
        source_verified: savedContent.sourceVerified,
        fact_check_match: savedContent.factCheckMatch,
        reasons: savedContent.reasons,
        supporting_evidence: savedContent.supportingEvidence,
        summary: savedContent.summary,
        metadata: savedContent.metadata,
        created_at: savedContent.createdAt,
      };

      res.json(response);
    } catch (error) {
      // Clean up file on error
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Analyze URL content
 */
async function analyzeUrl(req, res, next) {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'URL is required and must be a string' },
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'Invalid URL format' },
      });
    }

    // Fetch URL content using axios (already available)
    const axios = require('axios');
    let response;
    try {
      response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MisinformationDetector/1.0)',
        },
        timeout: 10000,
        responseType: 'text',
      });
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        return res.status(400).json({
          error: { status: 400, message: 'Failed to fetch URL', details: 'Request timeout' },
        });
      }
      return res.status(400).json({
        error: { status: 400, message: 'Failed to fetch URL', details: err.message },
      });
    }

    if (!response.ok) {
      return res.status(400).json({
        error: { status: 400, message: 'Failed to fetch URL', details: `HTTP ${response.status}` },
      });
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract text content
    const textContent = $('p').text().substring(0, 1000); // First 1000 chars

    // Extract main image
    let mainImageUrl = null;
    const ogImage = $('meta[property="og:image"]').attr('content');
    const firstImg = $('img').first().attr('src');
    mainImageUrl = ogImage || firstImg;

    // Make it absolute if relative
    if (mainImageUrl && !mainImageUrl.startsWith('http')) {
      const baseUrl = new URL(url);
      mainImageUrl = new URL(mainImageUrl, baseUrl.origin).href;
    }

    // Prepare metadata
    const urlMeta = {
      url,
      title: $('title').text() || $('meta[property="og:title"]').attr('content') || '',
      description: $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content') || '',
      image_url: mainImageUrl,
      text_snippet: textContent,
    };

    // Call multi-modal analysis
    const mlResult = await mlClient.analyzeMulti({
      text: textContent,
      image_path: mainImageUrl,
      url_meta: urlMeta,
    });

    // Perform reverse search on text
    const reverseSearchResults = await reverseSearchMock.reverseSearchText(textContent);

    // Perform fact-check
    const factCheckResult = await factCheckMock.factCheckText(textContent);

    // Calculate credibility score
    const credibilityScore = calculateCredibilityScore(mlResult, reverseSearchResults, factCheckResult, true);

    // Determine risk level
    const riskLevel = determineRiskLevel(credibilityScore);

    // Build reasons array
    const reasons = buildReasons(mlResult, reverseSearchResults, factCheckResult, true);

    // Build supporting evidence
    const supportingEvidence = buildSupportingEvidence(reverseSearchResults, factCheckResult);

    // Create analysis result
    const analysisResult = {
      id: uuidv4(),
      type: 'url',
      credibility_score: credibilityScore,
      risk_level: riskLevel,
      text_analysis_score: mlResult.text_analysis_score,
      visual_analysis_score: mlResult.visual_analysis_score,
      source_verified: reverseSearchResults.length > 0,
      fact_check_match: factCheckResult !== null,
      reasons,
      supporting_evidence: supportingEvidence,
      summary: mlResult.summary || 'URL analysis completed',
      rawInput: { url, urlMeta },
      metadata: {
        ...urlMeta,
        analyzed_at: new Date().toISOString(),
      },
      user: req.user?.userId ? (mongoose.Types.ObjectId.isValid(req.user.userId) 
        ? new mongoose.Types.ObjectId(req.user.userId) 
        : req.user.userId) : null,
    };

    // Save to MongoDB
    const savedContent = await contentService.saveAnalysisResult(analysisResult);

    // Create alert for high-risk content
    if (riskLevel === 'high') {
      try {
        const userIdForAlert = req.user?.userId 
          ? (mongoose.Types.ObjectId.isValid(req.user.userId) 
            ? new mongoose.Types.ObjectId(req.user.userId) 
            : req.user.userId)
          : null;
        await alertService.createAlertForHighRisk(
          savedContent._id,
          userIdForAlert,
          riskLevel
        );
      } catch (alertError) {
        console.error('Error creating alert:', alertError);
        // Don't fail the request if alert creation fails
      }
    }

    // Format response
    const response = {
      id: savedContent.contentId,
      type: savedContent.type,
      credibility_score: savedContent.credibilityScore,
      risk_level: savedContent.riskLevel,
      text_analysis_score: savedContent.textAnalysisScore,
      visual_analysis_score: savedContent.visualAnalysisScore,
      source_verified: savedContent.sourceVerified,
      fact_check_match: savedContent.factCheckMatch,
      reasons: savedContent.reasons,
      supporting_evidence: savedContent.supportingEvidence,
      summary: savedContent.summary,
      metadata: savedContent.metadata,
      created_at: savedContent.createdAt,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Submit feedback on analysis
 */
async function submitFeedback(req, res, next) {
  try {
    const { contentId, userId, feedback, notes } = req.body;

    if (!contentId || !userId || !feedback) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'contentId, userId, and feedback are required' },
      });
    }

    if (!['agree', 'disagree'].includes(feedback)) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'feedback must be "agree" or "disagree"' },
      });
    }

    // Find content by contentId (UUID)
    const content = await contentService.getContentByContentId(contentId);
    if (!content) {
      return res.status(404).json({
        error: { status: 404, message: 'Content not found' },
      });
    }

    // Convert userId to ObjectId if valid
    const userObjectId = mongoose.Types.ObjectId.isValid(userId) 
      ? new mongoose.Types.ObjectId(userId) 
      : userId;

    // Create feedback
    const feedbackEntry = await feedbackService.createFeedback({
      user: userObjectId,
      content: content._id,
      feedback,
      notes: notes || '',
    });

    // Calculate feedback statistics
    const stats = await feedbackService.calculateFeedbackStats(content._id);

    res.json({
      success: true,
      feedback_id: feedbackEntry._id,
      feedback_count: stats.total,
      agree_count: stats.agreeCount,
      disagree_count: stats.disagreeCount,
    });
  } catch (error) {
    next(error);
  }
}

// Helper functions

function calculateCredibilityScore(mlResult, reverseSearchResults, factCheckResult, isImage = false) {
  let score = 50; // Base score

  // ML analysis score contribution
  if (mlResult.text_analysis_score !== null) {
    score = (score + mlResult.text_analysis_score) / 2;
  }
  if (isImage && mlResult.visual_analysis_score !== null) {
    score = (score + mlResult.visual_analysis_score) / 2;
  }

  // Reverse search boost (verified sources increase credibility)
  if (reverseSearchResults.length > 0) {
    const avgConfidence = reverseSearchResults.reduce((sum, r) => sum + r.match_confidence, 0) / reverseSearchResults.length;
    score += avgConfidence * 10; // Boost up to 10 points
  }

  // Fact-check penalty (if fact-check found issues)
  if (factCheckResult && factCheckResult.rating.includes('False')) {
    score -= 20;
  } else if (factCheckResult && factCheckResult.rating.includes('Misleading')) {
    score -= 10;
  }

  // Manipulation probability penalty (for images)
  if (isImage && mlResult.manipulation_prob !== null) {
    score -= mlResult.manipulation_prob * 30;
  }

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

function determineRiskLevel(credibilityScore) {
  if (credibilityScore >= 70) return 'low';
  if (credibilityScore >= 40) return 'moderate';
  return 'high';
}

function buildReasons(mlResult, reverseSearchResults, factCheckResult, isImage = false) {
  const reasons = [];

  if (mlResult.reasons && mlResult.reasons.length > 0) {
    reasons.push(...mlResult.reasons);
  }

  if (reverseSearchResults.length === 0) {
    reasons.push('No matching sources found in reverse search');
  } else {
    reasons.push(`Found ${reverseSearchResults.length} matching source(s) in reverse search`);
  }

  if (factCheckResult) {
    reasons.push(`Fact-check rating: ${factCheckResult.rating}`);
  }

  if (isImage && mlResult.manipulation_prob !== null && mlResult.manipulation_prob > 0.3) {
    reasons.push(`High manipulation probability detected (${(mlResult.manipulation_prob * 100).toFixed(1)}%)`);
  }

  return reasons.slice(0, 5); // Top 5 reasons
}

function buildSupportingEvidence(reverseSearchResults, factCheckResult) {
  const evidence = [];

  reverseSearchResults.forEach((result) => {
    evidence.push({
      type: 'source_match',
      source: result.name,
      url: result.url,
      confidence: result.match_confidence,
    });
  });

  if (factCheckResult) {
    evidence.push({
      type: 'fact_check',
      rating: factCheckResult.rating,
      link: factCheckResult.link,
      fact_checker: factCheckResult.fact_checker,
    });
  }

  return evidence;
}

function extractExifData(imagePath) {
  // Simplified EXIF extraction - in production use exif-reader or similar
  // For now, return null or basic info
  try {
    const stats = fs.statSync(imagePath);
    return {
      file_size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      // TODO: Use exif-reader library to extract real EXIF data
    };
  } catch (err) {
    return null;
  }
}

module.exports = {
  analyzeText,
  analyzeImage,
  analyzeUrl,
  submitFeedback,
};

