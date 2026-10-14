const { evaluateCondition } = require('./ruleOperators');
const { RESULT_CATEGORIES } = require('../constants');

const ENGINE_VERSION = '2.1.0';

const CATEGORY_WEIGHTS = {
  [RESULT_CATEGORIES.COUNSELOR_REVIEW]: 4,
  [RESULT_CATEGORIES.REVIEW_RECOMMENDED]: 3,
  [RESULT_CATEGORIES.INSUFFICIENT_INFORMATION]: 2,
  [RESULT_CATEGORIES.INFORMATIONAL]: 1
};

/**
 * Backward Chaining Goal Investigator
 * Proves or refutes a specific hypothesis fact by recursively checking working memory and production rules.
 * @param {string} targetFact - The fact name to prove (e.g. 'autosomal_dominant_pattern')
 * @param {any} targetValue - The expected value (e.g. true)
 * @param {Array} allRules - Knowledge base rules
 * @param {Object} initialFacts - Base facts from family builder
 * @param {Object} derivedFacts - Facts derived during forward chaining
 * @returns {Object} Backward chaining proof trace
 */
function evaluateBackwardChaining(targetFact, targetValue = true, allRules = [], initialFacts = {}, derivedFacts = {}) {
  const allFacts = { ...initialFacts, ...derivedFacts };
  const proofSteps = [];
  let stepCounter = 1;
  const visited = new Set();

  function traceGoal(factName, expectedVal) {
    const goalKey = `${factName}=${expectedVal}`;
    if (visited.has(goalKey)) return { satisfied: true, cycleDetected: true };
    visited.add(goalKey);

    // 1. Direct working memory check
    const currentVal = allFacts[factName];
    const isPresentInFacts = currentVal !== undefined && (
      currentVal === expectedVal || Boolean(currentVal) === Boolean(expectedVal)
    );

    // 2. Candidate rules in KB that conclude this fact
    const candidateRules = allRules.filter(
      r => r.conclusion &&
           r.conclusion.fact === factName &&
           (r.conclusion.value === expectedVal || Boolean(r.conclusion.value) === Boolean(expectedVal)) &&
           r.isActive !== false
    ).sort((a, b) => (b.priority || 0) - (a.priority || 0));

    if (candidateRules.length === 0) {
      proofSteps.push({
        step: stepCounter++,
        goal: factName,
        expectedValue: expectedVal,
        actualValue: currentVal !== undefined ? currentVal : '(not present in working memory)',
        source: 'BASE_WORKING_MEMORY',
        satisfied: isPresentInFacts,
        status: isPresentInFacts ? 'CONFIRMED_FROM_FACTS' : 'UNMET_BASE_FACT',
        explanation: isPresentInFacts
          ? `Fact '${factName}' is directly verified in working memory with value '${currentVal}'.`
          : `Fact '${factName}' is absent or false in working memory and no rule in KB can deduce it.`
      });
      return { satisfied: isPresentInFacts, ruleUsed: null };
    }

    let goalProven = false;
    let successfulRule = null;

    for (const rule of candidateRules) {
      const conditionLogic = (rule.conditionLogic || 'AND').toUpperCase();
      const conditions = rule.conditions || [];
      const premiseResults = [];

      for (const cond of conditions) {
        const condActualVal = allFacts[cond.fact];
        const condDirectSatisfied = evaluateCondition(condActualVal, cond.operator, cond.value);

        const upstreamRule = allRules.find(
          r => r.conclusion && r.conclusion.fact === cond.fact && r.isActive !== false
        );

        let subProof = { satisfied: condDirectSatisfied };
        if (upstreamRule && !visited.has(`${cond.fact}=${cond.value}`)) {
          subProof = traceGoal(cond.fact, cond.value);
        }

        const premiseSatisfied = condDirectSatisfied || subProof.satisfied;
        premiseResults.push({
          requiredFact: cond.fact,
          operator: cond.operator,
          expectedValue: cond.value,
          actualValue: condActualVal !== undefined ? condActualVal : '(not recorded)',
          satisfied: premiseSatisfied,
          derivedFromRule: upstreamRule ? upstreamRule.ruleCode : null
        });

        proofSteps.push({
          step: stepCounter++,
          ruleCode: rule.ruleCode,
          ruleName: rule.name,
          goal: factName,
          requiredFact: cond.fact,
          operator: cond.operator,
          expectedValue: cond.value,
          actualValue: condActualVal !== undefined ? condActualVal : '(not recorded)',
          satisfied: premiseSatisfied,
          derivedFromRule: upstreamRule ? upstreamRule.ruleCode : null,
          upstreamDeduced: Boolean(upstreamRule),
          explanation: premiseSatisfied
            ? `Premise '${cond.fact} ${cond.operator} ${cond.value}' satisfied (actual: ${condActualVal})${upstreamRule ? ` [derived via rule ${upstreamRule.ruleCode}]` : ''}.`
            : `Premise '${cond.fact} ${cond.operator} ${cond.value}' unmet (actual: ${condActualVal}).`
        });
      }

      const ruleMet = conditions.length > 0 && (
        conditionLogic === 'OR'
          ? premiseResults.some(p => p.satisfied)
          : premiseResults.every(p => p.satisfied)
      );

      if (ruleMet) {
        goalProven = true;
        successfulRule = rule;
        break;
      }
    }

    return { satisfied: goalProven || isPresentInFacts, ruleUsed: successfulRule };
  }

  const result = traceGoal(targetFact, targetValue);

  return {
    goal: targetFact,
    targetValue,
    satisfied: result.satisfied,
    status: result.satisfied ? 'PROVEN' : 'REFUTED',
    ruleUsed: result.ruleUsed ? (result.ruleUsed.ruleCode || result.ruleUsed.name) : null,
    proofSteps,
    summary: result.satisfied
      ? `Goal hypothesis '${targetFact} = ${targetValue}' is PROVEN through knowledge base deduction and evidence.`
      : `Goal hypothesis '${targetFact} = ${targetValue}' is REFUTED: required premises were not satisfied by available evidence.`
  };
}

/**
 * Backward Chaining Demonstration Engine (wrapper for backward compatibility)
 */
function demonstrateBackwardChaining(targetFact, targetValue, allRules = [], initialFacts = {}, derivedFacts = {}) {
  return evaluateBackwardChaining(targetFact, targetValue, allRules, initialFacts, derivedFacts);
}

/**
 * Data-Driven Multi-Pass Forward Chaining Evaluation Engine
 * @param {Object} facts - Initial normalized facts extracted by factBuilder
 * @param {Array} rules - Knowledge base rules
 * @returns {Object} Assessment outcome with inferenceTrace, conflictResolution, and backwardChaining proof
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
    const passEvaluatedRules = [];

    for (const rule of activeRules) {
      const ruleCode = rule.ruleCode || rule._id?.toString() || 'RULE-CUSTOM';
      if (firedRuleCodes.has(ruleCode)) continue;

      const conditionLogic = (rule.conditionLogic || 'AND').toUpperCase();
      const conditions = rule.conditions || [];

      const conditionEvaluations = conditions.map(cond => {
        const factValue = workingFacts[cond.fact];
        const satisfied = evaluateCondition(factValue, cond.operator, cond.value);
        return {
          fact: cond.fact,
          operator: cond.operator,
          expectedValue: cond.value,
          actualValue: factValue !== undefined ? factValue : null,
          satisfied
        };
      });

      const ruleTriggered = conditions.length > 0 && (
        conditionLogic === 'OR'
          ? conditionEvaluations.some(c => c.satisfied)
          : conditionEvaluations.every(c => c.satisfied)
      );

      const matchingFacts = {};
      conditionEvaluations.forEach(c => {
        matchingFacts[c.fact] = c;
      });

      const unmetConditions = conditionEvaluations.filter(c => !c.satisfied);

      passEvaluatedRules.push({
        ruleCode,
        name: rule.name,
        priority: rule.priority || 10,
        category: rule.category || 'GENERAL',
        conditionLogic,
        resultCategory: rule.result?.category || RESULT_CATEGORIES.REVIEW_RECOMMENDED,
        status: ruleTriggered ? 'TRIGGERED' : 'UNMET',
        conditionEvaluations,
        unmetConditions: unmetConditions.map(c => ({
          fact: c.fact,
          operator: c.operator,
          expectedValue: c.expectedValue,
          actualValue: c.actualValue
        }))
      });

      if (ruleTriggered) {
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
          conditionLogic,
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
      rulesTriggeredCount: currentPassTriggered.length,
      newFactsDerived: currentPassDerivedFacts,
      evaluatedRules: passEvaluatedRules
    });

    if (currentPassTriggered.length > 0) {
      passNumber++;
    } else {
      break;
    }
  }

  // --- Conflict Resolution & Dominant Outcome Determination ---
  const candidateRules = triggeredRules.map(r => ({
    ruleCode: r.ruleCode,
    name: r.name,
    priority: r.priority,
    resultCategory: r.resultCategory,
    categoryWeight: CATEGORY_WEIGHTS[r.resultCategory] || 1
  }));

  // Sort candidates by category weight descending, then by rule priority descending
  candidateRules.sort((a, b) => {
    if (b.categoryWeight !== a.categoryWeight) {
      return b.categoryWeight - a.categoryWeight;
    }
    return (b.priority || 0) - (a.priority || 0);
  });

  const winningRule = candidateRules[0] || null;
  let dominantCategory = winningRule ? winningRule.resultCategory : RESULT_CATEGORIES.INFORMATIONAL;

  // Fallback when no rules fired
  if (triggeredRules.length === 0) {
    dominantCategory = facts.required_family_information_missing && !facts.condition_present
      ? RESULT_CATEGORIES.INSUFFICIENT_INFORMATION
      : RESULT_CATEGORIES.INFORMATIONAL;
  }

  const conflictResolution = {
    strategy: 'Priority-Weighted Severity Dominance with Rule Priority Tie-Breaking',
    criteria: [
      'Severity Precedence: COUNSELOR_REVIEW (weight 4) > REVIEW_RECOMMENDED (weight 3) > INSUFFICIENT_INFORMATION (weight 2) > INFORMATIONAL (weight 1)',
      'Intra-Category Resolution: Higher numerical priority wins conflict among co-occurring rules in the same risk tier',
      'Determinism Guarantee: Production rules evaluated deterministically without stochastic or heuristic divergence'
    ],
    candidatesEvaluated: candidateRules,
    winningRuleCode: winningRule ? winningRule.ruleCode : null,
    winningRuleName: winningRule ? winningRule.name : 'Default Baseline Evaluation',
    winningCategory: dominantCategory,
    rationale: winningRule
      ? `Rule ${winningRule.ruleCode} ("${winningRule.name}") determined dominant outcome due to highest risk tier (${winningRule.resultCategory}, weight: ${winningRule.categoryWeight}) with priority ${winningRule.priority}.`
      : (facts.required_family_information_missing
          ? 'No clinical condition rules triggered, but incomplete biological lineage flagged INSUFFICIENT_INFORMATION to avoid false reassurance.'
          : 'No abnormal genetic risk rules triggered; assigned standard baseline INFORMATIONAL outcome.')
  };

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

  const backwardChainingProof = evaluateBackwardChaining(
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
      totalPasses: inferencePasses.length,
      conflictResolution
    },
    conflictResolution,
    backwardChaining: backwardChainingProof,
    triggeredRules,
    guidance: Array.from(guidanceSet),
    disclaimer: 'This assessment is based only on the family information entered into the system. It is not a medical diagnosis or a prediction of whether a person will develop or transmit a condition. Consider discussing your family history with a qualified healthcare professional or genetic counselor.'
  };
}

module.exports = {
  evaluateRules,
  evaluateBackwardChaining,
  demonstrateBackwardChaining,
  ENGINE_VERSION
};
