const { RESULT_CATEGORIES, RULE_OPERATORS } = require('../constants');

const defaultRules = [
  // --- High-Severity Clinical Indicator Rules ---
  {
    ruleCode: 'RULE-AR-01',
    name: 'Dual-Carrier Recessive Inheritance Match',
    description: 'Triggered when both biological reproductive partners are documented carriers or affected by the same autosomal recessive condition.',
    category: 'MENDELIAN_RECESSIVE',
    priority: 100,
    conditions: [
      {
        fact: 'couple_carrier_match',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'dual_carrier_recessive_risk',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.COUNSELOR_REVIEW,
      severity: 'CRITICAL'
    },
    explanation: 'Both prospective parents have been identified as carriers or affected individuals for the same recessive condition. In autosomal recessive inheritance, each pregnancy carries a 25% (1 in 4) chance of inheriting two pathogenic variants and being clinically affected.',
    guidance: [
      'Expedite formal pre-test and post-test genetic counseling with a certified counselor.',
      'Discuss preconception expanded carrier screening and targeted variant sequencing.',
      'Review reproductive planning options including pre-implantation genetic diagnosis (PGT-M) or prenatal diagnostic procedures.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-AD-01',
    name: 'Multi-Generational Transmission (Autosomal Dominant)',
    description: 'Triggered when a medical condition exhibits vertical transmission across multiple generations or affects a first-degree relative.',
    category: 'MENDELIAN_DOMINANT',
    priority: 95,
    conditions: [
      {
        fact: 'multi_generational_transmission',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'autosomal_dominant_pattern',
      value: true
    },
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
    priority: 90,
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
    conclusion: {
      fact: 'early_onset_clustering',
      value: true
    },
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
    priority: 80,
    conditions: [
      {
        fact: 'consanguinity_detected',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'consanguinity_risk_flag',
      value: true
    },
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

  // --- Educational / Demonstrative Rules (R01 - R09) ---
  {
    ruleCode: 'R08',
    name: 'Review Recommendation',
    description: 'Synthesizes multi-generational or clustered family health patterns to recommend professional review.',
    category: 'CLINICAL_TRIAGE',
    priority: 75,
    conditions: [
      {
        fact: 'review_indicator',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'professional_review_recommended',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'The entered family history contains rule-based indicators that warrant discussion with a qualified healthcare professional or genetic counselor.',
    guidance: [
      'Consider discussing your family history with a qualified healthcare professional or genetic counselor.',
      'Bring documented ages of onset and medical records of affected relatives to your clinical consultation.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R04',
    name: 'Multi-Generational Pattern',
    description: 'Derives a review indicator when multiple affected members occur across two or more generations.',
    category: 'PATTERN_RECOGNITION',
    priority: 70,
    conditions: [
      {
        fact: 'multiple_affected_members',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      },
      {
        fact: 'multi_generational_pattern',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'review_indicator',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'Multiple affected relatives were recorded across more than one generation, indicating vertical familial clustering.',
    guidance: [
      'Review whether specific conditions appear consistently on either the maternal or paternal branch.',
      'Explore professional pedigree evaluation with a clinical geneticist.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-CARRIER-01',
    name: 'Proband Carrier Status Identified',
    description: 'Triggered when the proband is a verified genetic carrier for a hereditary condition.',
    category: 'CARRIER_STATUS',
    priority: 65,
    conditions: [
      {
        fact: 'proband_is_carrier',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'carrier_counseling_indicated',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'The proband has documented carrier status for one or more genetic variants. While carriers are generally asymptomatic, reproductive partner carrier screening is critical to determine transmission risk.',
    guidance: [
      'Partner carrier screening for the same specific condition and gene is strongly indicated.',
      'Review inheritance dynamics (autosomal recessive vs. X-linked carrier implications).'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R07',
    name: 'Multiple Family Relationships',
    description: 'Identifies when affected relatives span two or more relationship categories.',
    category: 'RELATIONSHIP_CLUSTERING',
    priority: 60,
    conditions: [
      {
        fact: 'relationship_categories_count',
        operator: RULE_OPERATORS.GREATER_OR_EQUAL,
        value: 2
      }
    ],
    conclusion: {
      fact: 'broader_family_history',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'LOW'
    },
    explanation: 'Affected relatives are present in more than one relationship category (e.g. parents, siblings, or extended relatives).',
    guidance: [
      'Document additional family members across both maternal and paternal sides to clarify inheritance.',
      'Keep records of specific clinical diagnoses and test reports.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R06',
    name: 'Affected Sibling',
    description: 'Identifies when a full or half sibling of the proband has a recorded medical condition.',
    category: 'FIRST_DEGREE',
    priority: 55,
    conditions: [
      {
        fact: 'affected_sibling',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'sibling_history_present',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'A condition was recorded for a sibling in the family history, sharing approximately 50% of genetic background.',
    guidance: [
      'Request detailed genetic or clinical diagnostic reports for the affected sibling if available.',
      'Discuss recurrence probabilities during your preconception consultation.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R05',
    name: 'Affected Parent',
    description: 'Identifies when a biological parent of the proband has a recorded medical condition.',
    category: 'FIRST_DEGREE',
    priority: 50,
    conditions: [
      {
        fact: 'affected_parent',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      }
    ],
    conclusion: {
      fact: 'parent_history_present',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'MODERATE'
    },
    explanation: 'A condition was recorded for a parent in the family history, representing first-degree vertical inheritance.',
    guidance: [
      'Clarify age of diagnosis and specific clinical manifestations in the affected parent.',
      'Consider targeted carrier or predisposition testing where clinically indicated.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R03',
    name: 'Multiple Generations',
    description: 'Identifies when a condition has been documented in relatives across two or more distinct generations.',
    category: 'GENERATIONAL_SPAN',
    priority: 45,
    conditions: [
      {
        fact: 'affected_generations',
        operator: RULE_OPERATORS.GREATER_OR_EQUAL,
        value: 2
      }
    ],
    conclusion: {
      fact: 'multi_generational_pattern',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'LOW'
    },
    explanation: 'The condition has been recorded in more than one generation of the family.',
    guidance: [
      'Compile multi-generational records to help your healthcare provider analyze generational transmission patterns.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R02',
    name: 'Multiple Affected Members',
    description: 'Identifies when two or more family members have a recorded condition.',
    category: 'AFFECTED_COUNT',
    priority: 40,
    conditions: [
      {
        fact: 'affected_members',
        operator: RULE_OPERATORS.GREATER_OR_EQUAL,
        value: 2
      }
    ],
    conclusion: {
      fact: 'multiple_affected_members',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.REVIEW_RECOMMENDED,
      severity: 'LOW'
    },
    explanation: 'More than one family member has been recorded with a health condition.',
    guidance: [
      'Document whether affected relatives share the same diagnosis or related symptoms.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R01',
    name: 'Family History Present',
    description: 'Identifies when at least one family member has a recorded medical condition.',
    category: 'BASELINE_RECORD',
    priority: 35,
    conditions: [
      {
        fact: 'affected_members',
        operator: RULE_OPERATORS.GREATER_OR_EQUAL,
        value: 1
      }
    ],
    conclusion: {
      fact: 'family_history_present',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.INFORMATIONAL,
      severity: 'LOW'
    },
    explanation: 'A health condition was reported in the recorded family history.',
    guidance: [
      'Continue documenting health details for other relatives to provide a comprehensive picture.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'R09',
    name: 'Insufficient Information',
    description: 'Identifies when limited recorded family history prevents a detailed assessment.',
    category: 'DATA_QUALITY',
    priority: 25,
    conditions: [
      {
        fact: 'required_family_information_missing',
        operator: RULE_OPERATORS.EQUALS,
        value: true
      },
      {
        fact: 'condition_present',
        operator: RULE_OPERATORS.EQUALS,
        value: false
      }
    ],
    conclusion: {
      fact: 'insufficient_information_flag',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.INSUFFICIENT_INFORMATION,
      severity: 'LOW'
    },
    explanation: 'There is not enough recorded family information for a meaningful rule-based assessment. Essential generational details or biological relatives may be missing.',
    guidance: [
      'Add biological parents, siblings, and partner information to build a complete family history.',
      'Re-run the assessment once additional family details are entered.'
    ],
    version: 1,
    isActive: true
  },
  {
    ruleCode: 'RULE-LOW-01',
    name: 'Baseline Standard Preconception Profile',
    description: 'Identifies when no hereditary risk indicators or affected relatives are documented in a complete family record.',
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
      },
      {
        fact: 'required_family_information_missing',
        operator: RULE_OPERATORS.EQUALS,
        value: false
      }
    ],
    conclusion: {
      fact: 'baseline_standard_risk',
      value: true
    },
    result: {
      category: RESULT_CATEGORIES.INFORMATIONAL,
      severity: 'LOW'
    },
    explanation: 'Based on the family history provided, no high-risk hereditary inheritance patterns, consanguinity, or multi-generational conditions were identified.',
    guidance: [
      'Maintain standard preconception health routines (e.g. folic acid supplementation, lifestyle optimization).',
      'Follow standard population-level prenatal care and carrier screening recommendations.',
      'Update your family history if new medical diagnoses arise in your relatives.'
    ],
    version: 1,
    isActive: true
  }
];

module.exports = defaultRules;
