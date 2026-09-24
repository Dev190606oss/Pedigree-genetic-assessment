const { AuditLog } = require('../models');

/**
 * Creates an audit log entry
 * @param {Object} params
 * @param {string} params.actorId - User ID who triggered the action
 * @param {string} params.action - Action name (e.g., USER_LOGIN, CREATE_FAMILY, EVALUATE_ASSESSMENT)
 * @param {string} params.entityType - Target entity (e.g., User, Family, Rule, Assessment)
 * @param {string} [params.entityId] - Target entity ID
 * @param {string} [params.ipAddress]
 * @param {Object} [params.metadata]
 */
async function logAudit({ actorId = null, action, entityType, entityId = null, ipAddress = '', metadata = {} }) {
  try {
    await AuditLog.create({
      actorId,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      ipAddress,
      metadata
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
}

module.exports = { logAudit };
