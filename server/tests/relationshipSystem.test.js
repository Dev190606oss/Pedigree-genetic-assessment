import { describe, it, expect } from 'vitest';
const {
  RELATIONSHIP_GROUPS,
  RELATIONSHIP_DEFINITIONS,
  getRelationshipDefinition,
  getInverseRelationship,
  getRelationshipPreviewText,
  normalizeRelationshipRecord,
  validateRelationship,
  deriveAllRelationships,
  getBiologicalParentChildRoles
} = require('../utils/relationshipHelper');
const { buildFacts } = require('../rules/factBuilder');

describe('PEDIGREE — Relationship System & Extended Family Intelligence', () => {

  // --- 1. Direct Parent / Child ---
  describe('1. Direct Parent / Child Relationships', () => {
    it('accurately identifies biological parent and child roles with correct normalization', () => {
      const father = { _id: 'm_father', name: 'Devansh', sex: 'MALE' };
      const child = { _id: 'm_child', name: 'Rahul', sex: 'MALE', isProband: true };

      const fatherRel = normalizeRelationshipRecord(father, child, 'FATHER');
      expect(fatherRel.type).toBe('FATHER');
      expect(fatherRel.metadata.isBiological).toBe(true);
      expect(fatherRel.metadata.baseType).toBe('PARENT_CHILD');
      expect(fatherRel.metadata.direction).toBe('PARENT_TO_CHILD');

      const childRel = normalizeRelationshipRecord(child, father, 'SON');
      expect(childRel.type).toBe('SON');
      expect(childRel.metadata.isBiological).toBe(true);
      expect(childRel.metadata.direction).toBe('CHILD_TO_PARENT');

      // Test fact builder with parent and child
      const members = [father, child];
      const relationships = [
        { fromMemberId: father._id, toMemberId: child._id, type: 'FATHER' }
      ];
      const facts = buildFacts({ members, relationships, conditions: [] });
      expect(facts.parent_count).toBe(1);
      expect(facts.total_members).toBe(2);
    });
  });

  // --- 2. Sibling Relationships ---
  describe('2. Sibling Relationships', () => {
    it('connects biological brothers and sisters and infers siblings via shared parents', () => {
      const parent = { _id: 'p1', name: 'Parent', sex: 'FEMALE' };
      const sib1 = { _id: 's1', name: 'Alice', sex: 'FEMALE', isProband: true };
      const sib2 = { _id: 's2', name: 'Bob', sex: 'MALE' };

      const members = [parent, sib1, sib2];
      const relationships = [
        { fromMemberId: parent._id, toMemberId: sib1._id, type: 'MOTHER' },
        { fromMemberId: parent._id, toMemberId: sib2._id, type: 'MOTHER' }
      ];

      const derived = deriveAllRelationships(members, relationships);
      expect(derived.siblingsOf['s1']).toContain('s2');
      expect(derived.siblingsOf['s2']).toContain('s1');

      // Direct sibling link
      const directRel = normalizeRelationshipRecord(sib1, sib2, 'SISTER');
      expect(directRel.metadata.baseType).toBe('SIBLING');
      expect(directRel.metadata.isBiological).toBe(true);
    });
  });

  // --- 3. Spouse / Partner Relationships ---
  describe('3. Spouse & Partner Relationships', () => {
    it('supports marriage and partnerships with symmetric inverse handling', () => {
      const husband = { _id: 'h1', name: 'John', sex: 'MALE' };
      const wife = { _id: 'w1', name: 'Mary', sex: 'FEMALE' };

      const rel = normalizeRelationshipRecord(husband, wife, 'HUSBAND');
      expect(rel.metadata.baseType).toBe('SPOUSE');
      expect(rel.metadata.isBiological).toBe(false);

      expect(getInverseRelationship('HUSBAND', 'MALE', 'FEMALE')).toBe('WIFE');
      expect(getInverseRelationship('WIFE', 'FEMALE', 'MALE')).toBe('HUSBAND');
      expect(getInverseRelationship('SPOUSE', 'MALE', 'FEMALE')).toBe('WIFE');
      expect(getInverseRelationship('SPOUSE')).toBe('SPOUSE');
      expect(getInverseRelationship('PARTNER', 'MALE', 'FEMALE')).toBe('PARTNER');
    });
  });

  // --- 4. Grandparent & Grandchildren ---
  describe('4. Grandparent & Grandchild Relationships', () => {
    it('handles grandparent and grandchild roles and sets generation level (+2)', () => {
      const gf = { _id: 'gf1', name: 'Grandpa', sex: 'MALE' };
      const proband = { _id: 'pr1', name: 'Proband', sex: 'MALE', isProband: true };

      const rel = normalizeRelationshipRecord(gf, proband, 'GRANDFATHER');
      expect(rel.metadata.baseType).toBe('GRANDPARENT');
      expect(rel.metadata.generationDiff).toBe(2);

      const members = [gf, proband];
      const relationships = [
        { fromMemberId: gf._id, toMemberId: proband._id, type: 'GRANDFATHER' }
      ];
      const conditions = [
        { memberId: gf._id, status: 'AFFECTED', conditionId: { code: 'TEST_COND', category: 'AUTOSOMAL_DOMINANT' } }
      ];

      const facts = buildFacts({ members, relationships, conditions });
      expect(facts.second_degree_affected).toBe(true);
      expect(facts.affected_grandparent).toBe(true);
      expect(facts.first_degree_affected).toBe(false);
    });
  });

  // --- 5. Maternal vs Paternal Lineage Distinction ---
  describe('5. Maternal vs Paternal Lineage Distinction', () => {
    it('accurately distinguishes maternal and paternal grandparents and lineages', () => {
      const patGf = { _id: 'pgf', name: 'Paternal Grandfather', sex: 'MALE' };
      const matGm = { _id: 'mgm', name: 'Maternal Grandmother', sex: 'FEMALE' };
      const proband = { _id: 'pb', name: 'Proband', sex: 'FEMALE', isProband: true };

      const patDef = getRelationshipDefinition('PATERNAL_GRANDFATHER');
      expect(patDef.lineage).toBe('PATERNAL');

      const matDef = getRelationshipDefinition('MATERNAL_GRANDMOTHER');
      expect(matDef.lineage).toBe('MATERNAL');

      const members = [patGf, matGm, proband];
      const relationships = [
        { fromMemberId: patGf._id, toMemberId: proband._id, type: 'PATERNAL_GRANDFATHER' },
        { fromMemberId: matGm._id, toMemberId: proband._id, type: 'MATERNAL_GRANDMOTHER' }
      ];
      const conditions = [
        { memberId: patGf._id, status: 'AFFECTED', conditionId: { code: 'C1' } }
      ];

      const facts = buildFacts({ members, relationships, conditions });
      expect(facts.paternal_line_affected).toBe(true);
      expect(facts.maternal_line_affected).toBe(false);
      expect(facts.paternal_relatives_recorded).toBe(true);
      expect(facts.maternal_relatives_recorded).toBe(true);
    });
  });

  // --- 6. Aunt & Uncle Relationships ---
  describe('6. Aunt & Uncle Relationships', () => {
    it('handles aunts and uncles as second-degree relatives with lineage tracking', () => {
      const uncle = { _id: 'u1', name: 'Paternal Uncle', sex: 'MALE' };
      const proband = { _id: 'pb', name: 'Proband', sex: 'MALE', isProband: true };

      const members = [uncle, proband];
      const relationships = [
        { fromMemberId: uncle._id, toMemberId: proband._id, type: 'PATERNAL_UNCLE' }
      ];
      const conditions = [
        { memberId: uncle._id, status: 'AFFECTED', conditionId: { code: 'BRCA1' } }
      ];

      const facts = buildFacts({ members, relationships, conditions });
      expect(facts.second_degree_affected).toBe(true);
      expect(facts.affected_aunt_uncle).toBe(true);
      expect(facts.paternal_line_affected).toBe(true);
      expect(facts.maternal_line_affected).toBe(false);
    });
  });

  // --- 7. Cousin Relationships ---
  describe('7. Cousin Relationships', () => {
    it('maintains cousin relationships at generation tier 0 relative to proband', () => {
      const cousin = { _id: 'c1', name: 'Male Cousin', sex: 'MALE' };
      const proband = { _id: 'pb', name: 'Proband', sex: 'MALE', isProband: true };

      const rel = normalizeRelationshipRecord(cousin, proband, 'MALE_COUSIN');
      expect(rel.metadata.baseType).toBe('COUSIN');
      expect(rel.metadata.generationDiff).toBe(0);

      const preview = getRelationshipPreviewText('MALE_COUSIN', 'Devansh', 'Rahul');
      expect(preview).toBe('Devansh is the male cousin of Rahul.');
    });
  });

  // --- 8. Step-Family (Non-Biological) ---
  describe('8. Step-Family (Non-Biological) Handling', () => {
    it('strictly marks step-parents as non-biological and excludes them from biological inheritance sets', () => {
      const stepFather = { _id: 'sf1', name: 'Stepdad Mark', sex: 'MALE' };
      const proband = { _id: 'pb', name: 'Proband', sex: 'MALE', isProband: true };

      const relDef = getRelationshipDefinition('STEP_FATHER');
      expect(relDef.isBiological).toBe(false);
      expect(relDef.group).toBe(RELATIONSHIP_GROUPS.STEP);

      const members = [stepFather, proband];
      const relationships = [
        { fromMemberId: stepFather._id, toMemberId: proband._id, type: 'STEP_FATHER' }
      ];
      // Step-father has a genetic condition
      const conditions = [
        { memberId: stepFather._id, status: 'AFFECTED', conditionId: { code: 'HD-HTT', category: 'AUTOSOMAL_DOMINANT' } }
      ];

      const facts = buildFacts({ members, relationships, conditions });
      // Non-biological relatives must NOT count as affected biological parent or first degree
      expect(facts.affected_parent).toBe(false);
      expect(facts.first_degree_affected).toBe(false);
      expect(facts.parent_count).toBe(0); // Biological parent count remains 0
      expect(facts.consanguinity_detected).toBe(false);
    });
  });

  // --- 9. Adoptive Family (Non-Biological) ---
  describe('9. Adoptive Family (Non-Biological) Handling', () => {
    it('strictly marks adoptive parents as non-biological and prevents biological risk propagation', () => {
      const adoptMother = { _id: 'am1', name: 'Adoptive Mom', sex: 'FEMALE' };
      const proband = { _id: 'pb', name: 'Proband', sex: 'MALE', isProband: true };

      const relDef = getRelationshipDefinition('ADOPTIVE_MOTHER');
      expect(relDef.isBiological).toBe(false);
      expect(relDef.group).toBe(RELATIONSHIP_GROUPS.ADOPTIVE);

      const members = [adoptMother, proband];
      const relationships = [
        { fromMemberId: adoptMother._id, toMemberId: proband._id, type: 'ADOPTIVE_MOTHER' }
      ];
      const conditions = [
        { memberId: adoptMother._id, status: 'AFFECTED', conditionId: { code: 'BRCA1' } }
      ];

      const facts = buildFacts({ members, relationships, conditions });
      expect(facts.affected_parent).toBe(false);
      expect(facts.first_degree_affected).toBe(false);
      expect(facts.maternal_line_affected).toBe(false);
    });
  });

  // --- 10. Duplicate Relationship Rejection ---
  describe('10. Duplicate Relationship Prevention', () => {
    it('rejects duplicate identical relationships and duplicate inverse entries', () => {
      const m1 = { _id: 'm1', name: 'Alice', sex: 'FEMALE' };
      const m2 = { _id: 'm2', name: 'Bob', sex: 'MALE' };

      const existingRels = [
        { fromMemberId: m1._id, toMemberId: m2._id, type: 'MOTHER' }
      ];

      // Exact duplicate
      const dup1 = validateRelationship(existingRels, m1, m2, 'MOTHER');
      expect(dup1.isValid).toBe(false);
      expect(dup1.error).toContain('already exists');

      // Inverse duplicate: Bob adding Alice as Mother (or Bob adding Son to Alice)
      const dup2 = validateRelationship(existingRels, m2, m1, 'SON');
      expect(dup2.isValid).toBe(false);
      expect(dup2.error).toContain('already exists');

      // Duplicate spouse in reverse direction
      const spouseRels = [
        { fromMemberId: m1._id, toMemberId: m2._id, type: 'SPOUSE' }
      ];
      const dupSpouse = validateRelationship(spouseRels, m2, m1, 'SPOUSE');
      expect(dupSpouse.isValid).toBe(false);
      expect(dupSpouse.error).toContain('already exists');
    });

    it('rejects contradictory relationships between the same members', () => {
      const parent = { _id: 'p1', name: 'Parent', sex: 'MALE' };
      const child = { _id: 'c1', name: 'Child', sex: 'MALE' };

      const existingRels = [
        { fromMemberId: parent._id, toMemberId: child._id, type: 'FATHER' }
      ];

      // Contradiction: Child cannot be parent of their own parent
      const invalidParent = validateRelationship(existingRels, child, parent, 'FATHER');
      expect(invalidParent.isValid).toBe(false);
      expect(invalidParent.error).toContain('already recorded as a biological parent');

      // Contradiction: Parent cannot also be Spouse of their child
      const invalidSpouse = validateRelationship(existingRels, parent, child, 'SPOUSE');
      expect(invalidSpouse.isValid).toBe(false);
      expect(invalidSpouse.error).toContain('already have a parent-child relationship');
    });
  });

  // --- 11. Self-Relationship Rejection ---
  describe('11. Self-Relationship Rejection', () => {
    it('strictly prevents a member from establishing a relationship with themselves', () => {
      const member = { _id: 'm1', name: 'Self Member', sex: 'MALE' };
      const result = validateRelationship([], member, member, 'BROTHER');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('A family member cannot have a relationship with themselves.');
    });
  });

  // --- 12. Inverse Relationship Handling ---
  describe('12. Inverse Relationship Handling', () => {
    it('produces intuitive, accurate inverse relationships across genders', () => {
      expect(getInverseRelationship('FATHER', 'MALE', 'MALE')).toBe('SON');
      expect(getInverseRelationship('FATHER', 'MALE', 'FEMALE')).toBe('DAUGHTER');
      expect(getInverseRelationship('MOTHER', 'FEMALE', 'MALE')).toBe('SON');
      expect(getInverseRelationship('SON', 'MALE', 'FEMALE')).toBe('MOTHER');
      expect(getInverseRelationship('PATERNAL_UNCLE', 'MALE', 'MALE')).toBe('NEPHEW');
      expect(getInverseRelationship('MATERNAL_AUNT', 'FEMALE', 'FEMALE')).toBe('NIECE');
      expect(getInverseRelationship('COUSIN', 'MALE', 'FEMALE')).toBe('FEMALE_COUSIN');
      expect(getInverseRelationship('STEP_FATHER', 'MALE', 'MALE')).toBe('STEP_SON');
      expect(getInverseRelationship('ADOPTIVE_MOTHER', 'FEMALE', 'FEMALE')).toBe('ADOPTED_DAUGHTER');
    });
  });

  // --- 13. Pedigree Generation with Extended Relationships ---
  describe('13. Pedigree Tree Derivation with Extended Relationships', () => {
    it('accurately derives complete 3-generation family relationships from biological graph', () => {
      const grandfather = { _id: 'gf', name: 'Grandfather', sex: 'MALE' };
      const grandmother = { _id: 'gm', name: 'Grandmother', sex: 'FEMALE' };
      const father = { _id: 'f', name: 'Father', sex: 'MALE' };
      const mother = { _id: 'm', name: 'Mother', sex: 'FEMALE' };
      const uncle = { _id: 'u', name: 'Paternal Uncle', sex: 'MALE' };
      const proband = { _id: 'pb', name: 'Rahul', sex: 'MALE', isProband: true };
      const cousin = { _id: 'cs', name: 'Cousin', sex: 'MALE' };

      const members = [grandfather, grandmother, father, mother, uncle, proband, cousin];

      const relationships = [
        // Grandparents to Father and Uncle
        { fromMemberId: grandfather._id, toMemberId: father._id, type: 'FATHER' },
        { fromMemberId: grandmother._id, toMemberId: father._id, type: 'MOTHER' },
        { fromMemberId: grandfather._id, toMemberId: uncle._id, type: 'FATHER' },
        { fromMemberId: grandmother._id, toMemberId: uncle._id, type: 'MOTHER' },
        // Parents to Proband
        { fromMemberId: father._id, toMemberId: proband._id, type: 'FATHER' },
        { fromMemberId: mother._id, toMemberId: proband._id, type: 'MOTHER' },
        // Uncle to Cousin
        { fromMemberId: uncle._id, toMemberId: cousin._id, type: 'FATHER' }
      ];

      const derivation = deriveAllRelationships(members, relationships);

      // Verify derived paternal grandfather for proband
      const patGf = derivation.derived.find(
        d => d.fromMemberId === grandfather._id && d.toMemberId === proband._id
      );
      expect(patGf).toBeDefined();
      expect(patGf.derivedCode).toBe('PATERNAL_GRANDFATHER');
      expect(patGf.lineage).toBe('PATERNAL');

      // Verify derived paternal uncle for proband
      const patUncle = derivation.derived.find(
        d => d.fromMemberId === uncle._id && d.toMemberId === proband._id
      );
      expect(patUncle).toBeDefined();
      expect(patUncle.derivedCode).toBe('PATERNAL_UNCLE');

      // Verify derived cousin between proband and cousin
      const derivedCousin = derivation.derived.find(
        d => d.fromMemberId === proband._id && d.toMemberId === cousin._id
      );
      expect(derivedCousin).toBeDefined();
      expect(derivedCousin.type).toBe('COUSIN');
    });

    it('verifies all 51 requested relationship options are registered and accessible', () => {
      expect(RELATIONSHIP_DEFINITIONS.length).toBeGreaterThanOrEqual(51);

      const requiredCodes = [
        // Immediate
        'FATHER', 'MOTHER', 'BIOLOGICAL_PARENT', 'SON', 'DAUGHTER', 'BIOLOGICAL_CHILD',
        'BROTHER', 'SISTER', 'SIBLING', 'HUSBAND', 'WIFE', 'SPOUSE', 'PARTNER',
        // Grandparents & Grandchildren
        'PATERNAL_GRANDFATHER', 'PATERNAL_GRANDMOTHER', 'MATERNAL_GRANDFATHER', 'MATERNAL_GRANDMOTHER',
        'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON', 'GRANDDAUGHTER', 'GRANDCHILD',
        // Extended
        'PATERNAL_UNCLE', 'MATERNAL_UNCLE', 'UNCLE', 'PATERNAL_AUNT', 'MATERNAL_AUNT', 'AUNT',
        'NEPHEW', 'NIECE', 'MALE_COUSIN', 'FEMALE_COUSIN', 'COUSIN',
        // Step & Adoptive
        'HALF_BROTHER', 'HALF_SISTER', 'HALF_SIBLING',
        'STEP_FATHER', 'STEP_MOTHER', 'STEP_PARENT', 'STEP_BROTHER', 'STEP_SISTER', 'STEP_SIBLING',
        'STEP_SON', 'STEP_DAUGHTER', 'STEP_CHILD',
        'ADOPTIVE_FATHER', 'ADOPTIVE_MOTHER', 'ADOPTIVE_PARENT', 'ADOPTED_SON', 'ADOPTED_DAUGHTER', 'ADOPTED_CHILD'
      ];

      requiredCodes.forEach(code => {
        const def = getRelationshipDefinition(code);
        expect(def).toBeDefined();
        expect(def.code).toBe(code);
        expect(def.label).toBeTruthy();
        expect(def.group).toBeTruthy();
      });
    });
  });
});
