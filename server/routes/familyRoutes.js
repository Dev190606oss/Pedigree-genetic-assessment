const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getFamilies,
  createFamily,
  getFamilyById,
  updateFamily,
  deleteFamily,
  addMember,
  updateMember,
  deleteMember,
  addRelationship,
  deleteRelationship,
  addMemberCondition,
  deleteMemberCondition,
  getScenarios,
  quickFill,
  resetFamily
} = require('../controllers/familyController');

// All family routes require authentication
router.use(authenticate);

// Scenarios catalog for Quick Fill
router.get('/quick-fill-scenarios', getScenarios);

// Families CRUD
router.get('/', getFamilies);
router.post('/', createFamily);
router.get('/:id', getFamilyById);
router.patch('/:id', updateFamily);
router.delete('/:id', deleteFamily);

// Case Quick-Fill and Reset
router.post('/:id/quick-fill', quickFill);
router.post('/:id/reset', resetFamily);

// Members
router.post('/:id/members', addMember);
router.patch('/:id/members/:memberId', updateMember);
router.delete('/:id/members/:memberId', deleteMember);

// Relationships
router.post('/:id/relationships', addRelationship);
router.delete('/:id/relationships/:relationshipId', deleteRelationship);

// Member Conditions
router.post('/:id/conditions', addMemberCondition);
router.delete('/:id/conditions/:conditionRecordId', deleteMemberCondition);

module.exports = router;
