/**
 * PEDIGREE — Client Relationship System Helper
 * Comprehensive dictionary and utilities for 51 family relationship types across 6 logical groups.
 */

export const RELATIONSHIP_GROUPS = {
  IMMEDIATE: 'Immediate Family',
  GRANDPARENTS: 'Grandparents & Grandchildren',
  EXTENDED: 'Extended Family',
  STEP: 'Step Family',
  ADOPTIVE: 'Adoptive Family',
  PARTNERS: 'Partner Relationships'
};

export const RELATIONSHIP_DEFINITIONS = [
  // --- Immediate Family ---
  {
    code: 'FATHER',
    label: 'Father',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    fromSex: 'MALE',
    description: 'is the father of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'MOTHER',
    label: 'Mother',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    fromSex: 'FEMALE',
    description: 'is the mother of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'BIOLOGICAL_PARENT',
    label: 'Biological Parent',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    description: 'is the biological parent of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'SON',
    label: 'Son',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: -1,
    fromSex: 'MALE',
    description: 'is the son of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'DAUGHTER',
    label: 'Daughter',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: -1,
    fromSex: 'FEMALE',
    description: 'is the daughter of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'BIOLOGICAL_CHILD',
    label: 'Biological Child',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: -1,
    description: 'is the biological child of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'BROTHER',
    label: 'Brother',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: 'MALE',
    description: 'is the brother of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'SISTER',
    label: 'Sister',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: 'FEMALE',
    description: 'is the sister of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'SIBLING',
    label: 'Sibling',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    description: 'is the sibling of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    code: 'HUSBAND',
    label: 'Husband',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SPOUSE',
    isBiological: false,
    generationDiff: 0,
    fromSex: 'MALE',
    description: 'is the husband of',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    code: 'WIFE',
    label: 'Wife',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SPOUSE',
    isBiological: false,
    generationDiff: 0,
    fromSex: 'FEMALE',
    description: 'is the wife of',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    code: 'SPOUSE',
    label: 'Spouse / Married',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'SPOUSE',
    isBiological: false,
    generationDiff: 0,
    description: 'is married to',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  {
    code: 'PARTNER',
    label: 'Reproductive Partner',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARTNER',
    isBiological: false,
    generationDiff: 0,
    description: 'is the reproductive partner of',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200'
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
    fromSex: 'MALE',
    description: 'is the paternal grandfather of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'PATERNAL_GRANDMOTHER',
    label: 'Paternal Grandmother',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'PATERNAL',
    generationDiff: 2,
    fromSex: 'FEMALE',
    description: 'is the paternal grandmother of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'MATERNAL_GRANDFATHER',
    label: 'Maternal Grandfather',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 2,
    fromSex: 'MALE',
    description: 'is the maternal grandfather of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'MATERNAL_GRANDMOTHER',
    label: 'Maternal Grandmother',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 2,
    fromSex: 'FEMALE',
    description: 'is the maternal grandmother of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'GRANDFATHER',
    label: 'Grandfather',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    generationDiff: 2,
    fromSex: 'MALE',
    description: 'is the grandfather of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'GRANDMOTHER',
    label: 'Grandmother',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDPARENT',
    isBiological: true,
    generationDiff: 2,
    fromSex: 'FEMALE',
    description: 'is the grandmother of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'GRANDSON',
    label: 'Grandson',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDCHILD',
    isBiological: true,
    generationDiff: -2,
    fromSex: 'MALE',
    description: 'is the grandson of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'GRANDDAUGHTER',
    label: 'Granddaughter',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDCHILD',
    isBiological: true,
    generationDiff: -2,
    fromSex: 'FEMALE',
    description: 'is the granddaughter of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  {
    code: 'GRANDCHILD',
    label: 'Grandchild',
    group: RELATIONSHIP_GROUPS.GRANDPARENTS,
    baseType: 'GRANDCHILD',
    isBiological: true,
    generationDiff: -2,
    description: 'is the grandchild of',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200'
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
    fromSex: 'MALE',
    description: 'is the paternal uncle of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'MATERNAL_UNCLE',
    label: 'Maternal Uncle',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 1,
    fromSex: 'MALE',
    description: 'is the maternal uncle of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'UNCLE',
    label: 'Uncle',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    generationDiff: 1,
    fromSex: 'MALE',
    description: 'is the uncle of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'PATERNAL_AUNT',
    label: 'Paternal Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'PATERNAL',
    generationDiff: 1,
    fromSex: 'FEMALE',
    description: 'is the paternal aunt of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'MATERNAL_AUNT',
    label: 'Maternal Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    lineage: 'MATERNAL',
    generationDiff: 1,
    fromSex: 'FEMALE',
    description: 'is the maternal aunt of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'AUNT',
    label: 'Aunt',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'AUNT_UNCLE',
    isBiological: true,
    generationDiff: 1,
    fromSex: 'FEMALE',
    description: 'is the aunt of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'NEPHEW',
    label: 'Nephew',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'NIECE_NEPHEW',
    isBiological: true,
    generationDiff: -1,
    fromSex: 'MALE',
    description: 'is the nephew of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'NIECE',
    label: 'Niece',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'NIECE_NEPHEW',
    isBiological: true,
    generationDiff: -1,
    fromSex: 'FEMALE',
    description: 'is the niece of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'MALE_COUSIN',
    label: 'Male Cousin',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'COUSIN',
    isBiological: true,
    generationDiff: 0,
    fromSex: 'MALE',
    description: 'is the male cousin of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'FEMALE_COUSIN',
    label: 'Female Cousin',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'COUSIN',
    isBiological: true,
    generationDiff: 0,
    fromSex: 'FEMALE',
    description: 'is the female cousin of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },
  {
    code: 'COUSIN',
    label: 'Cousin',
    group: RELATIONSHIP_GROUPS.EXTENDED,
    baseType: 'COUSIN',
    isBiological: true,
    generationDiff: 0,
    description: 'is the cousin of',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200'
  },

  // --- Step Family ---
  {
    code: 'HALF_BROTHER',
    label: 'Half-Brother',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: 'MALE',
    description: 'is the half-brother of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'HALF_SISTER',
    label: 'Half-Sister',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    fromSex: 'FEMALE',
    description: 'is the half-sister of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'HALF_SIBLING',
    label: 'Half-Sibling',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'SIBLING',
    isBiological: true,
    generationDiff: 0,
    description: 'is the half-sibling of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_FATHER',
    label: 'Step-Father',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: 'MALE',
    description: 'is the step-father of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_MOTHER',
    label: 'Step-Mother',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: 'FEMALE',
    description: 'is the step-mother of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_PARENT',
    label: 'Step-Parent',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_PARENT',
    isBiological: false,
    generationDiff: 1,
    description: 'is the step-parent of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_BROTHER',
    label: 'Step-Brother',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_SIBLING',
    isBiological: false,
    generationDiff: 0,
    fromSex: 'MALE',
    description: 'is the step-brother of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_SISTER',
    label: 'Step-Sister',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_SIBLING',
    isBiological: false,
    generationDiff: 0,
    fromSex: 'FEMALE',
    description: 'is the step-sister of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_SIBLING',
    label: 'Step-Sibling',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_SIBLING',
    isBiological: false,
    generationDiff: 0,
    description: 'is the step-sibling of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_SON',
    label: 'Step-Son',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: 'MALE',
    description: 'is the step-son of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_DAUGHTER',
    label: 'Step-Daughter',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: 'FEMALE',
    description: 'is the step-daughter of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    code: 'STEP_CHILD',
    label: 'Step-Child',
    group: RELATIONSHIP_GROUPS.STEP,
    baseType: 'STEP_CHILD',
    isBiological: false,
    generationDiff: -1,
    description: 'is the step-child of',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200'
  },

  // --- Adoptive Family ---
  {
    code: 'ADOPTIVE_FATHER',
    label: 'Adoptive Father',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTIVE_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: 'MALE',
    description: 'is the adoptive father of',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 'ADOPTIVE_MOTHER',
    label: 'Adoptive Mother',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTIVE_PARENT',
    isBiological: false,
    generationDiff: 1,
    fromSex: 'FEMALE',
    description: 'is the adoptive mother of',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 'ADOPTIVE_PARENT',
    label: 'Adoptive Parent',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTIVE_PARENT',
    isBiological: false,
    generationDiff: 1,
    description: 'is the adoptive parent of',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 'ADOPTED_SON',
    label: 'Adopted Son',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTED_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: 'MALE',
    description: 'is the adopted son of',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 'ADOPTED_DAUGHTER',
    label: 'Adopted Daughter',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTED_CHILD',
    isBiological: false,
    generationDiff: -1,
    fromSex: 'FEMALE',
    description: 'is the adopted daughter of',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  {
    code: 'ADOPTED_CHILD',
    label: 'Adopted Child',
    group: RELATIONSHIP_GROUPS.ADOPTIVE,
    baseType: 'ADOPTED_CHILD',
    isBiological: false,
    generationDiff: -1,
    description: 'is the adopted child of',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200'
  },

  // --- Partner Relationships (Legacy / General) ---
  {
    code: 'PARENT_CHILD',
    label: 'Parent of (Biological Child)',
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: 'PARENT_CHILD',
    isBiological: true,
    generationDiff: 1,
    description: 'is the biological parent of',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
];

export const DEFINITIONS_BY_CODE = {};
RELATIONSHIP_DEFINITIONS.forEach(def => {
  DEFINITIONS_BY_CODE[def.code] = def;
});

export function getRelationshipDefinition(type) {
  if (DEFINITIONS_BY_CODE[type]) {
    return DEFINITIONS_BY_CODE[type];
  }
  return {
    code: type,
    label: type,
    group: RELATIONSHIP_GROUPS.IMMEDIATE,
    baseType: type,
    isBiological: true,
    generationDiff: 0,
    description: `is the ${type} of`,
    badgeClass: 'bg-slate-50 text-slate-700 border-slate-200'
  };
}

export function getInverseRelationship(type, fromSex = null, targetSex = null) {
  switch (type) {
    case 'FATHER':
    case 'MOTHER':
    case 'BIOLOGICAL_PARENT':
    case 'PARENT_CHILD':
      if (targetSex === 'MALE') return 'SON';
      if (targetSex === 'FEMALE') return 'DAUGHTER';
      return 'BIOLOGICAL_CHILD';

    case 'SON':
    case 'DAUGHTER':
    case 'BIOLOGICAL_CHILD':
      if (targetSex === 'MALE') return 'FATHER';
      if (targetSex === 'FEMALE') return 'MOTHER';
      return 'BIOLOGICAL_PARENT';

    case 'BROTHER':
    case 'SISTER':
    case 'SIBLING':
      if (targetSex === 'MALE') return 'BROTHER';
      if (targetSex === 'FEMALE') return 'SISTER';
      return 'SIBLING';

    case 'HUSBAND':
      return 'WIFE';
    case 'WIFE':
      return 'HUSBAND';
    case 'SPOUSE':
      return 'SPOUSE';
    case 'PARTNER':
      return 'PARTNER';

    case 'PATERNAL_GRANDFATHER':
    case 'PATERNAL_GRANDMOTHER':
    case 'MATERNAL_GRANDFATHER':
    case 'MATERNAL_GRANDMOTHER':
    case 'GRANDFATHER':
    case 'GRANDMOTHER':
      if (targetSex === 'MALE') return 'GRANDSON';
      if (targetSex === 'FEMALE') return 'GRANDDAUGHTER';
      return 'GRANDCHILD';

    case 'GRANDSON':
    case 'GRANDDAUGHTER':
    case 'GRANDCHILD':
      if (targetSex === 'MALE') return 'GRANDFATHER';
      if (targetSex === 'FEMALE') return 'GRANDMOTHER';
      return 'GRANDPARENT';

    case 'PATERNAL_UNCLE':
    case 'MATERNAL_UNCLE':
    case 'UNCLE':
    case 'PATERNAL_AUNT':
    case 'MATERNAL_AUNT':
    case 'AUNT':
      if (targetSex === 'MALE') return 'NEPHEW';
      if (targetSex === 'FEMALE') return 'NIECE';
      return 'NEPHEW_OR_NIECE';

    case 'NEPHEW':
    case 'NIECE':
      if (targetSex === 'MALE') return 'UNCLE';
      if (targetSex === 'FEMALE') return 'AUNT';
      return 'AUNT_OR_UNCLE';

    case 'MALE_COUSIN':
    case 'FEMALE_COUSIN':
    case 'COUSIN':
      if (targetSex === 'MALE') return 'MALE_COUSIN';
      if (targetSex === 'FEMALE') return 'FEMALE_COUSIN';
      return 'COUSIN';

    case 'HALF_BROTHER':
    case 'HALF_SISTER':
    case 'HALF_SIBLING':
      if (targetSex === 'MALE') return 'HALF_BROTHER';
      if (targetSex === 'FEMALE') return 'HALF_SISTER';
      return 'HALF_SIBLING';

    case 'STEP_FATHER':
    case 'STEP_MOTHER':
    case 'STEP_PARENT':
      if (targetSex === 'MALE') return 'STEP_SON';
      if (targetSex === 'FEMALE') return 'STEP_DAUGHTER';
      return 'STEP_CHILD';

    case 'STEP_SON':
    case 'STEP_DAUGHTER':
    case 'STEP_CHILD':
      if (targetSex === 'MALE') return 'STEP_FATHER';
      if (targetSex === 'FEMALE') return 'STEP_MOTHER';
      return 'STEP_PARENT';

    case 'STEP_BROTHER':
    case 'STEP_SISTER':
    case 'STEP_SIBLING':
      if (targetSex === 'MALE') return 'STEP_BROTHER';
      if (targetSex === 'FEMALE') return 'STEP_SISTER';
      return 'STEP_SIBLING';

    case 'ADOPTIVE_FATHER':
    case 'ADOPTIVE_MOTHER':
    case 'ADOPTIVE_PARENT':
      if (targetSex === 'MALE') return 'ADOPTED_SON';
      if (targetSex === 'FEMALE') return 'ADOPTED_DAUGHTER';
      return 'ADOPTED_CHILD';

    case 'ADOPTED_SON':
    case 'ADOPTED_DAUGHTER':
    case 'ADOPTED_CHILD':
      if (targetSex === 'MALE') return 'ADOPTIVE_FATHER';
      if (targetSex === 'FEMALE') return 'ADOPTIVE_MOTHER';
      return 'ADOPTIVE_PARENT';

    default:
      return type;
  }
}

export function getRelationshipPreviewText(type, fromName = 'Member A', toName = 'Member B') {
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
