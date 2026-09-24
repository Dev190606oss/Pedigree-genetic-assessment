const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');
const {
  getAssignedCases,
  getCaseDetails,
  addNote,
  updateCaseStatus,
  getCounselorStats
} = require('../controllers/counselorController');

// Restricted to Counselor and Admin
router.use(authenticate);
router.use(authorize(ROLES.COUNSELOR, ROLES.ADMIN));

router.get('/cases', getAssignedCases);
router.get('/cases/:familyId', getCaseDetails);
router.post('/cases/:familyId/notes', addNote);
router.patch('/cases/:familyId/status', updateCaseStatus);
router.get('/stats', getCounselorStats);

module.exports = router;
