const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  runAssessment,
  getFamilyAssessments,
  getAssessmentById
} = require('../controllers/assessmentController');

router.use(authenticate);

router.post('/', runAssessment);
router.get('/family/:familyId', getFamilyAssessments);
router.get('/:id', getAssessmentById);

module.exports = router;
