# PEDIGREE — Rule Engine Specification

## 1. Purpose
The AIES component must be deterministic, explainable, versioned, configurable and testable.

It is educational decision support, not clinical diagnosis.

## 2. Concepts

### Fact
A normalized statement derived from family data.

Examples:
```text
family_member_exists
condition_present
condition_present_in_parent
condition_present_in_sibling
multiple_affected_relatives
family_history_complete
```

### Rule
```text
IF facts satisfy conditions
THEN produce result + explanation + guidance
```

## 3. Rule Structure

```json
{
  "id": "RULE-001",
  "name": "Example Family History Rule",
  "priority": 10,
  "conditions": [
    {"fact": "family_history_condition", "operator": "EXISTS", "value": true}
  ],
  "result": {"category": "REVIEW_RECOMMENDED"},
  "explanation": "The recorded family information matched this rule.",
  "guidance": ["Consider discussing the family history with a qualified professional."],
  "version": 1,
  "isActive": true
}
```

## 4. Operators
`EQUALS`, `NOT_EQUALS`, `EXISTS`, `NOT_EXISTS`, `GREATER_THAN`, `LESS_THAN`, `GREATER_OR_EQUAL`, `LESS_OR_EQUAL`, `IN`, `CONTAINS`.

## 5. Result Categories
Use project decision-support categories:
- `INFORMATIONAL`
- `REVIEW_RECOMMENDED`
- `COUNSELOR_REVIEW`
- `INSUFFICIENT_INFORMATION`

## 6. Example Rules

### Relevant Family History
```text
IF relevant_condition_in_close_relative = true
THEN REVIEW_RECOMMENDED
```

### Multiple Relevant Relatives
```text
IF count_of_relevant_affected_relatives >= configured_threshold
THEN COUNSELOR_REVIEW
```

### Incomplete Information
```text
IF required_family_information_missing = true
THEN INSUFFICIENT_INFORMATION
```

## 7. Explainability
For each triggered rule store:
- rule ID
- rule name
- rule version
- matching facts
- condition values
- explanation
- guidance

## 8. Versioning
Assessment records must preserve the engine version and rule versions used.

## 9. Safety
Do not diagnose disease, prescribe medicine, claim certainty unsupported by the project data, or replace professional judgment.
