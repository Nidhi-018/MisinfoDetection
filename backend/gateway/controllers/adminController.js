const mongoose = require('mongoose');
const alertService = require('../db/services/alertService');
const contentService = require('../db/services/contentService');
const feedbackService = require('../db/services/feedbackService');
const userService = require('../db/services/userService');

/**
 * Get moderation alerts
 */
async function getAlerts(req, res, next) {
  try {
    const status = req.query.status || 'pending'; // pending, allowed, removed
    const limit = parseInt(req.query.limit || '50', 10);
    const page = parseInt(req.query.page || '1', 10);

    // Build filters
    const filters = {};
    if (status && status !== 'all') {
      filters.status = status;
    }

    // Get alerts from MongoDB
    const result = await alertService.listAlerts(page, limit, filters);

    // Format response
    const alertsFormatted = result.alerts.map((alert) => ({
      id: alert._id,
      content_id: alert.content?._id?.toString(),
      content_type: alert.content?.type,
      content_preview: alert.content?.summary?.substring(0, 100) || '',
      risk_level: alert.riskLevel,
      flagged_by: alert.flaggedBy?._id?.toString() || alert.flaggedBy?.toString(),
      reported_at: alert.createdAt,
      status: alert.status,
      notes: alert.notes,
      actioned_by: alert.actionedBy?._id?.toString() || alert.actionedBy?.toString(),
      actioned_at: alert.actionedAt,
    }));

    res.json({
      alerts: alertsFormatted,
      count: alertsFormatted.length,
      total: result.pagination.total,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Take action on an alert
 */
async function takeAction(req, res, next) {
  try {
    const { alertId, action, notes } = req.body;

    if (!alertId || !action) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'alertId and action are required' },
      });
    }

    if (!['allow', 'remove'].includes(action)) {
      return res.status(400).json({
        error: { status: 400, message: 'Invalid input', details: 'action must be "allow" or "removed"' },
      });
    }

    const actionedByUserId = req.user?.userId || null;
    const actionedBy = actionedByUserId && mongoose.Types.ObjectId.isValid(actionedByUserId)
      ? new mongoose.Types.ObjectId(actionedByUserId)
      : actionedByUserId;

    // Mark alert as resolved
    const alert = await alertService.markAlertResolved(
      alertId,
      action === 'allow' ? 'allowed' : 'removed',
      actionedBy,
      notes || ''
    );

    if (!alert) {
      return res.status(404).json({
        error: { status: 404, message: 'Alert not found' },
      });
    }

    // Format response
    const alertFormatted = {
      id: alert._id,
      content_id: alert.content?._id?.toString(),
      content_type: alert.content?.type,
      risk_level: alert.riskLevel,
      status: alert.status,
      notes: alert.notes,
      actioned_by: alert.actionedBy?._id?.toString() || alert.actionedBy?.toString(),
      actioned_at: alert.actionedAt,
    };

    res.json({
      success: true,
      alert: alertFormatted,
      message: `Alert ${action}ed successfully`,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAlerts,
  takeAction,
};

