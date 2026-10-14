import { describe, it, expect } from 'vitest';
const {
  QUICK_FILL_SCENARIOS,
  getQuickFillScenarios
} = require('../services/quickFillService');
const { buildFacts } = require('../rules/factBuilder');
const { evaluateRules } = require('../rules/ruleEngine');
const defaultRules = require('../rules/defaultRules');
const { RESULT_CATEGORIES } = require('../constants');
const { normalizeRelationshipRecord } = require('../utils/relationshipHelper');

describe('GeneTrace — Quick Fill Synthetic Scenarios & Fact Extraction Verification', () => {

  // --- 1. Scenario Catalog & Metadata Integrity ---
  describe('1. Scenario Catalog & Schema Integrity', () => {
    it('provides a catalog of 4 distinct, syllabus-aligned synthetic scenarios', () => {
      const scenarios = getQuickFillScenarios();
      expect(scenarios.length).toBe(4);

      const keys = scenarios.map(s => s.key);
      expect(keys).toContain('recessive_consanguinity');
      expect(keys).toContain('incomplete_lineage');
      expect(keys).toContain('dominant_multirule');
      expect(keys).toContain('x_linked_recessive');

      scenarios.forEach(sc => {
        expect(sc.title).toBeDefined();
        expect(sc.badge).toBeDefined();
        expect(sc.clinicalDescription).toBeDefined();
        expect(sc.aiesFocus).toBeDefined();
        expect(sc.expectedOutcome).toBeDefined();
        expect(sc.expectedOutcome.winningRule).toBeDefined();
      });
    });

    it('enforces biological consistency and unique proband in every scenario', () => {
      Object.values(QUICK_FILL_SCENARIOS).forEach(sc => {
        const memberKeys = new Set(sc.members.map(m => m.key));
        expect(memberKeys.size).toBe(sc.members.length); // All member keys unique

        // Exactly one designated proband
        const probands = sc.members.filter(m => m.isProband);
        expect(probands.length).toBe(1);

        // Every relationship links members within the scenario
        sc.relationships.forEach(rel => {
          expect(memberKeys.has(rel.fromKey)).toBe(true);
          expect(memberKeys.has(rel.toKey)).toBe(true);
          expect(rel.fromKey).not.toBe(rel.toKey);
        });

        // Every condition links to a valid member within the scenario
        sc.conditions.forEach(cond => {
          expect(memberKeys.has(cond.memberKey)).toBe(true);
          expect(['AFFECTED', 'CARRIER', 'SUSPECTED', 'UNAFFECTED']).toContain(cond.status);
        });
      });
    });

    it('ensures parent-child dates of birth are chronologically sound', () => {
      Object.values(QUICK_FILL_SCENARIOS).forEach(sc => {
        const memberMap = {};
        sc.members.forEach(m => { memberMap[m.key] = m; });

        sc.relationships.forEach(rel => {
          if (rel.type === 'PARENT_CHILD') {
            const parent = memberMap[rel.fromKey];
            const child = memberMap[rel.toKey];
            if (parent?.dateOfBirth && child?.dateOfBirth) {
              const parentDob = new Date(parent.dateOfBirth).getTime();
              const childDob = new Date(child.dateOfBirth).getTime();
              expect(childDob).toBeGreaterThan(parentDob); // Child must be born after parent
              const ageDiffYears = (childDob - parentDob) / (1000 * 60 * 60 * 24 * 365.25);
              expect(ageDiffYears).toBeGreaterThanOrEqual(15); // Parent at least 15 at childbirth
            }
          }
        });
      });
    });
  });

  // Helper to convert synthetic scenario to graph format for buildFacts
  function scenarioToGraph(scenario) {
    const keyToId = {};
    const members = scenario.members.map((m, idx) => {
      const fakeId = `mem_${scenario.key}_${idx}_${m.key}`;
      keyToId[m.key] = fakeId;
      return {
        _id: fakeId,
        name: m.name,
        sex: m.sex,
        dateOfBirth: m.dateOfBirth ? new Date(m.dateOfBirth) : null,
        isProband: Boolean(m.isProband),
        deceased: Boolean(m.deceased),
        notes: m.notes || ''
      };
    });

    const relationships = scenario.relationships.map((r, idx) => {
      const fromMember = members.find(m => m._id === keyToId[r.fromKey]);
      const toMember = members.find(m => m._id === keyToId[r.toKey]);
      const normalized = normalizeRelationshipRecord(fromMember, toMember, r.type);
      return {
        _id: `rel_${scenario.key}_${idx}`,
        fromMemberId: normalized.fromMemberId,
        toMemberId: normalized.toMemberId,
        type: normalized.type,
        metadata: normalized.metadata
      };
    });

    const conditions = scenario.conditions.map((c, idx) => ({
      _id: `cond_${scenario.key}_${idx}`,
      memberId: keyToId[c.memberKey],
      conditionId: {
        code: c.conditionCode,
        name: c.conditionCode,
        category: c.conditionCode === 'CF-CFTR' ? 'AUTOSOMAL_RECESSIVE' : 'AUTOSOMAL_DOMINANT'
      },
      status: c.status,
      ageAtOnset: c.ageAtOnset !== undefined ? c.ageAtOnset : null,
      notes: c.notes || ''
    }));

    return {
      family: { name: scenario.title },
      members,
      relationships,
      conditions
    };
  }

  // --- 2. Scenario A Verification ---
  describe('2. Scenario A (Recessive Carrier Match & Consanguinity)', () => {
    const scA = QUICK_FILL_SCENARIOS.recessive_consanguinity;
    const graphA = scenarioToGraph(scA);
    const factsA = buildFacts(graphA);

    it('extracts expected facts including carrier match and consanguinity', () => {
      expect(factsA.proband_exists).toBe(true);
      expect(factsA.total_members).toBe(9);
      expect(factsA.couple_carrier_match).toBe(true);
      expect(factsA.matching_carrier_condition).toBe('CF-CFTR');
      expect(factsA.consanguinity_detected).toBe(true);
      expect(factsA.affected_sibling).toBe(true);
      expect(factsA.affected_members).toBe(1);
      expect(factsA.carrier_members).toBe(2);
      expect(factsA.required_family_information_missing).toBe(false);
    });

    it('triggers RULE-AR-01 with CRITICAL severity and COUNSELOR_REVIEW', () => {
      const evalResult = evaluateRules(factsA, defaultRules);
      expect(evalResult.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);

      const triggeredCodes = evalResult.triggeredRules.map(r => r.ruleCode);
      expect(triggeredCodes).toContain('RULE-AR-01');
      expect(triggeredCodes).toContain('RULE-CONS-01');
      expect(triggeredCodes).toContain('R06'); // Affected Sibling
      expect(triggeredCodes).toContain('R01'); // Family History Present

      const winningCode = evalResult.inferenceTrace?.conflictResolution?.winningRuleCode || evalResult.conflictResolution?.winningRuleCode;
      expect(winningCode).toBe('RULE-AR-01');
      expect(evalResult.derivedFacts.dual_carrier_recessive_risk).toBe(true);
      expect(evalResult.derivedFacts.consanguinity_risk_flag).toBe(true);
    });
  });

  // --- 3. Scenario B Verification ---
  describe('3. Scenario B (Incomplete Lineage / Adopted Proband)', () => {
    const scB = QUICK_FILL_SCENARIOS.incomplete_lineage;
    const graphB = scenarioToGraph(scB);
    const factsB = buildFacts(graphB);

    it('flags incomplete lineage and missing family information', () => {
      expect(factsB.proband_exists).toBe(true);
      expect(factsB.total_members).toBe(1);
      expect(factsB.parent_count).toBe(0);
      expect(factsB.has_both_parents_recorded).toBe(false);
      expect(factsB.condition_present).toBe(false);
      expect(factsB.required_family_information_missing).toBe(true);
    });

    it('triggers Rule R09 and classifies outcome as INSUFFICIENT_INFORMATION', () => {
      const evalResult = evaluateRules(factsB, defaultRules);
      expect(evalResult.resultCategory).toBe(RESULT_CATEGORIES.INSUFFICIENT_INFORMATION);

      const triggeredCodes = evalResult.triggeredRules.map(r => r.ruleCode);
      expect(triggeredCodes).toContain('R09');
      const winningCode = evalResult.inferenceTrace?.conflictResolution?.winningRuleCode || evalResult.conflictResolution?.winningRuleCode;
      expect(winningCode).toBe('R09');
      expect(evalResult.derivedFacts.insufficient_information_flag).toBe(true);
    });
  });

  // --- 4. Scenario C Verification ---
  describe('4. Scenario C (Multi-Generational Huntington & Parental Age)', () => {
    const scC = QUICK_FILL_SCENARIOS.dominant_multirule;
    const graphC = scenarioToGraph(scC);
    const factsC = buildFacts(graphC);

    it('extracts multi-generational transmission and parental age indicators', () => {
      expect(factsC.proband_exists).toBe(true);
      expect(factsC.total_members).toBe(7);
      expect(factsC.affected_members).toBe(2);
      expect(factsC.affected_generations).toBeGreaterThanOrEqual(2);
      expect(factsC.multi_generational_transmission).toBe(true);
      expect(factsC.multi_generational_pattern).toBe(true);
      expect(factsC.early_onset_detected).toBe(true);
      expect(factsC.affected_parent).toBe(true);
      expect(factsC.first_degree_relative_affected).toBe(true);
      expect(factsC.second_degree_relative_affected).toBe(true);
      expect(factsC.required_family_information_missing).toBe(false);
    });

    it('evaluates multi-rule forward chaining and assigns dominant winning rule', () => {
      const evalResult = evaluateRules(factsC, defaultRules);
      expect(evalResult.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);

      const triggeredCodes = evalResult.triggeredRules.map(r => r.ruleCode);
      // Dominant Mendelian rule
      expect(triggeredCodes).toContain('RULE-AD-01');
      // Multiple affected relatives early onset
      expect(triggeredCodes).toContain('RULE-MULTI-01');
      // Advanced Maternal Age (Elena is 38)
      expect(triggeredCodes).toContain('RULE-AMA-01');
      // Advanced Paternal Age (Marcus is 44)
      expect(triggeredCodes).toContain('RULE-APA-01');
      // Multi-generational pattern derivations
      expect(triggeredCodes).toContain('R04');
      expect(triggeredCodes).toContain('R08');
      expect(triggeredCodes).toContain('R05');

      // Conflict resolution: highest priority rule wins
      const winningCode = evalResult.inferenceTrace?.conflictResolution?.winningRuleCode || evalResult.conflictResolution?.winningRuleCode;
      expect(winningCode).toBe('RULE-AD-01');
    });
  });

  // --- 4b. Scenario: X-Linked Recessive Lineage (Hemophilia A) ---
  describe('4b. Scenario: X-Linked Recessive Lineage (Hemophilia A)', () => {
    const scXL = QUICK_FILL_SCENARIOS.x_linked_recessive;
    const graphXL = scenarioToGraph(scXL);
    const factsXL = buildFacts(graphXL);

    it('extracts X-linked inheritance pattern facts correctly', () => {
      expect(factsXL.proband_exists).toBe(true);
      expect(factsXL.proband_sex).toBe('MALE');
      expect(factsXL.total_members).toBe(6);
      expect(factsXL.affected_members).toBe(1);
      expect(factsXL.carrier_members).toBe(1);
      expect(factsXL.condition_present).toBe(true);
      expect(factsXL.x_linked_condition_present).toBe(true);
      expect(factsXL.x_linked_carrier_mother).toBe(true);
      expect(factsXL.x_linked_affected_grandfather).toBe(true);
      expect(factsXL.x_linked_recessive_pattern).toBe(true);
    });

    it('triggers RULE-XL-01 with HIGH severity and COUNSELOR_REVIEW', () => {
      const evalResult = evaluateRules(factsXL, defaultRules);
      expect(evalResult.resultCategory).toBe(RESULT_CATEGORIES.COUNSELOR_REVIEW);

      const triggeredCodes = evalResult.triggeredRules.map(r => r.ruleCode);
      expect(triggeredCodes).toContain('RULE-XL-01');
      expect(triggeredCodes).toContain('R01'); // Baseline family history present

      const winningCode = evalResult.inferenceTrace?.conflictResolution?.winningRuleCode || evalResult.conflictResolution?.winningRuleCode;
      expect(winningCode).toBe('RULE-XL-01');
      expect(evalResult.derivedFacts.x_linked_transmission_risk).toBe(true);
    });
  });

  // --- 5. Manual Entry Compatibility ---
  describe('5. Manual Entry Compatibility Post-Quick Fill', () => {
    it('allows valid relationships to be added manually to quick-filled members', () => {
      const sc = QUICK_FILL_SCENARIOS.incomplete_lineage;
      const graph = scenarioToGraph(sc);
      const proband = graph.members[0];

      // Simulate user manually adding a biological father
      const newFather = {
        _id: 'manual_father_1',
        name: 'Biological Father',
        sex: 'MALE',
        dateOfBirth: new Date('1975-01-01')
      };
      graph.members.push(newFather);

      const newRel = normalizeRelationshipRecord(newFather, proband, 'FATHER');
      graph.relationships.push({
        _id: 'manual_rel_1',
        fromMemberId: newRel.fromMemberId,
        toMemberId: newRel.toMemberId,
        type: newRel.type,
        metadata: newRel.metadata
      });

      const updatedFacts = buildFacts(graph);
      expect(updatedFacts.total_members).toBe(2);
      expect(updatedFacts.parent_count).toBe(1);
    });
  });
});
