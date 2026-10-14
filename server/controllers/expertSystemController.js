const { Rule, Family, FamilyMember, Relationship, FamilyMemberCondition } = require('../models');
const defaultRules = require('../rules/defaultRules');
const { buildFacts } = require('../rules/factBuilder');
const { evaluateRules, evaluateBackwardChaining } = require('../rules/ruleEngine');
const { SYNTHETIC_DEMO_CASES } = require('../rules/syntheticCases');

/**
 * Fetch knowledge base rules
 * GET /api/expert-system/rules
 */
async function getRules(req, res) {
  try {
    let rules = [];
    try {
      rules = await Rule.find({ isActive: true }).sort({ priority: -1 }).lean();
    } catch (dbErr) {
      // Fall back gracefully if DB is unavailable
    }

    if (!rules || rules.length === 0) {
      rules = defaultRules.filter(r => r.isActive !== false);
    }

    return res.status(200).json({
      success: true,
      count: rules.length,
      rules
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve expert system rules',
      error: err.message
    });
  }
}

/**
 * Fetch synthetic demonstration cases
 * GET /api/expert-system/demo-cases
 */
function getDemoCases(req, res) {
  try {
    return res.status(200).json({
      success: true,
      count: SYNTHETIC_DEMO_CASES.length,
      cases: SYNTHETIC_DEMO_CASES
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load synthetic demonstration cases',
      error: err.message
    });
  }
}

/**
 * Run transparent inference engine evaluation on synthetic case or user family
 * POST /api/expert-system/evaluate
 */
async function evaluateInference(req, res) {
  try {
    const { caseId, familyId, customFacts } = req.body;

    let targetFacts = null;
    let caseMetadata = null;

    if (caseId) {
      const demoCase = SYNTHETIC_DEMO_CASES.find(c => c.id === caseId);
      if (!demoCase) {
        return res.status(404).json({ success: false, message: `Synthetic case '${caseId}' not found.` });
      }
      targetFacts = { ...demoCase.facts };
      caseMetadata = {
        id: demoCase.id,
        title: demoCase.title,
        badge: demoCase.badge,
        clinicalDescription: demoCase.clinicalDescription,
        aiesFocus: demoCase.aiesFocus,
        expectedOutcome: demoCase.expectedOutcome,
        sampleFamily: demoCase.sampleFamily
      };
    } else if (familyId) {
      const family = await Family.findById(familyId).lean();
      if (!family) {
        return res.status(404).json({ success: false, message: 'Family not found.' });
      }

      // Security check: If authenticated user is USER role, ensure ownership
      if (req.user && req.user.role === 'USER' && family.ownerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied to this family.' });
      }

      const members = await FamilyMember.find({ familyId }).lean();
      const relationships = await Relationship.find({ familyId }).lean();
      const conditions = await FamilyMemberCondition.find({ familyId }).populate('conditionId').lean();

      targetFacts = buildFacts({ family, members, relationships, conditions });
      caseMetadata = {
        id: familyId,
        title: family.name,
        badge: 'User Pedigree',
        clinicalDescription: `Live evaluation of user family '${family.name}' with ${members.length} members and ${conditions.length} condition records.`
      };
    } else if (customFacts && typeof customFacts === 'object') {
      targetFacts = { ...customFacts };
      caseMetadata = {
        id: 'custom-scenario',
        title: 'Custom Evaluation Scenario',
        badge: 'Custom Working Memory',
        clinicalDescription: 'Live evaluation of custom asserted facts.'
      };
    } else {
      return res.status(400).json({
        success: false,
        message: 'Must provide either caseId, familyId, or customFacts in request body.'
      });
    }

    // Load active rules
    let rules = [];
    try {
      rules = await Rule.find({ isActive: true }).sort({ priority: -1 }).lean();
    } catch (dbErr) {
      // Fall back to default rules
    }

    if (!rules || rules.length === 0) {
      rules = defaultRules.filter(r => r.isActive !== false);
    }

    // Execute multi-pass forward chaining and goal deduction
    const assessmentResult = evaluateRules(targetFacts, rules);

    return res.status(200).json({
      success: true,
      caseMetadata,
      facts: assessmentResult.facts,
      derivedFacts: assessmentResult.derivedFacts,
      resultCategory: assessmentResult.resultCategory,
      summary: assessmentResult.summary,
      inferenceTrace: assessmentResult.inferenceTrace,
      conflictResolution: assessmentResult.inferenceTrace?.conflictResolution,
      backwardChaining: assessmentResult.backwardChaining,
      triggeredRules: assessmentResult.triggeredRules,
      guidance: assessmentResult.guidance,
      disclaimer: assessmentResult.disclaimer
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Inference evaluation failed',
      error: err.message
    });
  }
}

/**
 * Run interactive backward chaining on arbitrary goal hypothesis
 * POST /api/expert-system/query-goal
 */
async function queryGoal(req, res) {
  try {
    const { goalFact, targetValue = true, facts = {}, derivedFacts = {} } = req.body;

    if (!goalFact) {
      return res.status(400).json({ success: false, message: 'goalFact is required.' });
    }

    let rules = [];
    try {
      rules = await Rule.find({ isActive: true }).sort({ priority: -1 }).lean();
    } catch (dbErr) {
      // Fall back
    }

    if (!rules || rules.length === 0) {
      rules = defaultRules.filter(r => r.isActive !== false);
    }

    const proof = evaluateBackwardChaining(goalFact, targetValue, rules, facts, derivedFacts);

    return res.status(200).json({
      success: true,
      proof
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Backward chaining query failed',
      error: err.message
    });
  }
}

module.exports = {
  getRules,
  getDemoCases,
  evaluateInference,
  queryGoal
};
