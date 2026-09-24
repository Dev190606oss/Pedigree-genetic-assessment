import { describe, it, expect } from 'vitest';
const { evaluateCondition } = require('../rules/ruleOperators');
const { buildFacts } = require('../rules/factBuilder');
const { evaluateRules } = require('../rules/ruleEngine');
const defaultRules = require('../rules/defaultRules');
const { RULE_OPERATORS, RESULT_CATEGORIES } = require('../constants');

describe('AIES Rule Operators', () => {
  it('correctly evaluates EQUALS for boolean and string values', () => {
    expect(evaluateCondition(true, RULE_OPERATORS.EQUALS, true)).toBe(true);
    expect(evaluateCondition(false, RULE_OPERATORS.EQUALS, false)).toBe(true);
    expect(evaluateCondition(true, RULE_OPERATORS.EQUALS, false)).toBe(false);
    expect(evaluateCondition('AUTOSOMAL_RECESSIVE', RULE_OPERATORS.EQUALS, 'AUTOSOMAL_RECESSIVE')).toBe(true);
  });

  it('correctly evaluates numeric comparison operators', () => {
    expect(evaluateCondition(5, RULE_OPERATORS.GREATER_THAN, 3)).toBe(true);
    expect(evaluateCondition(2, RULE_OPERATORS.LESS_THAN, 3)).toBe(true);
    expect(evaluateCondition(4, RULE_OPERATORS.GREATER_OR_EQUAL, 4)).toBe(true);
    expect(evaluateCondition(3, RULE_OPERATORS.LESS_OR_EQUAL, 4)).toBe(true);
  });

  it('correctly evaluates EXISTS and NOT_EXISTS', () => {
    expect(evaluateCondition('value', RULE_OPERATORS.EXISTS, true)).toBe(true);
    expect(evaluateCondition(null, RULE_OPERATORS.EXISTS, true)).toBe(false);
    expect(evaluateCondition(null, RULE_OPERATORS.NOT_EXISTS, true)).toBe(true);
  });

  it('correctly evaluates IN and CONTAINS', () => {
    expect(evaluateCondition('BRCA1', RULE_OPERATORS.IN, ['BRCA1', 'BRCA2', 'TP53'])).toBe(true);
    expect(evaluateCondition('CFTR', RULE_OPERATORS.IN, ['BRCA1', 'BRCA2'])).toBe(false);
    expect(evaluateCondition(['MALE', 'FEMALE'], RULE_OPERATORS.CONTAINS, 'MALE')).toBe(true);
  });
});

describe('AIES Fact Builder & Rule Engine', () => {
  it('extracts facts and triggers rules for autosomal dominant multi-generational pedigree', () => {
    const family = { _id: 'fam1', name: 'Test Family' };
    const probandId = 'm1';
    const motherId = 'm2';
    const gmId = 'm3';

    const members = [
      { _id: probandId, name: 'Proband', sex: 'FEMALE', isProband: true },
      { _id: motherId, name: 'Mother', sex: 'FEMALE', isProband: false },
      { _id: gmId, name: 'Grandmother', sex: 'FEMALE', isProband: false }
    ];

    const relationships = [
      { fromMemberId: gmId, toMemberId: motherId, type: 'PARENT_CHILD' },
      { fromMemberId: motherId, toMemberId: probandId, type: 'PARENT_CHILD' }
    ];

    const conditions = [
      {
        memberId: gmId,
        conditionId: { code: 'HBOC-BRCA1', name: 'HBOC', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 44
      },
      {
        memberId: motherId,
        conditionId: { code: 'HBOC-BRCA1', name: 'HBOC', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 48
      }
    ];

    const facts = buildFacts({ family, members, relationships, conditions });

    expect(facts.proband_exists).toBe(true);
    expect(facts.multi_generational_transmission).toBe(true);
    expect(facts.multiple_affected_relatives).toBe(true);
    expect(facts.early_onset_detected).toBe(true);
    expect(facts.first_degree_relative_affected).toBe(true);

    const result = evaluateRules(facts, defaultRules);

    expect(result.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);
    expect(result.triggeredRules.length).toBeGreaterThan(0);
    expect(result.guidance.length).toBeGreaterThan(0);
    expect(result.disclaimer).toBeDefined();
  });

  it('triggers baseline informational rule for clear family history', () => {
    const family = { _id: 'fam2', name: 'Healthy Family' };
    const pId = 'm1';
    const fId = 'm2';
    const mId = 'm3';

    const members = [
      { _id: pId, name: 'Proband', sex: 'MALE', isProband: true },
      { _id: fId, name: 'Father', sex: 'MALE', isProband: false },
      { _id: mId, name: 'Mother', sex: 'FEMALE', isProband: false }
    ];

    const relationships = [
      { fromMemberId: fId, toMemberId: pId, type: 'PARENT_CHILD' },
      { fromMemberId: mId, toMemberId: pId, type: 'PARENT_CHILD' }
    ];

    const conditions = [];

    const facts = buildFacts({ family, members, relationships, conditions });
    const result = evaluateRules(facts, defaultRules);

    expect(facts.condition_present).toBe(false);
    expect(result.resultCategory).toBe(RESULT_CATEGORIES.INFORMATIONAL);
  });
});
