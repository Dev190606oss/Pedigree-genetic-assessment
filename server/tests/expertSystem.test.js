import { describe, it, expect } from 'vitest';
const { buildFacts } = require('../rules/factBuilder');
const { evaluateRules, demonstrateBackwardChaining } = require('../rules/ruleEngine');
const defaultRules = require('../rules/defaultRules');
const { RESULT_CATEGORIES } = require('../constants');

describe('PEDIGREE Expert System — Fact Builder & Generational Intelligence', () => {
  it('accurately identifies generational distances, relative flags, and counts', () => {
    const family = { _id: 'fam_genealogy', name: 'Genealogy Family' };
    const pId = 'p1';
    const fatherId = 'f1';
    const motherId = 'm1';
    const pGfId = 'pgf1';
    const siblingId = 's1';
    const childId = 'c1';

    const members = [
      { _id: pId, name: 'Proband', sex: 'MALE', isProband: true },
      { _id: fatherId, name: 'Father', sex: 'MALE', isProband: false },
      { _id: motherId, name: 'Mother', sex: 'FEMALE', isProband: false },
      { _id: pGfId, name: 'Paternal GF', sex: 'MALE', isProband: false },
      { _id: siblingId, name: 'Brother', sex: 'MALE', isProband: false },
      { _id: childId, name: 'Son', sex: 'MALE', isProband: false }
    ];

    const relationships = [
      { fromMemberId: fatherId, toMemberId: pId, type: 'PARENT_CHILD' },
      { fromMemberId: motherId, toMemberId: pId, type: 'PARENT_CHILD' },
      { fromMemberId: pGfId, toMemberId: fatherId, type: 'PARENT_CHILD' },
      { fromMemberId: fatherId, toMemberId: siblingId, type: 'PARENT_CHILD' },
      { fromMemberId: motherId, toMemberId: siblingId, type: 'PARENT_CHILD' },
      { fromMemberId: pId, toMemberId: childId, type: 'PARENT_CHILD' }
    ];

    // Conditions: Father and Son have a condition
    const conditions = [
      {
        memberId: fatherId,
        conditionId: { code: 'HD-HTT', name: 'Huntington', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 45
      },
      {
        memberId: childId,
        conditionId: { code: 'HD-HTT', name: 'Huntington', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 22
      }
    ];

    const facts = buildFacts({ family, members, relationships, conditions });

    expect(facts.total_members).toBe(6);
    expect(facts.affected_members).toBe(2);
    expect(facts.affected_parent).toBe(true);
    expect(facts.parent_history_present).toBe(true);
    expect(facts.affected_child).toBe(true);
    expect(facts.affected_sibling).toBe(false);
    expect(facts.condition_present).toBe(true);
    expect(facts.relationship_categories_count).toBeGreaterThanOrEqual(2);
    // Father is level 1, Son is level -1 -> 2 distinct affected generations
    expect(facts.affected_generations).toBe(2);
  });
});

describe('PEDIGREE Expert System — Multi-Pass Forward Chaining', () => {
  it('executes progressive passes, deriving intermediate facts and reaching a fixed point', () => {
    // Initial facts matching R02 (affected_members >= 2) and R03 (affected_generations >= 2)
    const baseFacts = {
      total_members: 6,
      affected_members: 2,
      affected_generations: 2,
      condition_present: true,
      proband_exists: true,
      carrier_count: 0,
      consanguinity_reported: false,
      first_degree_relative_affected: true,
      second_degree_relative_affected: false,
      early_onset_detected: false
    };

    const result = evaluateRules(baseFacts, defaultRules);

    // Verify derived facts
    expect(result.derivedFacts).toBeDefined();
    expect(result.derivedFacts.multiple_affected_members).toBe(true);
    expect(result.derivedFacts.multi_generational_pattern).toBe(true);
    expect(result.derivedFacts.review_indicator).toBe(true);
    expect(result.derivedFacts.professional_review_recommended).toBe(true);

    // Verify inference trace passes
    expect(result.inferenceTrace).toBeDefined();
    expect(result.inferenceTrace.passes.length).toBeGreaterThanOrEqual(3);

    // Pass 1: R02 and R03 fire on base facts
    const pass1 = result.inferenceTrace.passes[0];
    expect(pass1.passNumber).toBe(1);
    expect(pass1.rulesTriggered).toContain('R02');
    expect(pass1.rulesTriggered).toContain('R03');

    // Pass 2: R04 fires using facts derived in Pass 1
    const pass2 = result.inferenceTrace.passes[1];
    expect(pass2.passNumber).toBe(2);
    expect(pass2.rulesTriggered).toContain('R04');

    // Pass 3: R08 fires using fact derived in Pass 2
    const pass3 = result.inferenceTrace.passes[2];
    expect(pass3.passNumber).toBe(3);
    expect(pass3.rulesTriggered).toContain('R08');

    // Final outcome
    expect(result.resultCategory).toBe(RESULT_CATEGORIES.REVIEW_RECOMMENDED);
  });
});

describe('PEDIGREE Expert System — Goal-Driven Backward Chaining', () => {
  it('proves target clinical hypothesis by tracing premises through upstream derivations', () => {
    const initialFacts = {
      affected_members: 3,
      affected_generations: 2,
      parent_history_present: true
    };

    const derivedFacts = {
      multiple_affected_members: true,
      multi_generational_pattern: true,
      review_indicator: true,
      professional_review_recommended: true
    };

    const proof = demonstrateBackwardChaining(
      'professional_review_recommended',
      true,
      defaultRules,
      initialFacts,
      derivedFacts
    );

    expect(proof.goal).toBe('professional_review_recommended');
    expect(proof.targetValue).toBe(true);
    expect(proof.satisfied).toBe(true);
    expect(proof.proofSteps.length).toBeGreaterThan(0);

    // The proof step must reference R08 and its requirement review_indicator
    const r08Step = proof.proofSteps.find(s => s.ruleCode === 'R08');
    expect(r08Step).toBeDefined();
    expect(r08Step.requiredFact).toBe('review_indicator');
    expect(r08Step.satisfied).toBe(true);

    // The proof should recursively show upstream derivation from R04
    const r04Step = proof.proofSteps.find(s => s.ruleCode === 'R04');
    expect(r04Step).toBeDefined();
    expect(r04Step.satisfied).toBe(true);
  });
});

describe('PEDIGREE Expert System — Dynamic Outcome Across 3 Scenarios', () => {
  // Scenario A: Clear / Minimal history -> INFORMATIONAL
  it('Scenario A: yields INFORMATIONAL for family with no reported conditions', () => {
    const family = { _id: 'fam_scen_a', name: 'Healthy Lineage' };
    const proband = { _id: 'pA', name: 'Proband A', sex: 'FEMALE', isProband: true };
    const mother = { _id: 'mA', name: 'Mother A', sex: 'FEMALE', isProband: false };
    const father = { _id: 'fA', name: 'Father A', sex: 'MALE', isProband: false };

    const members = [proband, mother, father];
    const relationships = [
      { fromMemberId: mother._id, toMemberId: proband._id, type: 'PARENT_CHILD' },
      { fromMemberId: father._id, toMemberId: proband._id, type: 'PARENT_CHILD' }
    ];
    const conditions = [];

    const facts = buildFacts({ family, members, relationships, conditions });
    const result = evaluateRules(facts, defaultRules);

    expect(facts.condition_present).toBe(false);
    expect(facts.affected_members).toBe(0);
    expect(result.resultCategory).toBe(RESULT_CATEGORIES.INFORMATIONAL);
    expect(result.derivedFacts.baseline_standard_risk).toBe(true);
  });

  // Scenario B: Two affected siblings -> REVIEW_RECOMMENDED
  it('Scenario B: yields REVIEW_RECOMMENDED when multiple siblings are affected', () => {
    const family = { _id: 'fam_scen_b', name: 'Sibling Recessive Lineage' };
    const proband = { _id: 'pB', name: 'Proband B', sex: 'MALE', isProband: true };
    const sibling1 = { _id: 'sB1', name: 'Brother B1', sex: 'MALE', isProband: false };
    const sibling2 = { _id: 'sB2', name: 'Sister B2', sex: 'FEMALE', isProband: false };
    const mother = { _id: 'mB', name: 'Mother B', sex: 'FEMALE', isProband: false };
    const father = { _id: 'fB', name: 'Father B', sex: 'MALE', isProband: false };

    const members = [proband, sibling1, sibling2, mother, father];
    const relationships = [
      { fromMemberId: mother._id, toMemberId: proband._id, type: 'PARENT_CHILD' },
      { fromMemberId: father._id, toMemberId: proband._id, type: 'PARENT_CHILD' },
      { fromMemberId: mother._id, toMemberId: sibling1._id, type: 'PARENT_CHILD' },
      { fromMemberId: father._id, toMemberId: sibling1._id, type: 'PARENT_CHILD' },
      { fromMemberId: mother._id, toMemberId: sibling2._id, type: 'PARENT_CHILD' },
      { fromMemberId: father._id, toMemberId: sibling2._id, type: 'PARENT_CHILD' }
    ];

    const conditions = [
      {
        memberId: sibling1._id,
        conditionId: { code: 'FH-LDLR', name: 'Familial Hypercholesterolemia', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 54
      },
      {
        memberId: sibling2._id,
        conditionId: { code: 'FH-LDLR', name: 'Familial Hypercholesterolemia', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 52
      }
    ];

    const facts = buildFacts({ family, members, relationships, conditions });
    const result = evaluateRules(facts, defaultRules);

    expect(facts.affected_members).toBe(2);
    expect(facts.affected_sibling).toBe(true);
    expect(facts.affected_parent).toBe(false);
    expect(result.resultCategory).toBe(RESULT_CATEGORIES.REVIEW_RECOMMENDED);
    expect(result.derivedFacts.multiple_affected_members).toBe(true);
    expect(result.derivedFacts.sibling_history_present).toBe(true);
  });

  // Scenario C: Multi-generational dominant transmission with early onset -> COUNSELOR_REVIEW
  it('Scenario C: yields COUNSELOR_REVIEW for multi-generational transmission with early onset', () => {
    const family = { _id: 'fam_scen_c', name: 'Dominant Cancer Lineage' };
    const proband = { _id: 'pC', name: 'Proband C', sex: 'FEMALE', isProband: true };
    const mother = { _id: 'mC', name: 'Mother C', sex: 'FEMALE', isProband: false };
    const gMother = { _id: 'gmC', name: 'Grandmother C', sex: 'FEMALE', isProband: false };

    const members = [proband, mother, gMother];
    const relationships = [
      { fromMemberId: gMother._id, toMemberId: mother._id, type: 'PARENT_CHILD' },
      { fromMemberId: mother._id, toMemberId: proband._id, type: 'PARENT_CHILD' }
    ];

    const conditions = [
      {
        memberId: mother._id,
        conditionId: { code: 'HBOC-BRCA1', name: 'HBOC', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 42
      },
      {
        memberId: gMother._id,
        conditionId: { code: 'HBOC-BRCA1', name: 'HBOC', category: 'AUTOSOMAL_DOMINANT' },
        status: 'AFFECTED',
        ageAtOnset: 46
      }
    ];

    const facts = buildFacts({ family, members, relationships, conditions });
    const result = evaluateRules(facts, defaultRules);

    expect(facts.affected_generations).toBe(2);
    expect(facts.multi_generational_transmission).toBe(true);
    expect(facts.early_onset_detected).toBe(true);
    expect(result.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);
    expect(result.derivedFacts.autosomal_dominant_pattern).toBe(true);
  });
});

describe('PEDIGREE Expert System — Rule Priority & Active Flag Governance', () => {
  it('ignores deactivated rules during forward chaining evaluation', () => {
    const facts = {
      affected_members: 2,
      affected_generations: 2,
      condition_present: true
    };

    // Deactivate R02
    const modifiedRules = defaultRules.map(r => {
      if (r.ruleCode === 'R02') {
        return { ...r, isActive: false };
      }
      return r;
    });

    const result = evaluateRules(facts, modifiedRules);

    // R02 was disabled, so multiple_affected_members shouldn't be derived
    expect(result.derivedFacts.multiple_affected_members).toBeUndefined();
    expect(result.triggeredRules.some(r => r.ruleCode === 'R02')).toBe(false);
  });

  it('correctly resolves dominant result category by highest clinical severity weight', () => {
    const facts = {
      consanguinity_detected: true, // Triggers RULE-CONS-01 (REVIEW_RECOMMENDED, weight 3)
      couple_carrier_match: true,   // Triggers RULE-AR-01 (COUNSELOR_REVIEW, weight 4)
      condition_present: true,
      affected_members: 1,
      affected_generations: 1
    };

    const result = evaluateRules(facts, defaultRules);

    // Dual carrier match rule has COUNSELOR_REVIEW category (weight 4), which supersedes REVIEW_RECOMMENDED (weight 3)
    expect(result.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);
  });
});
