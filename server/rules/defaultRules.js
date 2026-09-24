const { RESULT_CATEGORIES, RULE_OPERATORS } = require('../constants');

const defaultRules = [
  {
    ruleCode: 'RULE-AR-01',
    name: 'Dual-Carrier Recessive Inheritance Match',
    description: 'Triggered when both biological reproductive partners are documented carriers or affected by the same autosomal recessive condition.',
    category: 'MENDELIAN_RECESSIVE',
    priority: 100, // Highest priority
    conditions: [
      {
        fact: 'couple_carrier_match',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      severity: 'CRITICAL'
    },
    explanation: 'Both prospective parents have been identified as carriers or affected individuals for the same recessive condition. In autosomal recessive inheritance, each pregnancy carries a 25% (1 in 4) chance of inheriting two pathogenic variants and being clinically affected.',
    guidance: [
      'Expedite formal pre-test and post-test genetic counseling with a certified counselor.',
      'Discuss preconception expanded carrier screening and targeted variant sequencing.',
      'Review reproductive planning options including pre-implantation genetic diagnosis (PGT-M) or prenatal diagnostic procedures (CVS/amniocentesis).'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-AD-01',
    name: 'Multi-Generational Transmission (Autosomal Dominant)',
    description: 'Triggered when a medical condition exhibits vertical transmission across multiple generations or affects a first-degree relative.',
    category: 'MENDELIAN_DOMINANT',
    priority: 90,
    conditions: [
      {
        fact: 'multi_generational_transmission',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      severity: 'HIGH'
    },
    explanation: 'Pedigree analysis demonstrates vertical transmission across successive generations, consistent with an autosomal dominant inheritance pattern. Individuals with an affected first-degree relative may face up to a 50% probability of carrying the dominant allele.',
    guidance: [
      'Comprehensive clinical genetic evaluation is recommended prior to conception.',
      'Obtain confirmatory medical records and genetic pathology documentation for affected relatives.',
      'Discuss age-dependent penetrance, variable expressivity, and targeted germline testing options.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-MULTI-01',
    name: 'Multiple Affected Relatives with Early Onset',
    description: 'Triggered when two or more relatives are affected and at least one condition was diagnosed before age 50.',
    category: 'FAMILIAL_PREDISPOSITION',
    priority: 85,
    conditions: [
      {
        fact: 'multiple_affected_relatives',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      },
      {
        fact: 'early_onset_detected',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      severity: 'HIGH'
    },
    explanation: 'Clustering of conditions within the lineage accompanied by early age-of-onset (<50 years) strongly indicates a possible hereditary predisposition syndrome.',
    guidance: [
      'Specialist genetic risk assessment is strongly advised.',
      'Construct a 3-generation medical pedigree with confirmed histopathology where possible.',
      'Inquire about multi-gene panel testing relevant to the familial conditions present.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-CONS-01',
    name: 'Consanguinity Risk Evaluation',
    description: 'Triggered when reproductive partners share common biological ancestors within recent generations.',
    category: 'CONSANGUINITY',
    priority: 75,
    conditions: [
      {
        fact: 'consanguinity_detected',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'A biological relationship was detected between reproductive partners (consanguinity). Consanguineous partnerships have an increased baseline proportion of shared identical-by-descent alleles, raising the background probability of unmasking rare autosomal recessive traits.',
    guidance: [
      'Recommend preconception high-resolution expanded carrier screening (ECS) for both partners.',
      'Assess extended familial history for rare childhood disorders or unexplained infant losses.',
      'Engage in non-directive preconception counseling to explore carrier risk probabilities.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-FDR-01',
    name: 'First-Degree Relative Affected',
    description: 'Triggered when a parent, full sibling, or child of the proband has a documented genetic or medical condition.',
    category: 'CLOSE_RELATIVE',
    priority: 60,
    conditions: [
      {
        fact: 'first_degree_relative_affected',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'A first-degree relative (parent or sibling) has a recorded clinical condition, sharing approximately 50% of genetic material with the proband.',
    guidance: [
      'Gather specific medical details and exact diagnosis dates regarding the affected relative.',
      'Schedule a preconception consultation to evaluate empiric recurrence risks.',
      'Consider individualized screening or surveillance based on the specific condition.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-CARRIER-01',
    name: 'Proband Carrier Status Identified',
    description: 'Triggered when the proband is a verified genetic carrier for a hereditary condition.',
    category: 'CARRIER_STATUS',
    priority: 55,
    conditions: [
      {
        fact: 'proband_is_carrier',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'The proband has documented carrier status for one or more genetic variants. While carriers are generally asymptomatic, reproductive partner carrier screening is critical to determine transmission risk.',
    guidance: [
      'Partner carrier screening for the same specific condition and gene is strongly indicated.',
      'Review inheritance dynamics (autosomal recessive vs. X-linked carrier implications).',
      'Provide informative carrier educational literature and support resources.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-SDR-01',
    name: 'Second-Degree Relative Affected',
    description: 'Triggered when a grandparent, aunt/uncle, or niece/nephew has a documented condition.',
    category: 'EXTENDED_RELATIVE',
    priority: 40,
    conditions: [
      {
        fact: 'second_degree_relative_affected',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'LOW'
    },
    explanation: 'A second-degree relative (aunt, uncle, grandparent) has a documented condition. Second-degree relatives share approximately 25% of genetic variants.',
    guidance: [
      'Document whether additional relatives on the same lineage share similar symptoms.',
      'Discuss family medical history during regular preconception or obstetric checkups.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-INCOMPLETE-01',
    name: 'Incomplete Pedigree Data',
    description: 'Triggered when essential family lineage or biological parentage is missing from the record.',
    category: 'DATA_QUALITY',
    priority: 30,
    conditions: [
      {
        fact: 'required_family_information_missing',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    result: {
      category: RESULT_CATEGORIES.INSUFFICIENT_INFORMATION,
      severity: 'LOW'
    },
    explanation: 'The recorded pedigree lacks sufficient generational depth (such as missing biological parentage or having fewer than 3 members), limiting the depth of deterministic risk inference.',
    guidance: [
      'Update the pedigree with additional relatives, especially biological parents and siblings.',
      'Obtain family health history across both maternal and paternal branches where feasible.',
      'Re-run the assessment after adding missing generational details.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-LOW-01',
    name: 'Baseline Standard Preconception Profile',
    description: 'Triggered when no significant hereditary risk factors or affected relatives are identified.',
    category: 'BASELINE',
    priority: 10,
    conditions: [
      {
        fact: 'condition_present',
        operator: RULE_OPERATORS.EQUALS,
        value: false
      },
      {
        fact: 'consanguinity_detected',
        operator: RULE_OPERATORS.EQUALS,
        value: false
      }
    ],
    result: {
      category: RESULT_CATEGORIES.INFORMATIONAL,
      severity: 'LOW'
    },
    explanation: 'Based on the family history provided, no high-risk hereditary inheritance patterns, consanguinity, or multi-generational conditions were identified.',
    guidance: [
      'Maintain standard preconception health routines (folic acid supplementation, lifestyle optimization).',
      'Follow standard population-level prenatal care and carrier screening guidelines.',
      'Update your family history if new medical diagnoses arise in your relatives.'
    ],
    version: 1,
    isActive: true
  }
];

module.exports = defaultRules;
