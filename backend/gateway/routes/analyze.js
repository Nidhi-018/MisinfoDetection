const express = require('express');
const multer = require('multer');
const path = require('path');
const { mockAuth, optionalAuth } = require('../middlewares/authMock');
const {
  analyzeText,
  analyzeImage,
  analyzeUrl,
  submitFeedback,
} = require('../controllers/analyzeController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = process.env.UPLOADS_DIR || path.join(__dirname, '../uploads');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept image files only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

/**
 * @swagger
 * /api/v1/analyze/text:
 *   post:
 *     summary: Analyze text content for misinformation
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: Text content to analyze
 *     responses:
 *       200:
 *         description: Analysis result
 *       400:
 *         description: Invalid input
 */
router.post('/text', optionalAuth, analyzeText);

/**
 * @swagger
 * /api/v1/analyze/image:
 *   post:
 *     summary: Analyze image content for misinformation
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Analysis result
 *       400:
 *         description: Invalid input
 */
router.post('/image', optionalAuth, upload.single('image'), analyzeImage);

/**
 * @swagger
 * /api/v1/analyze/url:
 *   post:
 *     summary: Analyze URL content for misinformation
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL to analyze
 *     responses:
 *       200:
 *         description: Analysis result
 *       400:
 *         description: Invalid input
 */
router.post('/url', optionalAuth, analyzeUrl);

/**
 * @swagger
 * /api/v1/analyze/feedback:
 *   post:
 *     summary: Submit feedback on analysis result
 *     tags: [Analyze]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contentId
 *               - userId
 *               - feedback
 *             properties:
 *               contentId:
 *                 type: string
 *               userId:
 *                 type: string
 *               feedback:
 *                 type: string
 *                 enum: [agree, disagree]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *       400:
 *         description: Invalid input
 */
router.post('/feedback', optionalAuth, submitFeedback);

module.exports = router;

