/**
 * GeneTrace AIES Synthetic Demonstration Cases
 * Curated clinical pedigrees for educational demonstrations, testing, and faculty evaluations.
 */

const { RESULT_CATEGORIES } = require('../constants');

const SYNTHETIC_DEMO_CASES = [
  {
    id: 'case-recessive-consanguinity',
    title: 'Autosomal Recessive Carrier Match & Consanguinity',
    badge: 'Autosomal Recessive / Consanguinity',
    clinicalDescription:
      'Proband and partner are 2nd cousins with confirmed Cystic Fibrosis (CFTR) carrier status. An affected sibling is also recorded in the family history.',
    aiesFocus:
      'Multi-premise rule evaluation, consanguinity detection, carrier match deduction, and high-severity conflict resolution dominance.',
    expectedOutcome: {
      resultCategory: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      winningRuleCode: 'RULE-AR-01',
      dominantPattern: 'Autosomal Recessive Dual-Carrier Transmission (25% recurrence risk)'
    },
    facts: {
      total_members: 6,
      affected_members: 1,
      carrier_members: 2,
      condition_present: true,
      affected_parent: false,
      affected_child: false,
      affected_sibling: true,
      parent_history_present: true,
      biological_parent_count: 2,
      relationship_categories_count: 3,
      consanguinity_detected: true,
      couple_carrier_match: true,
      recessive_carrier_detected: true,
      proband_carrier_status: true,
      multi_generational_transmission: false,
      multi_generational_pattern: false,
      multiple_affected_members: false,
      multiple_affected_relatives: false,
      early_onset_detected: false,
      maternal_age_over_35: false,
      paternal_age_over_40: false,
      advanced_maternal_age: false,
      advanced_paternal_age: false,
      recurrent_pregnancy_loss: false,
      required_family_information_missing: false
    },
    sampleFamily: {
      familyName: 'Al-Mansoor Pedigree (Consanguineous / CFTR)',
      probandName: 'Tariq Al-Mansoor',
      partnerName: 'Layla Al-Mansoor',
      membersSummary: [
        'Proband: Tariq (Male, 29, CFTR Pathogenic Variant Carrier)',
        'Partner: Layla (Female, 27, CFTR Pathogenic Variant Carrier, 2nd Cousin)',
        'Brother: Zayd (Male, 24, Clinically Affected with Cystic Fibrosis)',
        'Father & Mother: Asymptomatic Obligate Carriers'
      ]
    }
  },
  {
    id: 'case-dominant-huntington',
    title: 'Multi-Generational Huntington\'s Disease (Autosomal Dominant)',
    badge: 'Autosomal Dominant / Vertical Transmission',
    clinicalDescription:
      'Proband seeks preconception assessment. Proband\'s father and paternal grandmother were both diagnosed with Huntington\'s Disease (HTT) with onset prior to age 50.',
    aiesFocus:
      'Vertical transmission pattern recognition across 3 generations, early-onset clustering deduction, multi-pass forward chaining (R04 -> R08), and backward chaining goal proof.',
    expectedOutcome: {
      resultCategory: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      winningRuleCode: 'RULE-AD-01',
      dominantPattern: 'Autosomal Dominant Multi-Generational Transmission (50% transmission risk per affected parent)'
    },
    facts: {
      total_members: 4,
      affected_members: 2,
      carrier_members: 0,
      condition_present: true,
      affected_parent: true,
      affected_child: false,
      affected_sibling: false,
      first_degree_relative_affected: true,
      second_degree_relative_affected: true,
      parent_history_present: true,
      biological_parent_count: 2,
      relationship_categories_count: 2,
      consanguinity_detected: false,
      couple_carrier_match: false,
      recessive_carrier_detected: false,
      proband_carrier_status: false,
      multi_generational_transmission: true,
      multi_generational_pattern: true,
      multiple_affected_members: true,
      multiple_affected_relatives: true,
      early_onset_detected: true,
      maternal_age_over_35: false,
      paternal_age_over_40: false,
      advanced_maternal_age: false,
      advanced_paternal_age: false,
      recurrent_pregnancy_loss: false,
      required_family_information_missing: false
    },
    sampleFamily: {
      familyName: 'Montgomery Lineage (Huntington\'s Disease)',
      probandName: 'Claire Montgomery',
      partnerName: 'David Montgomery',
      membersSummary: [
        'Proband: Claire (Female, 31, Currently Asymptomatic)',
        'Father: Arthur (Male, 58, Affected Huntington\'s, Onset 44)',
        'Paternal Grandmother: Eleanor (Female, Deceased 62, Affected Huntington\'s, Onset 46)',
        'Brother: Lucas (Male, 28, Asymptomatic)'
      ]
    }
  },
  {
    id: 'case-parental-age-aneuploidy',
    title: 'Advanced Parental Age & Recurrent Pregnancy Loss',
    badge: 'Parental Age / Chromosomal Risk',
    clinicalDescription:
      'Maternal age 39 and paternal age 44 with an obstetric history of 2 consecutive unexplained first-trimester pregnancy losses. No Mendelian single-gene disorders reported.',
    aiesFocus:
      'Quantitative numeric threshold rules (GREATER_THAN), non-Mendelian aneuploidy risk derivation, and synthesis of non-directive reproductive screening guidance.',
    expectedOutcome: {
      resultCategory: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      winningRuleCode: 'RULE-RPL-01',
      dominantPattern: 'Advanced Parental Age / Elevated Baseline Chromosomal Non-Disjunction Risk'
    },
    facts: {
      total_members: 2,
      affected_members: 0,
      carrier_members: 0,
      condition_present: false,
      affected_parent: false,
      affected_child: false,
      affected_sibling: false,
      parent_history_present: false,
      biological_parent_count: 0,
      relationship_categories_count: 1,
      consanguinity_detected: false,
      couple_carrier_match: false,
      recessive_carrier_detected: false,
      proband_carrier_status: false,
      multi_generational_transmission: false,
      multi_generational_pattern: false,
      multiple_affected_members: false,
      multiple_affected_relatives: false,
      early_onset_detected: false,
      maternal_age_over_35: true,
      paternal_age_over_40: true,
      advanced_maternal_age: true,
      advanced_paternal_age: true,
      recurrent_pregnancy_loss: true,
      required_family_information_missing: false
    },
    sampleFamily: {
      familyName: 'Sterling Family (Advanced Parental Age)',
      probandName: 'Elena Sterling',
      partnerName: 'Marcus Sterling',
      membersSummary: [
        'Proband / Prospective Mother: Elena (Female, Age 39)',
        'Partner / Prospective Father: Marcus (Male, Age 44)',
        'Obstetric History: 2 Prior First-Trimester Unexplained Miscarriages'
      ]
    }
  },
  {
    id: 'case-incomplete-lineage',
    title: 'Ambiguous / Incomplete Family Lineage (Uncertainty Handling)',
    badge: 'Uncertainty / Knowledge Boundary',
    clinicalDescription:
      'Proband was adopted in infancy with zero biological parental health records. No medical conditions are known. Demonstrates knowledge-boundary reasoning.',
    aiesFocus:
      'Open-world assumption demonstration: absence of reported disease must NOT be mistaken for low genetic risk. System flags INSUFFICIENT_INFORMATION.',
    expectedOutcome: {
      resultCategory: RESULT_CATEGORIES.INSUFFICIENT_INFORMATION,
      winningRuleCode: 'R09',
      dominantPattern: 'Uncertainty Handling — Incomplete Biological Records Flagged'
    },
    facts: {
      total_members: 1,
      affected_members: 0,
      carrier_members: 0,
      condition_present: false,
      affected_parent: false,
      affected_child: false,
      affected_sibling: false,
      parent_history_present: false,
      biological_parent_count: 0,
      relationship_categories_count: 0,
      consanguinity_detected: false,
      couple_carrier_match: false,
      recessive_carrier_detected: false,
      proband_carrier_status: false,
      multi_generational_transmission: false,
      multi_generational_pattern: false,
      multiple_affected_members: false,
      multiple_affected_relatives: false,
      early_onset_detected: false,
      maternal_age_over_35: false,
      paternal_age_over_40: false,
      advanced_maternal_age: false,
      advanced_paternal_age: false,
      recurrent_pregnancy_loss: false,
      required_family_information_missing: true
    },
    sampleFamily: {
      familyName: 'Adopted Proband (Unknown Biological Lineage)',
      probandName: 'Maya Lin',
      partnerName: 'None Documented',
      membersSummary: [
        'Proband: Maya (Female, 26, Adopted, No biological family health records available)',
        'Biological Parents: Unknown / Unrecorded in pedigree'
      ]
    }
  },
  {
    id: 'case-xlinked-hemophilia',
    title: 'X-Linked Recessive Hemophilia Lineage (Criss-Cross Transmission)',
    badge: 'X-Linked Recessive / Criss-Cross Pattern',
    clinicalDescription:
      'Proband (male) seeks preconception genetic assessment. Proband\'s mother is a verified carrier of Hemophilia A (HEMA-F8), inherited from her clinically affected father (maternal grandfather). Demonstrates X-linked inheritance dynamics.',
    aiesFocus:
      'Criss-cross inheritance through unaffected/carrier females, maternal lineage deduction, and sex-specific recurrence risk quantification (50% risk for male offspring).',
    expectedOutcome: {
      resultCategory: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      winningRuleCode: 'RULE-XL-01',
      dominantPattern: 'X-Linked Recessive Inheritance (50% risk in male offspring, 50% carrier risk in female offspring)'
    },
    facts: {
      total_members: 6,
      affected_members: 1,
      carrier_members: 1,
      condition_present: true,
      affected_parent: false,
      affected_child: false,
      affected_sibling: false,
      affected_grandparent: true,
      parent_history_present: true,
      biological_parent_count: 2,
      relationship_categories_count: 2,
      consanguinity_detected: false,
      couple_carrier_match: false,
      recessive_carrier_detected: false,
      proband_carrier_status: false,
      multi_generational_transmission: false,
      multi_generational_pattern: true,
      multiple_affected_members: false,
      multiple_affected_relatives: false,
      early_onset_detected: false,
      maternal_age_over_35: false,
      paternal_age_over_40: false,
      advanced_maternal_age: false,
      advanced_paternal_age: false,
      recurrent_pregnancy_loss: false,
      required_family_information_missing: false,
      x_linked_condition_present: true,
      x_linked_carrier_mother: true,
      x_linked_affected_grandfather: true,
      x_linked_recessive_pattern: true
    },
    sampleFamily: {
      familyName: 'Vance-Hayes Lineage (Hemophilia A)',
      probandName: 'Julian Hayes',
      partnerName: 'Clara Hayes',
      membersSummary: [
        'Proband: Julian (Male, 28, Currently Asymptomatic)',
        'Partner: Clara (Female, 27, Unaffected)',
        'Mother: Laura (Female, 54, Confirmed HEMA-F8 Pathogenic Variant Carrier)',
        'Maternal Grandfather: Edward (Male, Deceased, Clinically Affected with Severe Hemophilia A)',
        'Father & Maternal Grandmother: Clinically Unaffected'
      ]
    }
  }
];

module.exports = {
  SYNTHETIC_DEMO_CASES
};
