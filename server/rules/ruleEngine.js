const { evaluateCondition } = require('./ruleOperators');
const { RESULT_CATEGORIES } = require('../constants');

const ENGINE_VERSION = '2.0.0';

const CATEGORY_WEIGHTS = {
  [RESULT_CATEGORIES.COUNSELOR_REVIEW]: 4,
  [RESULT_CATEGORIES.REVIEW_RECOMMENDED]: 3,
  [RESULT_CATEGORIES.INSUFFICIENT_INFORMATION]: 2,
  [RESULT_CATEGORIES.INFORMATIONAL]: 1
};

/**
 * Backward Chaining Demonstration Engine
 * Reconstructs a goal-driven explanation trace demonstrating how a specific target conclusion was established
 * @param {string} targetFact - The fact name to prove (e.g. 'professional_review_recommended')
 * @param {any} targetValue - The expected value (e.g. true)
 * @param {Array} allRules - Knowledge base rules
 * @param {Object} initialFacts - Base facts from family builder
 * @param {Object} derivedFacts - Facts derived during forward chaining
 * @returns {Object} Backward chaining proof trace
 */
function demonstrateBackwardChaining(targetFact, targetValue, allRules = [], initialFacts = {}, derivedFacts = {}) {
  const allFacts = { ...initialFacts, ...derivedFacts };
  const proofSteps = [];
  let stepCounter = 1;

  // Find rules that conclude targetFact === targetValue
  function traceGoal(factName, expectedVal, visitedFacts = new Set()) {
    if (visitedFacts.has(factName)) return true;
    visitedFacts.add(factName);

    // Find rule whose conclusion matches
    const matchingRules = allRules.filter(
      r => r.conclusion && r.conclusion.fact === factName && r.conclusion.value === expectedVal && r.isActive !== false
    );

    if (matchingRules.length === 0) {
      // Base fact check
      const actualVal = allFacts[factName];
      const isSatisfied = actualVal === expectedVal || (Boolean(actualVal) === Boolean(expectedVal));
      return isSatisfied;
    }

    // Pick the highest priority rule that established this conclusion
    matchingRules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    const establishingRule = matchingRules[0];

    let allPremisesMet = true;

    for (const cond of (establishingRule.conditions || [])) {
      const premiseActualVal = allFacts[cond.fact];
      const premiseSatisfied = evaluateCondition(premiseActualVal, cond.operator, cond.value);

      // Check if premise was derived from an upstream rule
      const upstreamRule = allRules.find(
        r => r.conclusion && r.conclusion.fact === cond.fact && r.isActive !== false
      );

      proofSteps.push({
        step: stepCounter++,
        ruleCode: establishingRule.ruleCode,
        ruleName: establishingRule.name,
        requiredFact: cond.fact,
        operator: cond.operator,
        expectedValue: cond.value,
        actualValue: premiseActualVal !== undefined ? premiseActualVal : '(not recorded)',
        satisfied: premiseSatisfied,
        derivedFromRule: upstreamRule ? upstreamRule.ruleCode : null
      });

      if (!premiseSatisfied) {
        allPremisesMet = false;
      } else if (upstreamRule && !visitedFacts.has(cond.fact)) {
        // Recursively trace upstream premises
        traceGoal(cond.fact, cond.value, visitedFacts);
      }
    }

    return allPremisesMet;
  }

  const isSatisfied = traceGoal(targetFact, targetValue);

  return {
    goal: targetFact,
    targetValue,
    satisfied: isSatisfied,
    proofSteps
  };
}

/**
 * Data-Driven Multi-Pass Forward Chaining Evaluation Engine
 * @param {Object} facts - Initial normalized facts extracted by factBuilder
 * @param {Array} rules - Knowledge base rules
 * @returns {Object} Assessment outcome with inferenceTrace and backwardChaining proof
 */
function evaluateRules(facts, rules = []) {
  const activeRules = rules
    .filter(r => r.isActive !== false)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const initialFacts = { ...facts };
  const workingFacts = { ...facts };
  const derivedFacts = {};
  const triggeredRules = [];
  const firedRuleCodes = new Set();
  const inferencePasses = [];

  let passNumber = 1;
  const maxPasses = 10;
  let newDerivationsInPass = true;

  // Forward Chaining Loop: evaluate rules, derive facts, and repeat until fixed point
  while (newDerivationsInPass && passNumber <= maxPasses) {
    newDerivationsInPass = false;
    const currentPassTriggered = [];
    const currentPassDerivedFacts = {};

    for (const rule of activeRules) {
      const ruleCode = rule.ruleCode || rule._id?.toString() || 'RULE-CUSTOM';
      if (firedRuleCodes.has(ruleCode)) continue;

      let allConditionsMet = true;
      const matchingFacts = {};

      for (const cond of (rule.conditions || [])) {
        const factValue = workingFacts[cond.fact];
        const isMet = evaluateCondition(factValue, cond.operator, cond.value);

        matchingFacts[cond.fact] = {
          actualValue: factValue,
          operator: cond.operator,
          expectedValue: cond.value,
          satisfied: isMet
        };

        if (!isMet) {
          allConditionsMet = false;
          break;
        }
      }

      if (allConditionsMet && rule.conditions && rule.conditions.length > 0) {
        firedRuleCodes.add(ruleCode);
        newDerivationsInPass = true;

        // If rule defines a conclusion fact, derive it and add to working memory
        if (rule.conclusion && rule.conclusion.fact) {
          derivedFacts[rule.conclusion.fact] = rule.conclusion.value;
          workingFacts[rule.conclusion.fact] = rule.conclusion.value;
          currentPassDerivedFacts[rule.conclusion.fact] = rule.conclusion.value;
        }

        const triggeredEntry = {
          ruleId: rule._id,
          ruleCode,
          name: rule.name,
          version: rule.version || 1,
          priority: rule.priority || 10,
          category: rule.category || 'GENERAL',
          resultCategory: rule.result?.category || RESULT_CATEGORIES.REVIEW_RECOMMENDED,
          conclusion: rule.conclusion || null,
          passNumber,
          matchingFacts,
          explanation: rule.explanation,
          guidance: rule.guidance || []
        };

        triggeredRules.push(triggeredEntry);
        currentPassTriggered.push(ruleCode);
      }
    }

    inferencePasses.push({
      passNumber,
      rulesEvaluated: activeRules.length,
      rulesTriggered: currentPassTriggered,
      newFactsDerived: currentPassDerivedFacts
    });

    if (currentPassTriggered.length > 0) {
      passNumber++;
    } else {
      break;
    }
  }

  // Determine dominant result category based on severity priority
  let dominantCategory = RESULT_CATEGORIES.INFORMATIONAL;
  let highestWeight = 0;

  triggeredRules.forEach(r => {
    const weight = CATEGORY_WEIGHTS[r.resultCategory] || 1;
    if (weight > highestWeight) {
      highestWeight = weight;
      dominantCategory = r.resultCategory;
    }
  });

  // Fallback when no rules fired
  if (triggeredRules.length === 0) {
    dominantCategory = facts.required_family_information_missing && !facts.condition_present
      ? RESULT_CATEGORIES.INSUFFICIENT_INFORMATION
      : RESULT_CATEGORIES.INFORMATIONAL;
  }

  // Determine Primary Goal for Backward Chaining Demonstration
  let primaryGoalFact = 'baseline_standard_risk';
  let primaryGoalValue = true;

  if (dominantCategory === RESULT_CATEGORIES.COUNSELOR_REVIEW) {
    const topCounselorRule = triggeredRules.find(r => r.resultCategory === RESULT_CATEGORIES.COUNSELOR_REVIEW);
    if (topCounselorRule && topCounselorRule.conclusion?.fact) {
      primaryGoalFact = topCounselorRule.conclusion.fact;
      primaryGoalValue = topCounselorRule.conclusion.value;
    } else {
      primaryGoalFact = 'autosomal_dominant_pattern';
      primaryGoalValue = true;
    }
  } else if (dominantCategory === RESULT_CATEGORIES.REVIEW_RECOMMENDED) {
    primaryGoalFact = 'professional_review_recommended';
    primaryGoalValue = true;
  } else if (dominantCategory === RESULT_CATEGORIES.INSUFFICIENT_INFORMATION) {
    primaryGoalFact = 'insufficient_information_flag';
    primaryGoalValue = true;
  }

  const backwardChainingProof = demonstrateBackwardChaining(
    primaryGoalFact,
    primaryGoalValue,
    activeRules,
    initialFacts,
    derivedFacts
  );

  // Human-readable, non-frightening executive summary
  let summary = '';
  if (dominantCategory === RESULT_CATEGORIES.INSUFFICIENT_INFORMATION) {
    summary = 'Limited family health history is currently recorded. Adding additional relatives and health details will allow the system to evaluate inheritance patterns more thoroughly.';
  } else if (dominantCategory === RESULT_CATEGORIES.INFORMATIONAL) {
    summary = 'No significant hereditary risk factors or multi-generational conditions were identified from the information provided. Routine preconception care is recommended.';
  } else if (dominantCategory === RESULT_CATEGORIES.REVIEW_RECOMMENDED) {
    summary = `The family history contains indicators (such as multiple affected relatives or familial patterns) that warrant discussion with a healthcare professional or genetic counselor.`;
  } else if (dominantCategory === RESULT_CATEGORIES.COUNSELOR_REVIEW) {
    const topRule = triggeredRules.find(r => r.resultCategory === RESULT_CATEGORIES.COUNSELOR_REVIEW) || triggeredRules[0];
    summary = `Multiple assessment factors were identified, including ${topRule ? topRule.name.toLowerCase() : 'high-probability hereditary patterns'}. A formal consultation with a certified genetic counselor is recommended prior to conception.`;
  }

  // Collect distinct guidance recommendations
  const guidanceSet = new Set();
  triggeredRules.forEach(r => {
    (r.guidance || []).forEach(g => guidanceSet.add(g));
  });

  if (guidanceSet.size === 0) {
    guidanceSet.add('Consider discussing your family health history with a qualified healthcare professional or genetic counselor.');
    guidanceSet.add('Keep family medical history updated as new clinical information becomes available in your family.');
  }

  return {
    engineVersion: ENGINE_VERSION,
    resultCategory: dominantCategory,
    summary,
    facts: initialFacts,
    derivedFacts,
    inferenceTrace: {
      passes: inferencePasses,
      totalPasses: inferencePasses.length
    },
    backwardChaining: backwardChainingProof,
    triggeredRules,
    guidance: Array.from(guidanceSet),
    disclaimer: 'This assessment is based only on the family information entered into the system. It is not a medical diagnosis or a prediction of whether a person will develop or transmit a condition. Consider discussing your family history with a qualified healthcare professional or genetic counselor.'
  };
}

module.exports = {
  evaluateRules,
  demonstrateBackwardChaining,
  ENGINE_VERSION
};
