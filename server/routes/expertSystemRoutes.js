const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getRules,
  getDemoCases,
  evaluateInference,
  queryGoal
} = require('../controllers/expertSystemController');

// All AIES analysis endpoints use optional authentication
router.use(optionalAuth);

// GET /api/expert-system/rules - Knowledge base rules
router.get('/rules', getRules);

// GET /api/expert-system/demo-cases - Curated synthetic demonstration scenarios
router.get('/demo-cases', getDemoCases);

// POST /api/expert-system/evaluate - Run transparent inference on synthetic case or family
router.post('/evaluate', evaluateInference);

// POST /api/expert-system/query-goal - Interactive backward chaining goal investigator
router.post('/query-goal', queryGoal);

module.exports = router;
