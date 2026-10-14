import { describe, it, expect } from 'vitest';
const { evaluateRules, evaluateBackwardChaining } = require('../rules/ruleEngine');
const defaultRules = require('../rules/defaultRules');
const { SYNTHETIC_DEMO_CASES } = require('../rules/syntheticCases');
const { RESULT_CATEGORIES, RULE_OPERATORS } = require('../constants');

describe('GeneTrace AIES Engine — Production Rules & Logical Operators', () => {
  it('correctly evaluates conditionLogic "AND" requiring all premises to be satisfied', () => {
    const customRule = {
      ruleCode: 'TEST-AND-01',
      name: 'Test AND Production Rule',
      category: 'TEST',
      priority: 50,
      conditionLogic: 'AND',
      conditions: [
        { fact: 'premise_alpha', operator: RULE_OPERATORS.EQUALS, value: true },
        { fact: 'premise_beta', operator: RULE_OPERATORS.GREATER_THAN, value: 5 }
      ],
      conclusion: { fact: 'test_and_derived', value: true },
      result: { category: RESULT_CATEGORIES.REVIEW_RECOMMENDED, severity: 'MODERATE' },
      explanation: 'Both alpha and beta must be satisfied.',
      isActive: true
    };

    // Case 1: Only premise_alpha is true -> Should NOT fire
    const res1 = evaluateRules({ premise_alpha: true, premise_beta: 3 }, [customRule]);
    expect(res1.triggeredRules.some(r => r.ruleCode === 'TEST-AND-01')).toBe(false);
    expect(res1.derivedFacts.test_and_derived).toBeUndefined();

    // Check that evaluatedRules recorded the unmet premise
    const pass1 = res1.inferenceTrace.passes[0];
    const evaluatedRule = pass1.evaluatedRules.find(r => r.ruleCode === 'TEST-AND-01');
    expect(evaluatedRule).toBeDefined();
    expect(evaluatedRule.status).toBe('UNMET');
    expect(evaluatedRule.unmetConditions.length).toBe(1);
    expect(evaluatedRule.unmetConditions[0].fact).toBe('premise_beta');

    // Case 2: Both premises satisfied -> Must fire
    const res2 = evaluateRules({ premise_alpha: true, premise_beta: 10 }, [customRule]);
    expect(res2.triggeredRules.some(r => r.ruleCode === 'TEST-AND-01')).toBe(true);
    expect(res2.derivedFacts.test_and_derived).toBe(true);
  });

  it('correctly evaluates conditionLogic "OR" firing when any premise is satisfied', () => {
    const customRuleOr = {
      ruleCode: 'TEST-OR-01',
      name: 'Test OR Production Rule',
      category: 'TEST',
      priority: 60,
      conditionLogic: 'OR',
      conditions: [
        { fact: 'flag_one', operator: RULE_OPERATORS.EQUALS, value: true },
        { fact: 'score_threshold', operator: RULE_OPERATORS.GREATER_OR_EQUAL, value: 50 }
      ],
      conclusion: { fact: 'test_or_derived', value: true },
      result: { category: RESULT_CATEGORIES.REVIEW_RECOMMENDED, severity: 'MODERATE' },
      explanation: 'Fires if flag_one is true OR score is >= 50.',
      isActive: true
    };

    // Case 1: flag_one is false, but score is 75 -> Must fire
    const res1 = evaluateRules({ flag_one: false, score_threshold: 75 }, [customRuleOr]);
    expect(res1.triggeredRules.some(r => r.ruleCode === 'TEST-OR-01')).toBe(true);
    expect(res1.derivedFacts.test_or_derived).toBe(true);

    // Case 2: neither premise met -> Must NOT fire
    const res2 = evaluateRules({ flag_one: false, score_threshold: 20 }, [customRuleOr]);
    expect(res2.triggeredRules.some(r => r.ruleCode === 'TEST-OR-01')).toBe(false);
  });
});

describe('GeneTrace AIES Engine — Conflict Resolution Transparency', () => {
  it('resolves conflicting triggered rules using priority-weighted category dominance and rule priority', () => {
    const rules = [
      {
        ruleCode: 'MODERATE-PRIORITY-90',
        name: 'Moderate Severity High Priority',
        priority: 90,
        conditions: [{ fact: 'indicator', operator: RULE_OPERATORS.EQUALS, value: true }],
        result: { category: RESULT_CATEGORIES.REVIEW_RECOMMENDED, severity: 'MODERATE' },
        explanation: 'Review recommended rule.',
        isActive: true
      },
      {
        ruleCode: 'CRITICAL-PRIORITY-70',
        name: 'Critical Severity Lower Priority',
        priority: 70,
        conditions: [{ fact: 'indicator', operator: RULE_OPERATORS.EQUALS, value: true }],
        result: { category: RESULT_CATEGORIES.COUNSELOR_REVIEW, severity: 'CRITICAL' },
        explanation: 'Counselor review critical rule.',
        isActive: true
      }
    ];

    const outcome = evaluateRules({ indicator: true }, rules);

    // Both rules fired
    expect(outcome.triggeredRules.length).toBe(2);

    // Conflict resolution must award victory to COUNSELOR_REVIEW (category weight 4 > 3)
    expect(outcome.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);

    const cr = outcome.inferenceTrace.conflictResolution;
    expect(cr).toBeDefined();
    expect(cr.strategy).toBeDefined();
    expect(cr.winningRuleCode).toBe('CRITICAL-PRIORITY-70');
    expect(cr.winningCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);
    expect(cr.candidatesEvaluated.length).toBe(2);
    expect(cr.rationale).toContain('CRITICAL-PRIORITY-70');
  });
});

describe('GeneTrace AIES Engine — Arbitrary Goal Backward Chaining', () => {
  it('proves a target hypothesis by verifying working memory and recursive rules', () => {
    const workingFacts = { review_indicator: true };
    const proof = evaluateBackwardChaining(
      'professional_review_recommended',
      true,
      defaultRules,
      workingFacts,
      {}
    );

    expect(proof.goal).toBe('professional_review_recommended');
    expect(proof.satisfied).toBe(true);
    expect(proof.status).toBe('PROVEN');
    expect(proof.ruleUsed).toBe('R08');
    expect(proof.proofSteps.length).toBeGreaterThan(0);
  });

  it('refutes a goal hypothesis when evidence premises fail', () => {
    const workingFacts = { review_indicator: false };
    const proof = evaluateBackwardChaining(
      'professional_review_recommended',
      true,
      defaultRules,
      workingFacts,
      {}
    );

    expect(proof.goal).toBe('professional_review_recommended');
    expect(proof.satisfied).toBe(false);
    expect(proof.status).toBe('REFUTED');
  });
});

describe('GeneTrace AIES Engine — 4 Synthetic Demonstration Cases Benchmark', () => {
  it('executes Synthetic Case 1 (Recessive / Consanguinity) deterministically', () => {
    const case1 = SYNTHETIC_DEMO_CASES.find(c => c.id === 'case-recessive-consanguinity');
    expect(case1).toBeDefined();

    const result = evaluateRules(case1.facts, defaultRules);

    expect(result.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);
    expect(result.derivedFacts.dual_carrier_recessive_risk).toBe(true);
    expect(result.derivedFacts.consanguinity_risk_flag).toBe(true);

    const winningCode = result.inferenceTrace.conflictResolution.winningRuleCode;
    expect(winningCode).toBe('RULE-AR-01');
    expect(result.triggeredRules.some(r => r.ruleCode === 'RULE-AR-01')).toBe(true);
    expect(result.triggeredRules.some(r => r.ruleCode === 'RULE-CONS-01')).toBe(true);
  });

  it('executes Synthetic Case 2 (Dominant / Huntington) deterministically with multi-pass chaining', () => {
    const case2 = SYNTHETIC_DEMO_CASES.find(c => c.id === 'case-dominant-huntington');
    expect(case2).toBeDefined();

    const result = evaluateRules(case2.facts, defaultRules);

    expect(result.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);
    expect(result.derivedFacts.autosomal_dominant_pattern).toBe(true);
    expect(result.derivedFacts.early_onset_clustering).toBe(true);
    expect(result.derivedFacts.review_indicator).toBe(true);
    expect(result.derivedFacts.professional_review_recommended).toBe(true);

    // Multi-pass verification: R04 triggers in Pass 1, R08 triggers in Pass 2
    expect(result.inferenceTrace.passes.length).toBeGreaterThanOrEqual(2);
    const pass1 = result.inferenceTrace.passes[0];
    const pass2 = result.inferenceTrace.passes[1];
    expect(pass1.rulesTriggered).toContain('R04');
    expect(pass2.rulesTriggered).toContain('R08');
  });

  it('executes Synthetic Case 3 (Parental Age / Aneuploidy) deterministically', () => {
    const case3 = SYNTHETIC_DEMO_CASES.find(c => c.id === 'case-parental-age-aneuploidy');
    expect(case3).toBeDefined();

    const result = evaluateRules(case3.facts, defaultRules);

    expect(result.resultCategory).toBe(RESULT_CATEGORIES.REVIEW_RECOMMENDED);
    expect(result.derivedFacts.maternal_age_guidance_indicated).toBe(true);
    expect(result.derivedFacts.paternal_age_guidance_indicated).toBe(true);
    expect(result.derivedFacts.karyotyping_evaluation_indicated).toBe(true);
    expect(result.triggeredRules.some(r => r.ruleCode === 'RULE-AMA-01')).toBe(true);
    expect(result.triggeredRules.some(r => r.ruleCode === 'RULE-APA-01')).toBe(true);
    expect(result.triggeredRules.some(r => r.ruleCode === 'RULE-RPL-01')).toBe(true);
  });

  it('executes Synthetic Case 4 (Adoptive / Incomplete Lineage) with Uncertainty Handling', () => {
    const case4 = SYNTHETIC_DEMO_CASES.find(c => c.id === 'case-incomplete-lineage');
    expect(case4).toBeDefined();

    const result = evaluateRules(case4.facts, defaultRules);

    expect(result.resultCategory).toBe(RESULT_CATEGORIES.INSUFFICIENT_INFORMATION);
    expect(result.derivedFacts.insufficient_information_flag).toBe(true);
    expect(result.triggeredRules.some(r => r.ruleCode === 'R09')).toBe(true);
  });
});
