const Alert = require('../models/Alerts');
const Content = require('../models/Content');

/**
 * Create a new alert
 */
async function createAlert(alertData) {
  try {
    const alert = new Alert(alertData);
    await alert.save();
    await alert.populate('content', 'contentId type credibilityScore riskLevel');
    await alert.populate('flaggedBy', 'name email');
    return alert;
  } catch (error) {
    throw error;
  }
}

/**
 * Get alert by ID
 */
async function getAlertById(alertId) {
  try {
    const alert = await Alert.findById(alertId)
      .populate('content', 'contentId type credibilityScore riskLevel summary')
      .populate('flaggedBy', 'name email')
      .populate('actionedBy', 'name email');
    return alert;
  } catch (error) {
    throw error;
  }
}

/**
 * Update alert
 */
async function updateAlert(alertId, updateData) {
  try {
    const alert = await Alert.findByIdAndUpdate(alertId, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('content', 'contentId type credibilityScore riskLevel summary')
      .populate('flaggedBy', 'name email')
      .populate('actionedBy', 'name email');
    return alert;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete alert
 */
async function deleteAlert(alertId) {
  try {
    const alert = await Alert.findByIdAndDelete(alertId);
    return alert;
  } catch (error) {
    throw error;
  }
}

/**
 * List alerts with pagination
 */
async function listAlerts(page = 1, limit = 50, filters = {}) {
  try {
    const skip = (page - 1) * limit;
    const alerts = await Alert.find(filters)
      .populate('content', 'contentId type credibilityScore riskLevel summary')
      .populate('flaggedBy', 'name email')
      .populate('actionedBy', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Alert.countDocuments(filters);
    
    return {
      alerts,
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
 * Create alert for high-risk content
 */
async function createAlertForHighRisk(contentId, flaggedBy = null, riskLevel = 'high') {
  try {
    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }
    
    // Check if alert already exists
    const existingAlert = await Alert.findOne({ 
      content: contentId, 
      status: 'pending' 
    });
    
    if (existingAlert) {
      return existingAlert;
    }
    
    const alert = await createAlert({
      content: contentId,
      riskLevel: riskLevel || content.riskLevel,
      flaggedBy: flaggedBy,
      status: 'pending',
    });
    
    return alert;
  } catch (error) {
    throw error;
  }
}

/**
 * Mark alert as resolved
 */
async function markAlertResolved(alertId, action, actionedBy, notes = '') {
  try {
    if (!['allowed', 'removed'].includes(action)) {
      throw new Error('Invalid action. Must be "allowed" or "removed"');
    }
    
    const alert = await updateAlert(alertId, {
      status: action === 'allowed' ? 'allowed' : 'removed',
      actionedBy: actionedBy,
      actionedAt: new Date(),
      notes: notes,
    });
    
    return alert;
  } catch (error) {
    throw error;
  }
}

/**
 * Get alerts by status
 */
async function getAlertsByStatus(status, page = 1, limit = 50) {
  try {
    return await listAlerts(page, limit, { status });
  } catch (error) {
    throw error;
  }
}

/**
 * Get alerts by risk level
 */
async function getAlertsByRiskLevel(riskLevel, page = 1, limit = 50) {
  try {
    return await listAlerts(page, limit, { riskLevel });
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAlert,
  getAlertById,
  updateAlert,
  deleteAlert,
  listAlerts,
  createAlertForHighRisk,
  markAlertResolved,
  getAlertsByStatus,
  getAlertsByRiskLevel,
};

