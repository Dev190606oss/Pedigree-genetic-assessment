const { Family, FamilyMember, Relationship, FamilyMemberCondition, Rule, Assessment, Notification } = require('../models');
const { buildFacts } = require('../rules/factBuilder');
const { evaluateRules } = require('../rules/ruleEngine');
const defaultRules = require('../rules/defaultRules');
const { logAudit } = require('../middleware/audit');
const { NOTIFICATION_TYPES } = require('../constants');

/**
 * Executes a full preconception genetic assessment for a family
 * @param {string} familyId
 * @param {string} userId - User initiating the assessment
 * @returns {Promise<Object>} Saved assessment document with facts and triggered rules
 */
async function executeAssessment(familyId, userId) {
  // 1. Fetch complete family dataset
  const family = await Family.findById(familyId);
  if (!family) {
    throw new Error('Family not found');
  }

  const members = await FamilyMember.find({ familyId });
  const relationships = await Relationship.find({ familyId }).populate('fromMemberId toMemberId');
  const conditions = await FamilyMemberCondition.find({ familyId }).populate('conditionId memberId');

  // 2. Build normalized facts from family graph
  const facts = buildFacts({
    family,
    members,
    relationships,
    conditions
  });

  // 3. Load active rules from DB, or fallback to default genetic rules
  let rules = await Rule.find({ isActive: true }).sort({ priority: -1 });
  if (!rules || rules.length === 0) {
    rules = defaultRules;
  }

  // 4. Run deterministic rule evaluation
  const evaluationResult = evaluateRules(facts, rules);

  // 5. Build input snapshot
  const inputSnapshot = {
    family: { _id: family._id, name: family.name, description: family.description },
    members: members.map(m => ({
      _id: m._id,
      name: m.name,
      sex: m.sex,
      dateOfBirth: m.dateOfBirth,
      isProband: m.isProband,
      deceased: m.deceased
    })),
    relationships: relationships.map(r => ({
      _id: r._id,
      fromMemberId: r.fromMemberId?._id || r.fromMemberId,
      toMemberId: r.toMemberId?._id || r.toMemberId,
      type: r.type
    })),
    conditions: conditions.map(c => ({
      _id: c._id,
      memberId: c.memberId?._id || c.memberId,
      conditionName: c.conditionId?.name || 'Unknown',
      conditionCode: c.conditionId?.code || 'UNK',
      status: c.status,
      ageAtOnset: c.ageAtOnset
    }))
  };

  // 6. Create assessment record
  const assessment = await Assessment.create({
    familyId: family._id,
    userId,
    inputSnapshot,
    facts,
    derivedFacts: evaluationResult.derivedFacts,
    inferenceTrace: evaluationResult.inferenceTrace,
    backwardChaining: evaluationResult.backwardChaining,
    triggeredRules: evaluationResult.triggeredRules,
    resultCategory: evaluationResult.resultCategory,
    summary: evaluationResult.summary,
    guidance: evaluationResult.guidance,
    disclaimer: evaluationResult.disclaimer,
    engineVersion: evaluationResult.engineVersion
  });

  // 7. Audit log & notification
  await logAudit({
    actorId: userId,
    action: 'ASSESSMENT_EXECUTED',
    entityType: 'Assessment',
    entityId: assessment._id,
    metadata: {
      familyId: family._id,
      resultCategory: assessment.resultCategory,
      triggeredRulesCount: assessment.triggeredRules.length
    }
  });

  await Notification.create({
    recipientId: userId,
    title: 'Assessment Complete',
    message: `Preconception assessment for family "${family.name}" completed with outcome: ${assessment.resultCategory.replace(/_/g, ' ')}.`,
    type: NOTIFICATION_TYPES.ASSESSMENT_COMPLETED,
    link: `/user/assessments/${assessment._id}`
  });

  return assessment;
}

module.exports = {
  executeAssessment
};
