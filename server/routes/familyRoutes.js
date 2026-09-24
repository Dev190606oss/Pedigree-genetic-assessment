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
  deleteMemberCondition
} = require('../controllers/familyController');

// All family routes require authentication
router.use(authenticate);

// Families CRUD
router.get('/', getFamilies);
router.post('/', createFamily);
router.get('/:id', getFamilyById);
router.patch('/:id', updateFamily);
router.delete('/:id', deleteFamily);

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
