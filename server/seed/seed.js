const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const {
  User,
  Family,
  FamilyMember,
  Relationship,
  Condition,
  FamilyMemberCondition,
  Rule,
  CounselorAssignment,
  CounselorNote,
  AuditLog
} = require('../models');
const { ROLES, RELATIONSHIP_TYPES, SEX_TYPES, CASE_STATUSES } = require('../constants');
const defaultRules = require('../rules/defaultRules');
const { executeAssessment } = require('../services/assessmentService');

async function seedData() {
  console.log('[Seed] Starting database population...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Family.deleteMany({}),
    FamilyMember.deleteMany({}),
    Relationship.deleteMany({}),
    Condition.deleteMany({}),
    FamilyMemberCondition.deleteMany({}),
    Rule.deleteMany({}),
    CounselorAssignment.deleteMany({}),
    CounselorNote.deleteMany({}),
    AuditLog.deleteMany({})
  ]);

  console.log('[Seed] Cleared existing records.');

  // 1. Create Default Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const counselorPasswordHash = await bcrypt.hash('Counselor@123', salt);
  const userPasswordHash = await bcrypt.hash('User@123', salt);

  const admin = await User.create({
    name: 'System Administrator',
    email: 'admin@pedigree.local',
    passwordHash: adminPasswordHash,
    role: ROLES.ADMIN,
    isActive: true
  });

  const counselor = await User.create({
    name: 'Dr. Sarah Chen, MS, CGC',
    email: 'counselor@pedigree.local',
    passwordHash: counselorPasswordHash,
    role: ROLES.COUNSELOR,
    isActive: true
  });

  const demoUser = await User.create({
    name: 'Alex Morgan',
    email: 'user@pedigree.local',
    passwordHash: userPasswordHash,
    role: ROLES.USER,
    isActive: true
  });

  console.log('[Seed] Created default users:');
  console.log('  - Admin: admin@pedigree.local / Admin@123');
  console.log('  - Counselor: counselor@pedigree.local / Counselor@123');
  console.log('  - User: user@pedigree.local / User@123');

  // 2. Populate Genetic Conditions Catalog
  const conditionsData = [
    {
      name: 'Cystic Fibrosis',
      code: 'CF-CFTR',
      description: 'Progressive genetic disorder affecting CFTR channel, causing thick mucus buildup in lungs and digestive tract.',
      category: 'AUTOSOMAL_RECESSIVE'
    },
    {
      name: 'Sickle Cell Anemia',
      code: 'SCD-HBB',
      description: 'Hemoglobin disorder resulting in crescent-shaped red blood cells, chronic anemia, and vascular occlusion.',
      category: 'AUTOSOMAL_RECESSIVE'
    },
    {
      name: 'Huntington Disease',
      code: 'HD-HTT',
      description: 'Neurodegenerative disorder caused by CAG trinucleotide repeat expansion in the HTT gene.',
      category: 'AUTOSOMAL_DOMINANT'
    },
    {
      name: 'Hereditary Breast & Ovarian Cancer',
      code: 'HBOC-BRCA1',
      description: 'Cancer predisposition syndrome linked to pathogenic germline variants in the BRCA1 tumor suppressor gene.',
      category: 'AUTOSOMAL_DOMINANT'
    },
    {
      name: 'Hemophilia A',
      code: 'HEMA-F8',
      description: 'X-linked recessive bleeding disorder resulting in deficiency of blood coagulation Factor VIII.',
      category: 'X_LINKED'
    },
    {
      name: 'Tay-Sachs Disease',
      code: 'TSD-HEXA',
      description: 'Severe neurodegenerative lysosomal storage disorder caused by hexosaminidase A enzyme deficiency.',
      category: 'AUTOSOMAL_RECESSIVE'
    },
    {
      name: 'Familial Hypercholesterolemia',
      code: 'FH-LDLR',
      description: 'Severe genetic elevation of LDL cholesterol with accelerated premature cardiovascular disease.',
      category: 'AUTOSOMAL_DOMINANT'
    }
  ];

  const conditions = await Condition.insertMany(conditionsData);
  console.log(`[Seed] Populated ${conditions.length} conditions in catalogue.`);

  // Map for easy condition lookup
  const condMap = {};
  conditions.forEach(c => {
    condMap[c.code] = c._id;
  });

  // 3. Populate Default Expert Rules
  const rulesToInsert = defaultRules.map(r => ({
    ...r,
    createdBy: admin._id
  }));
  const rules = await Rule.insertMany(rulesToInsert);
  console.log(`[Seed] Populated ${rules.length} expert system decision rules.`);

  // 4. Create Demo Family: "Morgan Family Case"
  const family = await Family.create({
    ownerId: demoUser._id,
    name: 'Morgan Preconception Assessment',
    description: '3-generation family case exploring preconception risks with maternal cancer history.',
    status: 'ACTIVE'
  });

  // 5. Populate Members
  const mPaternalGF = await FamilyMember.create({
    familyId: family._id,
    name: 'Arthur Morgan',
    sex: SEX_TYPES.MALE,
    dateOfBirth: new Date('1945-03-12'),
    deceased: true,
    isProband: false,
    notes: 'Paternal Grandfather. Passed away from natural causes at 78.'
  });

  const mPaternalGM = await FamilyMember.create({
    familyId: family._id,
    name: 'Eleanor Morgan',
    sex: SEX_TYPES.FEMALE,
    dateOfBirth: new Date('1948-07-22'),
    deceased: false,
    isProband: false,
    notes: 'Paternal Grandmother. Good general health.'
  });

  const mMaternalGF = await FamilyMember.create({
    familyId: family._id,
    name: 'Charles Davis',
    sex: SEX_TYPES.MALE,
    dateOfBirth: new Date('1946-11-05'),
    deceased: false,
    isProband: false,
    notes: 'Maternal Grandfather.'
  });

  const mMaternalGM = await FamilyMember.create({
    familyId: family._id,
    name: 'Margaret Davis',
    sex: SEX_TYPES.FEMALE,
    dateOfBirth: new Date('1949-01-18'),
    deceased: true,
    isProband: false,
    notes: 'Maternal Grandmother. Early onset breast cancer diagnosed at age 44.'
  });

  const mFather = await FamilyMember.create({
    familyId: family._id,
    name: 'Robert Morgan',
    sex: SEX_TYPES.MALE,
    dateOfBirth: new Date('1972-04-10'),
    deceased: false,
    isProband: false,
    notes: 'Father.'
  });

  const mMother = await FamilyMember.create({
    familyId: family._id,
    name: 'Catherine Davis Morgan',
    sex: SEX_TYPES.FEMALE,
    dateOfBirth: new Date('1974-09-15'),
    deceased: false,
    isProband: false,
    notes: 'Mother. Breast cancer diagnosed at age 48.'
  });

  const mMaternalAunt = await FamilyMember.create({
    familyId: family._id,
    name: 'Diane Davis',
    sex: SEX_TYPES.FEMALE,
    dateOfBirth: new Date('1977-06-30'),
    deceased: false,
    isProband: false,
    notes: 'Maternal Aunt.'
  });

  const mProband = await FamilyMember.create({
    familyId: family._id,
    name: 'Alex Morgan',
    sex: SEX_TYPES.FEMALE,
    dateOfBirth: new Date('1998-05-14'),
    deceased: false,
    isProband: true,
    notes: 'Consulting Proband. Seeking preconception guidance.'
  });

  const mPartner = await FamilyMember.create({
    familyId: family._id,
    name: 'Jordan Taylor',
    sex: SEX_TYPES.MALE,
    dateOfBirth: new Date('1996-08-20'),
    deceased: false,
    isProband: false,
    notes: 'Reproductive Partner.'
  });

  const mBrother = await FamilyMember.create({
    familyId: family._id,
    name: 'Daniel Morgan',
    sex: SEX_TYPES.MALE,
    dateOfBirth: new Date('2001-12-03'),
    deceased: false,
    isProband: false,
    notes: 'Full sibling.'
  });

  console.log('[Seed] Created 10 family members spanning 3 generations.');

  // 6. Define Biological & Partner Relationships
  const rels = [
    // Paternal Grandparents
    { fromMemberId: mPaternalGF._id, toMemberId: mPaternalGM._id, type: RELATIONSHIP_TYPES.SPOUSE },
    { fromMemberId: mPaternalGF._id, toMemberId: mFather._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mPaternalGM._id, toMemberId: mFather._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },

    // Maternal Grandparents
    { fromMemberId: mMaternalGF._id, toMemberId: mMaternalGM._id, type: RELATIONSHIP_TYPES.SPOUSE },
    { fromMemberId: mMaternalGF._id, toMemberId: mMother._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mMaternalGM._id, toMemberId: mMother._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mMaternalGF._id, toMemberId: mMaternalAunt._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mMaternalGM._id, toMemberId: mMaternalAunt._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },

    // Parents
    { fromMemberId: mFather._id, toMemberId: mMother._id, type: RELATIONSHIP_TYPES.SPOUSE },
    { fromMemberId: mFather._id, toMemberId: mProband._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mMother._id, toMemberId: mProband._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mFather._id, toMemberId: mBrother._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },
    { fromMemberId: mMother._id, toMemberId: mBrother._id, type: RELATIONSHIP_TYPES.PARENT_CHILD },

    // Proband & Partner
    { fromMemberId: mProband._id, toMemberId: mPartner._id, type: RELATIONSHIP_TYPES.PARTNER }
  ];

  for (const r of rels) {
    await Relationship.create({
      familyId: family._id,
      ...r
    });
  }
  console.log(`[Seed] Created ${rels.length} family relationships.`);

  // 7. Associate Conditions to Members
  // Margaret Davis: HBOC Affected age 44
  await FamilyMemberCondition.create({
    familyId: family._id,
    memberId: mMaternalGM._id,
    conditionId: condMap['HBOC-BRCA1'],
    status: 'AFFECTED',
    ageAtOnset: 44,
    notes: 'Histopathology verified invasive ductal carcinoma.'
  });

  // Catherine Davis Morgan: HBOC Affected age 48
  await FamilyMemberCondition.create({
    familyId: family._id,
    memberId: mMother._id,
    conditionId: condMap['HBOC-BRCA1'],
    status: 'AFFECTED',
    ageAtOnset: 48,
    notes: 'BRCA1 pathogenic variant c.68_69delAG confirmed.'
  });

  // Alex Morgan (Proband): HBOC Carrier
  await FamilyMemberCondition.create({
    familyId: family._id,
    memberId: mProband._id,
    conditionId: condMap['HBOC-BRCA1'],
    status: 'CARRIER',
    notes: 'Genetic testing confirmed transmission of maternal BRCA1 variant.'
  });

  // Jordan Taylor (Partner): Cystic Fibrosis Carrier
  await FamilyMemberCondition.create({
    familyId: family._id,
    memberId: mPartner._id,
    conditionId: condMap['CF-CFTR'],
    status: 'CARRIER',
    notes: 'Identified as carrier for delta F508 variant during ECS.'
  });

  console.log('[Seed] Created family condition linkages.');

  // 8. Run Genuine Assessment via Rule Engine
  console.log('[Seed] Executing expert system assessment...');
  const assessment = await executeAssessment(family._id, demoUser._id);
  console.log(`[Seed] Assessment generated! Category: ${assessment.resultCategory}, Rules fired: ${assessment.triggeredRules.length}`);

  // 9. Assign Case to Genetic Counselor and add initial note
  await CounselorAssignment.create({
    familyId: family._id,
    counselorId: counselor._id,
    assignedBy: admin._id,
    status: CASE_STATUSES.IN_REVIEW
  });

  await CounselorNote.create({
    familyId: family._id,
    counselorId: counselor._id,
    assessmentId: assessment._id,
    note: 'Initial review of 3-generation pedigree shows clear vertical transmission of hereditary breast/ovarian cancer in maternal lineage with documented onset under age 50. Proband is confirmed BRCA1 carrier.',
    recommendation: 'Prioritize discussion of reproductive decision-making (PGT-M eligibility, ovarian cancer risk-reducing timelines, and screening recommendations). Inquire regarding expanded carrier screening for Alex to rule out dual-carrier risk with Jordan regarding Cystic Fibrosis.'
  });

  console.log('[Seed] Assigned case to Dr. Sarah Chen and created clinical notes.');
  console.log('[Seed] Database seeding completed successfully!');

  await disconnectDB();
}

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('[Seed] Error during seeding:', err);
      process.exit(1);
    });
}

module.exports = { seedData };
