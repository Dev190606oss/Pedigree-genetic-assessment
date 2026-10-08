/**
 * PEDIGREE — Relationship Helper
 * Provides relationship definitions, groupings, validation, inverse resolution,
 * and graph-based relationship derivation.
 */

const { RELATIONSHIP_TYPES, SEX_TYPES } = require('../constants');

// Group names
const RELATIONSHIP_GROUPS = {
  IMMEDIATE: 'Immediate Family',
  GRANDPARENTS: 'Grandparents & Grandchildren',
  EXTENDED: 'Extended Family',
  STEP: 'Step Family',
  ADOPTIVE: 'Adoptive Family',
  PARTNERS: 'Partner Relationships'
};

/**
 * 51 Granular Relationship Definitions
 */
const RELATIONSHIP_DEFINITIONS = [
  // --- Immediate Family ---
  {
    code: 'FATHER',
    label: 'Father',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the biological father of',
    inverseBase: 'CHILD',
    direction: 'PARENT_TO_CHILD'
  },
  {
    code: 'MOTHER',
    label: 'Mother',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the biological mother of',
    inverseBase: 'CHILD',
    direction: 'PARENT_TO_CHILD'
  },
  {
    code: 'BIOLOGICAL_PARENT',
    label: 'Biological Parent',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    fromSex: null,
    toSex: null,
    description: 'is the biological parent of',
    inverseBase: 'CHILD',
    direction: 'PARENT_TO_CHILD'
  },
  {
    code: 'PARENT_CHILD',
    label: 'Parent of (Biological Child)',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    fromSex: null,
    toSex: null,
    description: 'is the biological parent of',
    inverseBase: 'CHILD',
    direction: 'PARENT_TO_CHILD'
  },
  {
    code: 'SON',
    label: 'Son',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: -1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the biological son of',
    inverseBase: 'PARENT',
    direction: 'CHILD_TO_PARENT'
  },
  {
    code: 'DAUGHTER',
    label: 'Daughter',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: -1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the biological daughter of',
    inverseBase: 'PARENT',
    direction: 'CHILD_TO_PARENT'
  },
  {
    code: 'BIOLOGICAL_CHILD',
    label: 'Biological Child',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: -1,
    fromSex: null,
    toSex: null,
    description: 'is the biological child of',
    inverseBase: 'PARENT',
    direction: 'CHILD_TO_PARENT'
  },
  {
    code: 'BROTHER',
    label: 'Brother',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the brother of',
    inverseBase: 'SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'SISTER',
    label: 'Sister',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the sister of',
    inverseBase: 'SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'SIBLING',
    label: 'Sibling',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: null,
    toSex: null,
    description: 'is the sibling of',
    inverseBase: 'SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'HUSBAND',
    label: 'Husband',
    group: RELATIONSHIP_GROUPS.PARTNERS,
    baseType: 'SPOUSE',
    isBiological: false,
    generationDiff: 0,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the husband of',
    inverseBase: 'SPOUSE',
    direction: 'SYMMETRIC'
  },
  {
    code: 'WIFE',
    label: 'Wife',
    group: RELATIONSHIP_GROUPS.PARTNERS,
    baseType: 'SPOUSE',
    isBiological: false,
    generationDiff: 0,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the wife of',
    inverseBase: 'SPOUSE',
    direction: 'SYMMETRIC'
  },
  {
    code: 'SPOUSE',
    label: 'Spouse / Married',
    group: RELATIONSHIP_GROUPS.PARTNERS,
    baseType: 'SPOUSE',
    isBiological: false,
    generationDiff: 0,
    fromSex: null,
    toSex: null,
    description: 'is married to',
    inverseBase: 'SPOUSE',
    direction: 'SYMMETRIC'
  },
  {
    code: 'PARTNER',
    label: 'Reproductive Partner',
    group: RELATIONSHIP_GROUPS.PARTNERS,
    baseType: 'PARTNER',
    isBiological: false,
    generationDiff: 0,
    fromSex: null,
    toSex: null,
    description: 'is the reproductive partner of',
    inverseBase: 'PARTNER',
    direction: 'SYMMETRIC'
  },

  // --- Grandparents & Grandchildren ---
  {
    code: 'PATERNAL_GRANDFATHER',
    label: 'Paternal Grandfather',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'PATERNAL',
    generationDiff: 2,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the paternal grandfather of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'PATERNAL_GRANDMOTHER',
    label: 'Paternal Grandmother',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'PATERNAL',
    generationDiff: 2,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the paternal grandmother of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'MATERNAL_GRANDFATHER',
    label: 'Maternal Grandfather',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 2,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the maternal grandfather of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'MATERNAL_GRANDMOTHER',
    label: 'Maternal Grandmother',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 2,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the maternal grandmother of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'GRANDFATHER',
    label: 'Grandfather',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: null,
    generationDiff: 2,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the grandfather of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'GRANDMOTHER',
    label: 'Grandmother',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: null,
    generationDiff: 2,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the grandmother of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'GRANDPARENT',
    label: 'Grandparent',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: null,
    generationDiff: 2,
    fromSex: null,
    toSex: null,
    description: 'is the grandparent of',
    inverseBase: 'GRANDCHILD',
    direction: 'EXTENDED'
  },
  {
    code: 'GRANDSON',
    label: 'Grandson',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDCHILD',
    isBiological: true,
    lineage: null,
    generationDiff: -2,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the grandson of',
    inverseBase: 'GRANDPARENT',
    direction: 'EXTENDED'
  },
  {
    code: 'GRANDDAUGHTER',
    label: 'Granddaughter',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDCHILD',
    isBiological: true,
    lineage: null,
    generationDiff: -2,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the granddaughter of',
    inverseBase: 'GRANDPARENT',
    direction: 'EXTENDED'
  },
  {
    code: 'GRANDCHILD',
    label: 'Grandchild',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDCHILD',
    isBiological: true,
    lineage: null,
    generationDiff: -2,
    fromSex: null,
    toSex: null,
    description: 'is the grandchild of',
    inverseBase: 'GRANDPARENT',
    direction: 'EXTENDED'
  },

  // --- Extended Family ---
  {
    code: 'PATERNAL_UNCLE',
    label: 'Paternal Uncle',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'PATERNAL',
    generationDiff: 1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the paternal uncle of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'MATERNAL_UNCLE',
    label: 'Maternal Uncle',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the maternal uncle of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'UNCLE',
    label: 'Uncle',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: null,
    generationDiff: 1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the uncle of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'PATERNAL_AUNT',
    label: 'Paternal Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'PATERNAL',
    generationDiff: 1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the paternal aunt of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'MATERNAL_AUNT',
    label: 'Maternal Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the maternal aunt of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'AUNT',
    label: 'Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: null,
    generationDiff: 1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the aunt of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'AUNT_UNCLE',
    label: 'Uncle / Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: null,
    generationDiff: 1,
    fromSex: null,
    toSex: null,
    description: 'is the uncle or aunt of',
    inverseBase: 'NEPHEW_NIECE',
    direction: 'EXTENDED'
  },
  {
    code: 'NEPHEW',
    label: 'Nephew',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'NEPHEW_NIECE',
    isBiological: true,
    lineage: null,
    generationDiff: -1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the nephew of',
    inverseBase: 'AUNT_UNCLE',
    direction: 'EXTENDED'
  },
  {
    code: 'NIECE',
    label: 'Niece',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'NEPHEW_NIECE',
    isBiological: true,
    lineage: null,
    generationDiff: -1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the niece of',
    inverseBase: 'AUNT_UNCLE',
    direction: 'EXTENDED'
  },
  {
    code: 'NEPHEW_NIECE',
    label: 'Nephew / Niece',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'NEPHEW_NIECE',
    isBiological: true,
    lineage: null,
    generationDiff: -1,
    fromSex: null,
    toSex: null,
    description: 'is the nephew/niece of',
    inverseBase: 'AUNT_UNCLE',
    direction: 'EXTENDED'
  },
  {
    code: 'MALE_COUSIN',
    label: 'Male Cousin',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'COUSIN',
    isBiological: true,
    lineage: null,
    generationDiff: 0,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the cousin of',
    inverseBase: 'COUSIN',
    direction: 'SYMMETRIC'
  },
  {
    code: 'FEMALE_COUSIN',
    label: 'Female Cousin',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'COUSIN',
    isBiological: true,
    lineage: null,
    generationDiff: 0,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the cousin of',
    inverseBase: 'COUSIN',
    direction: 'SYMMETRIC'
  },
  {
    code: 'COUSIN',
    label: 'Cousin',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'COUSIN',
    isBiological: true,
    lineage: null,
    generationDiff: 0,
    fromSex: null,
    toSex: null,
    description: 'is the cousin of',
    inverseBase: 'COUSIN',
    direction: 'SYMMETRIC'
  },

  // --- Step Family ---
  {
    code: 'HALF_BROTHER',
    label: 'Half-Brother',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'HALF_SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the half-brother of',
    inverseBase: 'HALF_SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'HALF_SISTER',
    label: 'Half-Sister',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'HALF_SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the half-sister of',
    inverseBase: 'HALF_SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'HALF_SIBLING',
    label: 'Half-Sibling',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'HALF_SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: null,
    toSex: null,
    description: 'is the half-sibling of',
    inverseBase: 'HALF_SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'STEP_FATHER',
    label: 'Step-Father',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the step-father of',
    inverseBase: 'STEP_CHILD',
    direction: 'STEP_PARENT_TO_CHILD'
  },
  {
    code: 'STEP_MOTHER',
    label: 'Step-Mother',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the step-mother of',
    inverseBase: 'STEP_CHILD',
    direction: 'STEP_PARENT_TO_CHILD'
  },
  {
    code: 'STEP_PARENT',
    label: 'Step-Parent',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: null,
    toSex: null,
    description: 'is the step-parent of',
    inverseBase: 'STEP_CHILD',
    direction: 'STEP_PARENT_TO_CHILD'
  },
  {
    code: 'STEP_BROTHER',
    label: 'Step-Brother',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_SIBLING',
    isBiological: false,
    generationDiff: 0,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the step-brother of',
    inverseBase: 'STEP_SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'STEP_SISTER',
    label: 'Step-Sister',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_SIBLING',
    isBiological: false,
    generationDiff: 0,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the step-sister of',
    inverseBase: 'STEP_SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'STEP_SIBLING',
    label: 'Step-Sibling',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_SIBLING',
    isBiological: false,
    generationDiff: 0,
    fromSex: null,
    toSex: null,
    description: 'is the step-sibling of',
    inverseBase: 'STEP_SIBLING',
    direction: 'SYMMETRIC'
  },
  {
    code: 'STEP_SON',
    label: 'Step-Son',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the step-son of',
    inverseBase: 'STEP_PARENT',
    direction: 'STEP_CHILD_TO_PARENT'
  },
  {
    code: 'STEP_DAUGHTER',
    label: 'Step-Daughter',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the step-daughter of',
    inverseBase: 'STEP_PARENT',
    direction: 'STEP_CHILD_TO_PARENT'
  },
  {
    code: 'STEP_CHILD',
    label: 'Step-Child',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: null,
    toSex: null,
    description: 'is the step-child of',
    inverseBase: 'STEP_PARENT',
    direction: 'STEP_CHILD_TO_PARENT'
  },

  // --- Adoptive Family ---
  {
    code: 'ADOPTIVE_FATHER',
    label: 'Adoptive Father',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTIVE_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the adoptive father of',
    inverseBase: 'ADOPTED_CHILD',
    direction: 'ADOPTIVE_PARENT_TO_CHILD'
  },
  {
    code: 'ADOPTIVE_MOTHER',
    label: 'Adoptive Mother',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTIVE_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the adoptive mother of',
    inverseBase: 'ADOPTED_CHILD',
    direction: 'ADOPTIVE_PARENT_TO_CHILD'
  },
  {
    code: 'ADOPTIVE_PARENT',
    label: 'Adoptive Parent',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTIVE_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: null,
    toSex: null,
    description: 'is the adoptive parent of',
    inverseBase: 'ADOPTED_CHILD',
    direction: 'ADOPTIVE_PARENT_TO_CHILD'
  },
  {
    code: 'ADOPTED_SON',
    label: 'Adopted Son',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTED_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: SEX_TYPES.MALE,
    toSex: null,
    description: 'is the adopted son of',
    inverseBase: 'ADOPTIVE_PARENT',
    direction: 'ADOPTED_CHILD_TO_PARENT'
  },
  {
    code: 'ADOPTED_DAUGHTER',
    label: 'Adopted Daughter',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTED_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: SEX_TYPES.FEMALE,
    toSex: null,
    description: 'is the adopted daughter of',
    inverseBase: 'ADOPTIVE_PARENT',
    direction: 'ADOPTED_CHILD_TO_PARENT'
  },
  {
    code: 'ADOPTED_CHILD',
    label: 'Adopted Child',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTED_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: null,
    toSex: null,
    description: 'is the adopted child of',
    inverseBase: 'ADOPTIVE_PARENT',
    direction: 'ADOPTED_CHILD_TO_PARENT'
  }
];

// Lookup by code
const DEFINITIONS_BY_CODE = {};
RELATIONSHIP_DEFINITIONS.forEach(def => {
  DEFINITIONS_BY_CODE[def.code] = def;
});

function getRelationshipDefinition(type) {
  return DEFINITIONS_BY_CODE[type] || {
    code: type,
    label: type ? type.replace(/_/g, ' ') : 'Related to',
    group: 'Other',
    baseType: type || 'OTHER',
    isBiological: true,
    generationDiff: 0,
    description: 'is related to'
  };
}

/**
 * Calculates the exact reverse relationship based on type and the target member's sex
 */
function getInverseRelationship(type, fromSex, toSex) {
  const def = getRelationshipDefinition(type);
  const targetSex = toSex || SEX_TYPES.UNKNOWN;

  switch (def.code) {
    // Immediate Parent -> Child
    case 'FATHER':
    case 'MOTHER':
    case 'BIOLOGICAL_PARENT':
    case 'PARENT_CHILD':
      if (targetSex === SEX_TYPES.MALE) return 'SON';
      if (targetSex === SEX_TYPES.FEMALE) return 'DAUGHTER';
      return 'BIOLOGICAL_CHILD';

    // Immediate Child -> Parent
    case 'SON':
    case 'DAUGHTER':
    case 'BIOLOGICAL_CHILD':
      if (targetSex === SEX_TYPES.MALE) return 'FATHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'MOTHER';
      return 'BIOLOGICAL_PARENT';

    // Sibling
    case 'BROTHER':
    case 'SISTER':
    case 'SIBLING':
      if (targetSex === SEX_TYPES.MALE) return 'BROTHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'SISTER';
      return 'SIBLING';

    // Spouse
    case 'HUSBAND':
    case 'WIFE':
    case 'SPOUSE':
      if (targetSex === SEX_TYPES.MALE) return 'HUSBAND';
      if (targetSex === SEX_TYPES.FEMALE) return 'WIFE';
      return 'SPOUSE';

    case 'PARTNER':
      return 'PARTNER';

    // Grandparent -> Grandchild
    case 'PATERNAL_GRANDFATHER':
    case 'PATERNAL_GRANDMOTHER':
    case 'MATERNAL_GRANDFATHER':
    case 'MATERNAL_GRANDMOTHER':
    case 'GRANDFATHER':
    case 'GRANDMOTHER':
    case 'GRANDPARENT':
      if (targetSex === SEX_TYPES.MALE) return 'GRANDSON';
      if (targetSex === SEX_TYPES.FEMALE) return 'GRANDDAUGHTER';
      return 'GRANDCHILD';

    // Grandchild -> Grandparent
    case 'GRANDSON':
    case 'GRANDDAUGHTER':
    case 'GRANDCHILD':
      if (def.lineage === 'PATERNAL') {
        return targetSex === SEX_TYPES.MALE ? 'PATERNAL_GRANDFATHER' : 'PATERNAL_GRANDMOTHER';
      }
      if (def.lineage === 'MATERNAL') {
        return targetSex === SEX_TYPES.MALE ? 'MATERNAL_GRANDFATHER' : 'MATERNAL_GRANDMOTHER';
      }
      if (targetSex === SEX_TYPES.MALE) return 'GRANDFATHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'GRANDMOTHER';
      return 'GRANDPARENT';

    // Aunt/Uncle -> Nephew/Niece
    case 'PATERNAL_UNCLE':
    case 'MATERNAL_UNCLE':
    case 'UNCLE':
    case 'PATERNAL_AUNT':
    case 'MATERNAL_AUNT':
    case 'AUNT':
    case 'AUNT_UNCLE':
      if (targetSex === SEX_TYPES.MALE) return 'NEPHEW';
      if (targetSex === SEX_TYPES.FEMALE) return 'NIECE';
      return 'NEPHEW_NIECE';

    // Nephew/Niece -> Aunt/Uncle
    case 'NEPHEW':
    case 'NIECE':
    case 'NEPHEW_NIECE':
      if (def.lineage === 'PATERNAL') {
        return targetSex === SEX_TYPES.MALE ? 'PATERNAL_UNCLE' : 'PATERNAL_AUNT';
      }
      if (def.lineage === 'MATERNAL') {
        return targetSex === SEX_TYPES.MALE ? 'MATERNAL_UNCLE' : 'MATERNAL_AUNT';
      }
      if (targetSex === SEX_TYPES.MALE) return 'UNCLE';
      if (targetSex === SEX_TYPES.FEMALE) return 'AUNT';
      return 'AUNT_UNCLE';

    // Cousin
    case 'MALE_COUSIN':
    case 'FEMALE_COUSIN':
    case 'COUSIN':
      if (targetSex === SEX_TYPES.MALE) return 'MALE_COUSIN';
      if (targetSex === SEX_TYPES.FEMALE) return 'FEMALE_COUSIN';
      return 'COUSIN';

    // Half Sibling
    case 'HALF_BROTHER':
    case 'HALF_SISTER':
    case 'HALF_SIBLING':
      if (targetSex === SEX_TYPES.MALE) return 'HALF_BROTHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'HALF_SISTER';
      return 'HALF_SIBLING';

    // Step Parent -> Step Child
    case 'STEP_FATHER':
    case 'STEP_MOTHER':
    case 'STEP_PARENT':
      if (targetSex === SEX_TYPES.MALE) return 'STEP_SON';
      if (targetSex === SEX_TYPES.FEMALE) return 'STEP_DAUGHTER';
      return 'STEP_CHILD';

    // Step Child -> Step Parent
    case 'STEP_SON':
    case 'STEP_DAUGHTER':
    case 'STEP_CHILD':
      if (targetSex === SEX_TYPES.MALE) return 'STEP_FATHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'STEP_MOTHER';
      return 'STEP_PARENT';

    // Step Sibling
    case 'STEP_BROTHER':
    case 'STEP_SISTER':
    case 'STEP_SIBLING':
      if (targetSex === SEX_TYPES.MALE) return 'STEP_BROTHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'STEP_SISTER';
      return 'STEP_SIBLING';

    // Adoptive Parent -> Adopted Child
    case 'ADOPTIVE_FATHER':
    case 'ADOPTIVE_MOTHER':
    case 'ADOPTIVE_PARENT':
      if (targetSex === SEX_TYPES.MALE) return 'ADOPTED_SON';
      if (targetSex === SEX_TYPES.FEMALE) return 'ADOPTED_DAUGHTER';
      return 'ADOPTED_CHILD';

    // Adopted Child -> Adoptive Parent
    case 'ADOPTED_SON':
    case 'ADOPTED_DAUGHTER':
    case 'ADOPTED_CHILD':
      if (targetSex === SEX_TYPES.MALE) return 'ADOPTIVE_FATHER';
      if (targetSex === SEX_TYPES.FEMALE) return 'ADOPTIVE_MOTHER';
      return 'ADOPTIVE_PARENT';

    default:
      return type;
  }
}

/**
 * Returns dynamic, human-readable helper text for relationship modal preview
 * e.g. "Devansh is the maternal grandfather of Rahul."
 */
function getRelationshipPreviewText(type, fromName = 'Member A', toName = 'Member B') {
  const def = getRelationshipDefinition(type);
  const labelLower = def.label.toLowerCase();

  switch (def.code) {
    case 'SPOUSE':
      return `${fromName} is married to ${toName}.`;
    case 'PARTNER':
      return `${fromName} is the reproductive partner of ${toName}.`;
    default:
      return `${fromName} is the ${labelLower} of ${toName}.`;
  }
}

/**
 * Normalizes an established relationship to maintain pedigree graph integrity
 * Ensures biological PARENT_CHILD edges strictly flow from Parent to Child
 */
function normalizeRelationshipRecord(fromMember, toMember, type) {
  const def = getRelationshipDefinition(type);
  const fromId = fromMember._id.toString();
  const toId = toMember._id.toString();
  const inverseType = getInverseRelationship(type, fromMember.sex, toMember.sex);

  let fromMemberId = fromMember._id;
  let toMemberId = toMember._id;
  let storedType = def.code;
  let canonicalBaseType = def.baseType;

  const metadata = {
    specificType: def.code,
    label: def.label,
    group: def.group,
    baseType: canonicalBaseType,
    isBiological: def.isBiological,
    lineage: def.lineage || null,
    generationDiff: def.generationDiff,
    direction: def.direction,
    enteredFromId: fromId,
    enteredToId: toId,
    inverseType: inverseType,
    enteredType: def.code
  };

  return {
    fromMemberId,
    toMemberId,
    type: storedType,
    metadata
  };
}

/**
 * Helper to extract biological parent-child role from any relationship record
 */
function getBiologicalParentChildRoles(rel) {
  const fId = (rel.fromMemberId?._id || rel.fromMemberId)?.toString();
  const tId = (rel.toMemberId?._id || rel.toMemberId)?.toString();
  const type = rel.type;
  const def = getRelationshipDefinition(type);
  const baseType = rel.metadata?.baseType || def.baseType;
  const isBio = rel.metadata?.isBiological !== undefined ? rel.metadata.isBiological : def.isBiological;
  const dir = rel.metadata?.direction || def.direction;

  if (baseType === 'PARENT_CHILD' && isBio) {
    if (dir === 'CHILD_TO_PARENT') {
      return { isParentChild: true, parentId: tId, childId: fId };
    }
    return { isParentChild: true, parentId: fId, childId: tId };
  }
  return { isParentChild: false };
}

/**
 * Validates relationships for impossible self-relations, duplicates, and contradictions
 */
function validateRelationship(existingRelationships = [], fromMember, toMember, type) {
  const fromId = fromMember._id.toString();
  const toId = toMember._id.toString();

  // 1. Self relationship check
  if (fromId === toId) {
    return {
      isValid: false,
      error: 'A family member cannot have a relationship with themselves.'
    };
  }

  const def = getRelationshipDefinition(type);
  const inverseType = getInverseRelationship(type, fromMember.sex, toMember.sex);

  // Biological parent-child roles for the candidate relationship
  const candidatePC = getBiologicalParentChildRoles({
    fromMemberId: fromId,
    toMemberId: toId,
    type,
    metadata: {
      baseType: def.baseType,
      isBiological: def.isBiological,
      direction: def.direction
    }
  });

  // 2. Check against all existing relationships
  for (const rel of existingRelationships) {
    const rFrom = (rel.fromMemberId?._id || rel.fromMemberId).toString();
    const rTo = (rel.toMemberId?._id || rel.toMemberId).toString();
    const rType = rel.type;
    const rDef = getRelationshipDefinition(rType);
    const rSpecific = rel.metadata?.specificType || rType;
    const rBaseType = rel.metadata?.baseType || rDef.baseType;
    const isSamePair = (rFrom === fromId && rTo === toId);
    const isReversePair = (rFrom === toId && rTo === fromId);
    const involvesBoth = isSamePair || isReversePair;

    if (!involvesBoth) continue;

    // Check biological parent-child existing role
    const existingPC = getBiologicalParentChildRoles(rel);

    if (candidatePC.isParentChild && existingPC.isParentChild) {
      if (candidatePC.parentId === existingPC.parentId && candidatePC.childId === existingPC.childId) {
        return {
          isValid: false,
          error: `This parent-child relationship already exists between ${fromMember.name} and ${toMember.name}.`
        };
      }
      if (candidatePC.parentId === existingPC.childId && candidatePC.childId === existingPC.parentId) {
        return {
          isValid: false,
          error: `Cannot establish relationship: ${toMember.name} is already recorded as a biological parent of ${fromMember.name}.`
        };
      }
    }

    // Contradiction: Biological Parent-Child vs Spouse / Partner
    if (
      (candidatePC.isParentChild && (rBaseType === 'SPOUSE' || rBaseType === 'PARTNER')) ||
      (existingPC.isParentChild && (def.baseType === 'SPOUSE' || def.baseType === 'PARTNER'))
    ) {
      return {
        isValid: false,
        error: `Cannot establish relationship: ${fromMember.name} and ${toMember.name} already have a parent-child relationship.`
      };
    }

    // Contradiction: Biological Parent-Child vs Sibling
    if (
      (candidatePC.isParentChild && rBaseType === 'SIBLING') ||
      (existingPC.isParentChild && def.baseType === 'SIBLING')
    ) {
      return {
        isValid: false,
        error: `Cannot establish relationship: ${fromMember.name} and ${toMember.name} already have a parent-child relationship.`
      };
    }

    // Duplicate Spouse / Partner
    if (
      (def.baseType === 'SPOUSE' || def.baseType === 'PARTNER') &&
      (rBaseType === 'SPOUSE' || rBaseType === 'PARTNER')
    ) {
      return {
        isValid: false,
        error: `This relationship already exists between ${fromMember.name} and ${toMember.name}.`
      };
    }

    // Duplicate Sibling
    if (def.baseType === 'SIBLING' && rBaseType === 'SIBLING') {
      return {
        isValid: false,
        error: `This relationship already exists between ${fromMember.name} and ${toMember.name}.`
      };
    }

    // Duplicate Grandparent
    if (def.baseType === 'GRANDPARENT' && rBaseType === 'GRANDPARENT') {
      if (isSamePair && def.direction === rDef.direction) {
        return {
          isValid: false,
          error: `This grandparent relationship already exists between ${fromMember.name} and ${toMember.name}.`
        };
      }
      if (isReversePair && def.direction !== rDef.direction) {
        return {
          isValid: false,
          error: `This grandparent relationship already exists between ${fromMember.name} and ${toMember.name}.`
        };
      }
      if (isSamePair && def.direction !== rDef.direction) {
        return {
          isValid: false,
          error: `Cannot establish relationship: a member cannot be both grandparent and grandchild of the same person.`
        };
      }
    }

    // General exact duplicate (direct match)
    if (isSamePair && (rSpecific === def.code || rType === def.code)) {
      return {
        isValid: false,
        error: `This relationship already exists between ${fromMember.name} and ${toMember.name}.`
      };
    }

    // General exact duplicate (inverse match)
    if (isReversePair && (rSpecific === inverseType || rType === inverseType)) {
      return {
        isValid: false,
        error: `This relationship already exists between ${fromMember.name} and ${toMember.name}.`
      };
    }
  }

  return { isValid: true };
}

/**
 * Derives comprehensive biological and family relationships from graph traversal
 */
function deriveAllRelationships(members = [], relationships = []) {
  const membersMap = {};
  members.forEach(m => {
    membersMap[m._id.toString()] = m;
  });

  const parentsOf = {};
  const childrenOf = {};
  const spousesOf = {};
  const siblingsOf = {};
  const directRelations = {}; // "id1-id2" -> rel

  members.forEach(m => {
    const id = m._id.toString();
    parentsOf[id] = [];
    childrenOf[id] = [];
    spousesOf[id] = [];
    siblingsOf[id] = [];
  });

  relationships.forEach(rel => {
    const fId = (rel.fromMemberId?._id || rel.fromMemberId)?.toString();
    const tId = (rel.toMemberId?._id || rel.toMemberId)?.toString();
    if (!fId || !tId || !membersMap[fId] || !membersMap[tId]) return;

    directRelations[`${fId}-${tId}`] = rel;

    const pcRole = getBiologicalParentChildRoles(rel);
    if (pcRole.isParentChild) {
      parentsOf[pcRole.childId].push(pcRole.parentId);
      childrenOf[pcRole.parentId].push(pcRole.childId);
    } else {
      const def = getRelationshipDefinition(rel.type);
      const baseType = rel.metadata?.baseType || def.baseType;
      if (baseType === 'SPOUSE' || baseType === 'PARTNER') {
        spousesOf[fId].push(tId);
        spousesOf[tId].push(fId);
      } else if (baseType === 'SIBLING') {
        siblingsOf[fId].push(tId);
        siblingsOf[tId].push(fId);
      }
    }
  });

  // Infer siblings through shared parents
  members.forEach(m1 => {
    const id1 = m1._id.toString();
    members.forEach(m2 => {
      const id2 = m2._id.toString();
      if (id1 !== id2) {
        const p1 = parentsOf[id1] || [];
        const p2 = parentsOf[id2] || [];
        const shared = p1.filter(p => p2.includes(p));
        if (shared.length > 0 && !siblingsOf[id1].includes(id2)) {
          siblingsOf[id1].push(id2);
        }
      }
    });
  });

  const derived = [];

  // 1. Grandparents & Grandchildren
  members.forEach(child => {
    const cId = child._id.toString();
    (parentsOf[cId] || []).forEach(parentId => {
      const parent = membersMap[parentId];
      const isMaternal = parent?.sex === SEX_TYPES.FEMALE;
      const isPaternal = parent?.sex === SEX_TYPES.MALE;

      (parentsOf[parentId] || []).forEach(gpId => {
        const gp = membersMap[gpId];
        if (!gp) return;

        let code = 'GRANDPARENT';
        if (isPaternal) {
          code = gp.sex === SEX_TYPES.MALE ? 'PATERNAL_GRANDFATHER' : 'PATERNAL_GRANDMOTHER';
        } else if (isMaternal) {
          code = gp.sex === SEX_TYPES.MALE ? 'MATERNAL_GRANDFATHER' : 'MATERNAL_GRANDMOTHER';
        } else {
          code = gp.sex === SEX_TYPES.MALE ? 'GRANDFATHER' : (gp.sex === SEX_TYPES.FEMALE ? 'GRANDMOTHER' : 'GRANDPARENT');
        }

        derived.push({
          fromMemberId: gpId,
          toMemberId: cId,
          type: 'GRANDPARENT',
          derivedCode: code,
          lineage: isPaternal ? 'PATERNAL' : (isMaternal ? 'MATERNAL' : null),
          label: getRelationshipDefinition(code).label,
          viaMemberId: parentId
        });
      });
    });
  });

  // 2. Aunts & Uncles
  members.forEach(child => {
    const cId = child._id.toString();
    (parentsOf[cId] || []).forEach(parentId => {
      const parent = membersMap[parentId];
      const isMaternal = parent?.sex === SEX_TYPES.FEMALE;
      const isPaternal = parent?.sex === SEX_TYPES.MALE;

      (siblingsOf[parentId] || []).forEach(auId => {
        const au = membersMap[auId];
        if (!au) return;

        let code = 'AUNT_UNCLE';
        if (isPaternal) {
          code = au.sex === SEX_TYPES.MALE ? 'PATERNAL_UNCLE' : 'PATERNAL_AUNT';
        } else if (isMaternal) {
          code = au.sex === SEX_TYPES.MALE ? 'MATERNAL_UNCLE' : 'MATERNAL_AUNT';
        } else {
          code = au.sex === SEX_TYPES.MALE ? 'UNCLE' : (au.sex === SEX_TYPES.FEMALE ? 'AUNT' : 'AUNT_UNCLE');
        }

        derived.push({
          fromMemberId: auId,
          toMemberId: cId,
          type: 'AUNT_UNCLE',
          derivedCode: code,
          lineage: isPaternal ? 'PATERNAL' : (isMaternal ? 'MATERNAL' : null),
          label: getRelationshipDefinition(code).label,
          viaMemberId: parentId
        });
      });
    });
  });

  // 3. Cousins
  members.forEach(m1 => {
    const id1 = m1._id.toString();
    (parentsOf[id1] || []).forEach(p1Id => {
      (siblingsOf[p1Id] || []).forEach(p2Id => {
        (childrenOf[p2Id] || []).forEach(id2 => {
          if (id1 !== id2) {
            const m2 = membersMap[id2];
            const code = m1.sex === SEX_TYPES.MALE ? 'MALE_COUSIN' : (m1.sex === SEX_TYPES.FEMALE ? 'FEMALE_COUSIN' : 'COUSIN');
            derived.push({
              fromMemberId: id1,
              toMemberId: id2,
              type: 'COUSIN',
              derivedCode: code,
              label: getRelationshipDefinition(code).label
            });
          }
        });
      });
    });
  });

  return {
    parentsOf,
    childrenOf,
    spousesOf,
    siblingsOf,
    derived
  };
}

module.exports = {
  RELATIONSHIP_GROUPS,
  RELATIONSHIP_DEFINITIONS,
  DEFINITIONS_BY_CODE,
  getRelationshipDefinition,
  getInverseRelationship,
  getRelationshipPreviewText,
  normalizeRelationshipRecord,
  validateRelationship,
  deriveAllRelationships,
  getBiologicalParentChildRoles
};
