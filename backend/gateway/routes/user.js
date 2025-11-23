const express = require('express');
const { optionalAuth, mockAuth } = require('../middlewares/authMock');
const { 
  getUserHistory, 
  getAnalysisResult, 
  deleteUserContent,
  getContentFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/user/history:
 *   get:
 *     summary: Get user's analysis history
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: User's analysis history
 *       401:
 *         description: Unauthorized
 */
router.get('/history', optionalAuth, getUserHistory);

/**
 * @swagger
 * /api/v1/user/results/{id}:
 *   get:
 *     summary: Get analysis result by ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID (UUID)
 *     responses:
 *       200:
 *         description: Analysis result
 *       404:
 *         description: Result not found
 */
router.get('/results/:id', optionalAuth, getAnalysisResult);

/**
 * @swagger
 * /api/v1/user/content/{id}:
 *   delete:
 *     summary: Delete user's own content
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID (UUID)
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       403:
 *         description: Forbidden - not your content
 *       404:
 *         description: Content not found
 */
router.delete('/content/:id', optionalAuth, deleteUserContent);

/**
 * @swagger
 * /api/v1/user/content/{id}/feedback:
 *   get:
 *     summary: Get feedback for a content item
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Content ID (UUID)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Feedback list with statistics
 *       404:
 *         description: Content not found
 */
router.get('/content/:id/feedback', optionalAuth, getContentFeedback);

/**
 * @swagger
 * /api/v1/user/feedback/{feedbackId}:
 *   put:
 *     summary: Update user's feedback
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - feedback
 *             properties:
 *               feedback:
 *                 type: string
 *                 enum: [agree, disagree]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback updated successfully
 *       403:
 *         description: Forbidden
 */
router.put('/feedback/:feedbackId', optionalAuth, updateFeedback);

/**
 * @swagger
 * /api/v1/user/feedback/{feedbackId}:
 *   delete:
 *     summary: Delete user's feedback
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: feedbackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Feedback deleted successfully
 *       403:
 *         description: Forbidden
 */
router.delete('/feedback/:feedbackId', optionalAuth, deleteFeedback);

module.exports = router;
