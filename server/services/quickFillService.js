const {
  Family,
  FamilyMember,
  Relationship,
  Condition,
  FamilyMemberCondition,
  Assessment
} = require('../models');
const { ROLES, SEX_TYPES, RELATIONSHIP_TYPES, RESULT_CATEGORIES } = require('../constants');
const { logAudit } = require('../middleware/audit');
const {
  validateRelationship,
  normalizeRelationshipRecord,
  deriveAllRelationships
} = require('../utils/relationshipHelper');

/**
 * Standard Catalog of Conditions used by Synthetic Scenarios
 */
const DEFAULT_CONDITIONS = [
  {
    code: 'CF-CFTR',
    name: 'Cystic Fibrosis',
    description: 'Progressive genetic disorder affecting CFTR channel, causing thick mucus buildup in lungs and digestive tract.',
    category: 'AUTOSOMAL_RECESSIVE'
  },
  {
    code: 'HD-HTT',
    name: 'Huntington Disease',
    description: 'Neurodegenerative disorder caused by CAG trinucleotide repeat expansion in the HTT gene.',
    category: 'AUTOSOMAL_DOMINANT'
  },
  {
    code: 'HBOC-BRCA1',
    name: 'Hereditary Breast & Ovarian Cancer',
    description: 'Cancer predisposition syndrome linked to pathogenic germline variants in the BRCA1 tumor suppressor gene.',
    category: 'AUTOSOMAL_DOMINANT'
  },
  {
    code: 'SCD-HBB',
    name: 'Sickle Cell Anemia',
    description: 'Hemoglobin disorder resulting in crescent-shaped red blood cells, chronic anemia, and vascular occlusion.',
    category: 'AUTOSOMAL_RECESSIVE'
  },
  {
    code: 'HEMA-F8',
    name: 'Hemophilia A',
    description: 'X-linked recessive bleeding disorder resulting in deficiency of blood coagulation Factor VIII.',
    category: 'X_LINKED'
  }
];

/**
 * Curated Clinical Synthetic Scenarios designed specifically for syllabus-aligned AIES demonstrations.
 * All members, relationships, and dates are biologically consistent.
 */
const QUICK_FILL_SCENARIOS = {
  recessive_consanguinity: {
    key: 'recessive_consanguinity',
    title: 'Autosomal Recessive & Consanguinity (Cystic Fibrosis)',
    badge: 'Autosomal Recessive / Consanguinity',
    clinicalDescription:
      'Synthetic demonstration case: Prospective couple are second cousins who are both verified carriers of the CFTR pathogenic variant. Proband\'s sibling is clinically diagnosed with Cystic Fibrosis. Demonstrates multi-premise evaluation, consanguinity cycle tracing, and dual-carrier risk flagging.',
    aiesFocus:
      'Evaluates RULE-AR-01 (Priority 100) and RULE-CONS-01 (Priority 80). Validates consanguinity detection through shared biological ancestors and dual-carrier matching.',
    expectedOutcome: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      winningRule: 'RULE-AR-01',
      severity: 'CRITICAL',
      keyRulesFired: ['RULE-AR-01', 'RULE-CONS-01', 'R06', 'R01']
    },
    members: [
      // Gen I - Shared Ancestors
      {
        key: 'g1_grandfather',
        name: 'Ibrahim Al-Mansoor',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1944-05-10',
        isProband: false,
        deceased: true,
        notes: 'Paternal great-ancestor / common grandfather.'
      },
      {
        key: 'g1_grandmother',
        name: 'Fatima Al-Mansoor',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1947-08-22',
        isProband: false,
        deceased: false,
        notes: 'Common grandmother.'
      },
      // Gen II - Parents & Uncle/Aunt
      {
        key: 'g2_father_proband',
        name: 'Omar Al-Mansoor',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1970-03-15',
        isProband: false,
        deceased: false,
        notes: 'Father of Proband and Brother Zayd. Obligate carrier.'
      },
      {
        key: 'g2_mother_proband',
        name: 'Samira Al-Mansoor',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1972-09-12',
        isProband: false,
        deceased: false,
        notes: 'Mother of Proband and Brother Zayd.'
      },
      {
        key: 'g2_father_partner',
        name: 'Rashid Al-Mansoor',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1973-11-04',
        isProband: false,
        deceased: false,
        notes: 'Brother of Omar; Father of Partner Layla.'
      },
      {
        key: 'g2_mother_partner',
        name: 'Amina Al-Mansoor',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1975-01-20',
        isProband: false,
        deceased: false,
        notes: 'Mother of Partner Layla.'
      },
      // Gen III - Proband, Partner, Sibling
      {
        key: 'g3_proband',
        name: 'Tariq Al-Mansoor',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1996-06-15',
        isProband: true,
        deceased: false,
        notes: 'Index patient (Proband). Asymptomatic carrier for CFTR pathogenic variant.'
      },
      {
        key: 'g3_partner',
        name: 'Layla Al-Mansoor',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1998-04-20',
        isProband: false,
        deceased: false,
        notes: 'Reproductive partner and 2nd cousin. Asymptomatic carrier for CFTR.'
      },
      {
        key: 'g3_brother',
        name: 'Zayd Al-Mansoor',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '2000-10-08',
        isProband: false,
        deceased: false,
        notes: 'Full brother of Proband. Clinically affected with Cystic Fibrosis diagnosed at age 2.'
      }
    ],
    relationships: [
      // Gen I marriage
      { fromKey: 'g1_grandfather', toKey: 'g1_grandmother', type: RELATIONSHIP_TYPES.SPOUSE },
      // Gen I to Gen II children
      { fromKey: 'g1_grandfather', toKey: 'g2_father_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g1_grandmother', toKey: 'g2_father_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g1_grandfather', toKey: 'g2_father_partner', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g1_grandmother', toKey: 'g2_father_partner', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      // Gen II marriages
      { fromKey: 'g2_father_proband', toKey: 'g2_mother_proband', type: RELATIONSHIP_TYPES.SPOUSE },
      { fromKey: 'g2_father_partner', toKey: 'g2_mother_partner', type: RELATIONSHIP_TYPES.SPOUSE },
      // Gen II to Gen III children
      { fromKey: 'g2_father_proband', toKey: 'g3_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_mother_proband', toKey: 'g3_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_father_proband', toKey: 'g3_brother', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_mother_proband', toKey: 'g3_brother', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_father_partner', toKey: 'g3_partner', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_mother_partner', toKey: 'g3_partner', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      // Couple partnership
      { fromKey: 'g3_proband', toKey: 'g3_partner', type: RELATIONSHIP_TYPES.PARTNER }
    ],
    conditions: [
      {
        memberKey: 'g3_proband',
        conditionCode: 'CF-CFTR',
        status: 'CARRIER',
        notes: 'Targeted sequencing confirmed CFTR c.1521_1523delCTT (p.Phe508del) carrier status.'
      },
      {
        memberKey: 'g3_partner',
        conditionCode: 'CF-CFTR',
        status: 'CARRIER',
        notes: 'Expanded carrier screening verified CFTR c.1521_1523delCTT carrier status.'
      },
      {
        memberKey: 'g3_brother',
        conditionCode: 'CF-CFTR',
        status: 'AFFECTED',
        ageAtOnset: 2,
        notes: 'Confirmed clinical diagnosis of Cystic Fibrosis with sweat chloride test >60 mmol/L.'
      }
    ]
  },

  incomplete_lineage: {
    key: 'incomplete_lineage',
    title: 'Incomplete Lineage / Adopted Proband (Uncertainty Handling)',
    badge: 'Uncertainty / Knowledge Boundary',
    clinicalDescription:
      'Synthetic demonstration case: Proband was adopted in infancy with zero documented biological parental records. No genetic conditions are recorded. Demonstrates open-world assumption reasoning where incomplete information prevents false-negative risk calculation.',
    aiesFocus:
      'Evaluates Rule R09 (Insufficient Information, Priority 25). Demonstrates graceful degradation and clinical safety bounds when pedigree information is incomplete.',
    expectedOutcome: {
      category: RESULT_CATEGORIES.INSUFFICIENT_INFORMATION,
      winningRule: 'R09',
      severity: 'LOW',
      keyRulesFired: ['R09']
    },
    members: [
      {
        key: 'proband_adopted',
        name: 'Maya Lin',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1999-11-20',
        isProband: true,
        deceased: false,
        notes: 'Adopted proband. Biological parental and family health records are unrecorded and unknown.'
      }
    ],
    relationships: [],
    conditions: []
  },

  dominant_multirule: {
    key: 'dominant_multirule',
    title: 'Multi-Generational Huntington Lineage & Parental Age (Multi-Rule)',
    badge: 'Autosomal Dominant / Multi-Rule Chaining',
    clinicalDescription:
      'Synthetic demonstration case: 3-generation lineage exhibiting vertical transmission of Huntington Disease across grandmother and father with early onset (<50), combined with advanced maternal age (38) and advanced paternal age (44). Demonstrates multi-pass forward chaining, rule priority resolution, and multi-factorial counseling guidance.',
    aiesFocus:
      'Triggers RULE-AD-01 (Priority 95), RULE-MULTI-01 (Priority 90), RULE-AMA-01 (Priority 72), RULE-APA-01 (Priority 70), R04 (Priority 70), R08 (Priority 75), R05 (Priority 50), and R01 (Priority 35). Demonstrates conflict resolution and multi-pass forward chaining.',
    expectedOutcome: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      winningRule: 'RULE-AD-01',
      severity: 'HIGH',
      keyRulesFired: ['RULE-AD-01', 'RULE-MULTI-01', 'RULE-AMA-01', 'RULE-APA-01', 'R08', 'R04', 'R05', 'R02', 'R01']
    },
    members: [
      // Gen I
      {
        key: 'g1_grandfather',
        name: 'Arthur Sterling Sr.',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1938-04-12',
        isProband: false,
        deceased: true,
        notes: 'Paternal Grandfather. Passed away at 79.'
      },
      {
        key: 'g1_grandmother',
        name: 'Eleanor Sterling',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1941-08-20',
        isProband: false,
        deceased: true,
        notes: 'Paternal Grandmother. Diagnosed with Huntington Disease at age 46.'
      },
      // Gen II
      {
        key: 'g2_father',
        name: 'Arthur Sterling Jr.',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1962-02-18',
        isProband: false,
        deceased: false,
        notes: 'Biological Father. Diagnosed with Huntington Disease at age 44.'
      },
      {
        key: 'g2_mother',
        name: 'Grace Sterling',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1964-07-25',
        isProband: false,
        deceased: false,
        notes: 'Biological Mother.'
      },
      // Gen III
      {
        key: 'g3_proband',
        name: 'Elena Sterling',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1988-03-14', // Age 38 (>= 35 -> Advanced Maternal Age)
        isProband: true,
        deceased: false,
        notes: 'Proband. Age 38. Currently asymptomatic. Seeking preconception risk evaluation.'
      },
      {
        key: 'g3_partner',
        name: 'Marcus Sterling',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1982-05-10', // Age 44 (>= 40 -> Advanced Paternal Age)
        isProband: false,
        deceased: false,
        notes: 'Reproductive Partner. Age 44.'
      },
      {
        key: 'g3_brother',
        name: 'Julian Sterling',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1992-11-03',
        isProband: false,
        deceased: false,
        notes: 'Full sibling. Currently asymptomatic.'
      }
    ],
    relationships: [
      // Gen I
      { fromKey: 'g1_grandfather', toKey: 'g1_grandmother', type: RELATIONSHIP_TYPES.SPOUSE },
      { fromKey: 'g1_grandfather', toKey: 'g2_father', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g1_grandmother', toKey: 'g2_father', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      // Gen II
      { fromKey: 'g2_father', toKey: 'g2_mother', type: RELATIONSHIP_TYPES.SPOUSE },
      { fromKey: 'g2_father', toKey: 'g3_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_mother', toKey: 'g3_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_father', toKey: 'g3_brother', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_mother', toKey: 'g3_brother', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      // Gen III couple
      { fromKey: 'g3_proband', toKey: 'g3_partner', type: RELATIONSHIP_TYPES.PARTNER }
    ],
    conditions: [
      {
        memberKey: 'g1_grandmother',
        conditionCode: 'HD-HTT',
        status: 'AFFECTED',
        ageAtOnset: 46,
        notes: 'CAG trinucleotide repeat expansion confirmed in HTT gene.'
      },
      {
        memberKey: 'g2_father',
        conditionCode: 'HD-HTT',
        status: 'AFFECTED',
        ageAtOnset: 44,
        notes: 'Neurological evaluation confirmed motor onset at age 44 with pathogenic HTT repeat.'
      }
    ]
  },

  x_linked_recessive: {
    key: 'x_linked_recessive',
    title: 'X-Linked Recessive Lineage (Hemophilia A)',
    badge: 'X-Linked Recessive / Criss-Cross Pattern',
    clinicalDescription:
      'Synthetic demonstration case: Maternal grandfather was clinically affected with severe Hemophilia A (HEMA-F8). Biological mother is a confirmed carrier. Proband (male, 28) seeks preconception genetic risk evaluation for offspring.',
    aiesFocus:
      'Evaluates RULE-XL-01 (Priority 92). Demonstrates sex-linked criss-cross inheritance pattern across generations, maternal lineage transmission, and sex-specific recurrence risk deduction (50% for male offspring).',
    expectedOutcome: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      winningRule: 'RULE-XL-01',
      severity: 'HIGH',
      keyRulesFired: ['RULE-XL-01', 'R01']
    },
    members: [
      // Gen I - Maternal Grandparents
      {
        key: 'g1_mat_grandfather',
        name: 'Edward Vance',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1942-06-14',
        isProband: false,
        deceased: true,
        notes: 'Maternal Grandfather. Diagnosed with severe Hemophilia A in childhood.'
      },
      {
        key: 'g1_mat_grandmother',
        name: 'Margaret Vance',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1945-09-28',
        isProband: false,
        deceased: false,
        notes: 'Maternal Grandmother. Unaffected.'
      },
      // Gen II - Parents
      {
        key: 'g2_mother',
        name: 'Laura Vance-Hayes',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1972-04-18',
        isProband: false,
        deceased: false,
        notes: 'Biological Mother. Obligate carrier of HEMA-F8 pathogenic variant inherited from affected father.'
      },
      {
        key: 'g2_father',
        name: 'Robert Hayes',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1970-11-03',
        isProband: false,
        deceased: false,
        notes: 'Biological Father. Unaffected.'
      },
      // Gen III - Proband & Partner
      {
        key: 'g3_proband',
        name: 'Julian Hayes',
        sex: SEX_TYPES.MALE,
        dateOfBirth: '1998-02-15',
        isProband: true,
        deceased: false,
        notes: 'Proband. Male, age 28. Seeks preconception assessment regarding maternal Hemophilia A history.'
      },
      {
        key: 'g3_partner',
        name: 'Clara Hayes',
        sex: SEX_TYPES.FEMALE,
        dateOfBirth: '1999-08-20',
        isProband: false,
        deceased: false,
        notes: 'Reproductive Partner. Age 27.'
      }
    ],
    relationships: [
      // Gen I marriage
      { fromKey: 'g1_mat_grandfather', toKey: 'g1_mat_grandmother', type: RELATIONSHIP_TYPES.SPOUSE },
      // Gen I to Gen II
      { fromKey: 'g1_mat_grandfather', toKey: 'g2_mother', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g1_mat_grandmother', toKey: 'g2_mother', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      // Gen II marriage
      { fromKey: 'g2_father', toKey: 'g2_mother', type: RELATIONSHIP_TYPES.SPOUSE },
      // Gen II to Gen III
      { fromKey: 'g2_father', toKey: 'g3_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      { fromKey: 'g2_mother', toKey: 'g3_proband', type: RELATIONSHIP_TYPES.PARENT_CHILD },
      // Gen III couple
      { fromKey: 'g3_proband', toKey: 'g3_partner', type: RELATIONSHIP_TYPES.PARTNER }
    ],
    conditions: [
      {
        memberKey: 'g1_mat_grandfather',
        conditionCode: 'HEMA-F8',
        status: 'AFFECTED',
        ageAtOnset: 3,
        notes: 'Factor VIII deficiency (<1% coagulant activity). Severe Hemophilia A.'
      },
      {
        memberKey: 'g2_mother',
        conditionCode: 'HEMA-F8',
        status: 'CARRIER',
        notes: 'Confirmed carrier by DNA sequencing of F8 intron 22 inversion.'
      }
    ]
  }
};

/**
 * Returns summaries of all available synthetic demonstration scenarios
 */
function getQuickFillScenarios() {
  return Object.values(QUICK_FILL_SCENARIOS).map(s => ({
    key: s.key,
    title: s.title,
    badge: s.badge,
    clinicalDescription: s.clinicalDescription,
    aiesFocus: s.aiesFocus,
    expectedOutcome: s.expectedOutcome,
    memberCount: s.members.length,
    relationshipCount: s.relationships.length,
    conditionCount: s.conditions.length
  }));
}

/**
 * Ensures required conditions exist in the Condition catalog
 */
async function ensureConditionsCatalog() {
  const condMap = {};
  for (const def of DEFAULT_CONDITIONS) {
    let cond = await Condition.findOne({ code: def.code });
    if (!cond) {
      cond = await Condition.create(def);
    }
    condMap[def.code] = cond._id;
  }
  return condMap;
}

/**
 * Applies a selected synthetic scenario to a specific family case
 * @param {string} familyId
 * @param {string} scenarioKey
 * @param {Object} user - Authenticated user
 */
async function applyQuickFill(familyId, scenarioKey, user) {
  const scenario = QUICK_FILL_SCENARIOS[scenarioKey];
  if (!scenario) {
    throw new Error(`Unknown synthetic scenario key: '${scenarioKey}'. Available: ${Object.keys(QUICK_FILL_SCENARIOS).join(', ')}`);
  }

  const family = await Family.findById(familyId);
  if (!family) {
    throw new Error('Family record not found');
  }

  // Authorization check
  if (user.role === ROLES.USER && family.ownerId.toString() !== user._id.toString()) {
    throw new Error('Forbidden: You do not have permission to modify this family case');
  }

  // Ensure catalog conditions are present
  const condMap = await ensureConditionsCatalog();

  // 1. Clear existing family records safely to prevent duplication
  await Promise.all([
    FamilyMember.deleteMany({ familyId: family._id }),
    Relationship.deleteMany({ familyId: family._id }),
    FamilyMemberCondition.deleteMany({ familyId: family._id }),
    Assessment.deleteMany({ familyId: family._id })
  ]);

  // 2. Insert members
  const memberKeyToId = {};
  const createdMembers = [];

  for (const mDef of scenario.members) {
    const member = await FamilyMember.create({
      familyId: family._id,
      name: mDef.name,
      sex: mDef.sex,
      dateOfBirth: mDef.dateOfBirth ? new Date(mDef.dateOfBirth) : null,
      isProband: Boolean(mDef.isProband),
      deceased: Boolean(mDef.deceased),
      notes: mDef.notes || ''
    });
    memberKeyToId[mDef.key] = member._id;
    createdMembers.push(member);
  }

  // 3. Insert relationships
  const createdRelationships = [];
  for (const rDef of scenario.relationships) {
    const fromMemberId = memberKeyToId[rDef.fromKey];
    const toMemberId = memberKeyToId[rDef.toKey];

    if (!fromMemberId || !toMemberId) {
      continue;
    }

    const fromMember = createdMembers.find(m => m._id.equals(fromMemberId));
    const toMember = createdMembers.find(m => m._id.equals(toMemberId));

    const normalized = normalizeRelationshipRecord(fromMember, toMember, rDef.type);
    const rel = await Relationship.create({
      familyId: family._id,
      fromMemberId: normalized.fromMemberId,
      toMemberId: normalized.toMemberId,
      type: normalized.type,
      metadata: {
        ...(rDef.metadata || {}),
        ...(normalized.metadata || {})
      }
    });
    createdRelationships.push(rel);
  }

  // 4. Insert conditions
  const createdConditions = [];
  for (const cDef of scenario.conditions) {
    const memberId = memberKeyToId[cDef.memberKey];
    const conditionId = condMap[cDef.conditionCode];

    if (!memberId || !conditionId) {
      continue;
    }

    const cond = await FamilyMemberCondition.create({
      familyId: family._id,
      memberId,
      conditionId,
      status: cDef.status || 'AFFECTED',
      ageAtOnset: cDef.ageAtOnset !== undefined ? cDef.ageAtOnset : null,
      notes: cDef.notes || '',
      source: cDef.source || 'CLINICAL_REPORT'
    });
    createdConditions.push(cond);
  }

  // 5. Update family metadata
  family.name = `[Synthetic Demo] ${scenario.title}`;
  family.description = `${scenario.clinicalDescription} [Simulated data for AIES evaluation]`;
  family.status = 'ACTIVE';
  await family.save();

  // 6. Log audit trail
  await logAudit({
    actorId: user._id,
    action: 'FAMILY_QUICK_FILLED',
    entityType: 'Family',
    entityId: family._id,
    metadata: {
      scenarioKey: scenario.key,
      scenarioTitle: scenario.title,
      memberCount: createdMembers.length,
      relationshipCount: createdRelationships.length,
      conditionCount: createdConditions.length
    }
  });

  // 7. Re-fetch populated relationships and conditions
  const populatedRelationships = await Relationship.find({ familyId: family._id }).populate('fromMemberId toMemberId');
  const populatedConditions = await FamilyMemberCondition.find({ familyId: family._id }).populate('conditionId memberId');
  const derived = deriveAllRelationships(createdMembers, populatedRelationships);

  return {
    success: true,
    message: `Synthetic demonstration scenario '${scenario.title}' populated successfully.`,
    scenario: {
      key: scenario.key,
      title: scenario.title,
      badge: scenario.badge,
      clinicalDescription: scenario.clinicalDescription,
      aiesFocus: scenario.aiesFocus,
      expectedOutcome: scenario.expectedOutcome
    },
    family,
    members: createdMembers,
    relationships: populatedRelationships,
    derivedRelationships: derived.derived,
    conditions: populatedConditions
  };
}

/**
 * Resets/clears a family case back to empty state
 */
async function resetFamilyCase(familyId, user) {
  const family = await Family.findById(familyId);
  if (!family) {
    throw new Error('Family record not found');
  }

  if (user.role === ROLES.USER && family.ownerId.toString() !== user._id.toString()) {
    throw new Error('Forbidden: You do not have permission to reset this family case');
  }

  await Promise.all([
    FamilyMember.deleteMany({ familyId: family._id }),
    Relationship.deleteMany({ familyId: family._id }),
    FamilyMemberCondition.deleteMany({ familyId: family._id }),
    Assessment.deleteMany({ familyId: family._id })
  ]);

  family.description = 'Case cleared. Ready for manual entry or synthetic demo scenario.';
  await family.save();

  await logAudit({
    actorId: user._id,
    action: 'FAMILY_RESET',
    entityType: 'Family',
    entityId: family._id
  });

  return {
    success: true,
    message: 'Family case has been successfully reset. All members, relationships, and conditions have been removed.',
    family,
    members: [],
    relationships: [],
    derivedRelationships: [],
    conditions: []
  };
}

module.exports = {
  QUICK_FILL_SCENARIOS,
  getQuickFillScenarios,
  applyQuickFill,
  resetFamilyCase
};
