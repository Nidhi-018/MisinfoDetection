const express = require('express');
const { mockAuth } = require('../middlewares/authMock');
const { getAlerts, takeAction } = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/statsController');

const router = express.Router();

// Admin routes require authentication
router.use(mockAuth);

/**
 * @swagger
 * /api/v1/admin/alerts:
 *   get:
 *     summary: Get moderation alerts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, reviewed, resolved, all]
 *           default: pending
 *         description: Filter by alert status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of alerts to return
 *     responses:
 *       200:
 *         description: List of alerts
 *       401:
 *         description: Unauthorized
 */
router.get('/alerts', getAlerts);

/**
 * @swagger
 * /api/v1/admin/action:
 *   post:
 *     summary: Take action on a moderation alert
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alertId
 *               - action
 *             properties:
 *               alertId:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [allow, remove, review]
 *     responses:
 *       200:
 *         description: Action taken successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/action', takeAction);

/**
 * @swagger
 * /api/v1/admin/stats:
 *   get:
 *     summary: Get dashboard analytics (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalAnalyses:
 *                   type: number
 *                 mostCommonRiskLevels:
 *                   type: object
 *                 dailyActivity:
 *                   type: object
 *                 topUsers:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', getDashboardStats);

module.exports = router;

