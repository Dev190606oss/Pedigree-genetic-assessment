const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');
const {
  getUsers,
  toggleUserStatus,
  getCounselors,
  getConditions,
  createCondition,
  updateCondition,
  deleteCondition,
  getRules,
  createRule,
  updateRule,
  deleteRule,
  assignCase,
  getAnalytics,
  getAuditLogs
} = require('../controllers/adminController');

// Restricted exclusively to Admin
router.use(authenticate);
router.use(authorize(ROLES.ADMIN));

// User & Counselor Management
router.get('/users', getUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/counselors', getCounselors);

// Genetic Conditions Catalogue
router.get('/conditions', getConditions);
router.post('/conditions', createCondition);
router.patch('/conditions/:id', updateCondition);
router.delete('/conditions/:id', deleteCondition);

// AIES Rules Governance
router.get('/rules', getRules);
router.post('/rules', createRule);
router.patch('/rules/:id', updateRule);
router.delete('/rules/:id', deleteRule);

// Case Assignment
router.post('/assign-case', assignCase);

// Analytics & Audit
router.get('/analytics', getAnalytics);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
