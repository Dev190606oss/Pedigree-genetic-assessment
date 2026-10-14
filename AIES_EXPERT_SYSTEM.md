# GeneTrace — Artificial Intelligence & Expert Systems (AIES)
## Technical Reference, Syllabus Mapping, Worked Traces & Viva Voce Guide

---

## 1. Executive Summary & Syllabus Alignment

**GeneTrace** is an enterprise-grade preconception genetic assessment platform. Its intelligent reasoning layer is implemented as a **deterministic, explainable rule-based expert system** that models clinical genetic risk without stochastic black-box opacity.

This document serves as the formal technical specification for faculty evaluation, lab demonstrations, and viva voce examinations.

### AIES Syllabus Concepts Mapped to GeneTrace Implementation

| Academic Syllabus Concept | Theoretical Definition | GeneTrace Implementation in Code |
| :--- | :--- | :--- |
| **Knowledge Representation** | Formal encoding of domain expertise into structured data structures. | Standardized IF-THEN Production Rules (`server/models/Rule.js`, `server/rules/defaultRules.js`) with condition predicates, relational operators, conclusions, and guidance templates. |
| **Working Memory** | Dynamic global state holding currently known facts during inference. | Fact dictionary (`initialFacts` + `derivedFacts` in `server/rules/ruleEngine.js`), explicitly partitioned into **Base Lineage Facts** and **Inferred Intermediate Facts**. |
| **Fact Extraction** | Compiling raw domain graph inputs into normalized symbolic predicates. | Graph parser (`server/rules/factBuilder.js`) analyzing 50+ genealogical predicates (biological vs. adoptive, generational levels, consanguinity, affected degree). |
| **Forward Chaining** | Data-driven reasoning proceeding from known facts to derived conclusions. | Multi-pass evaluation loop (`evaluateRules()` in `server/rules/ruleEngine.js`) executing the Match-Resolve-Act cycle until a fixed point is reached. |
| **Multi-Pass Reasoning** | Upstream rules assert new facts that trigger downstream rules in subsequent passes. | Demonstrative 2-stage rule chaining (e.g., `R04` derives `review_indicator` in Pass 1; `R08` consumes it in Pass 2 to deduce `professional_review_recommended`). |
| **Conflict Resolution** | Resolving competition when multiple production rules fire simultaneously. | Priority-Weighted Severity Dominance with Rule Priority Tie-Breaking (`inferenceTrace.conflictResolution` in `server/rules/ruleEngine.js`). |
| **Backward Chaining** | Goal-driven reasoning working backward from a hypothesis to find supporting evidence. | Interactive goal investigator (`evaluateBackwardChaining()` in `server/rules/ruleEngine.js`) recursively proving or refuting target clinical hypotheses. |
| **Explainable AI (XAI)** | Full auditability of system conclusions without hidden latent parameters. | Comprehensive reasoning traces (`inferenceTrace`), non-firing rule premise logs (`unmetConditions`), and the **"Why this result?"** explanation tree. |
| **Uncertainty & Boundaries** | Handling incomplete data without making unwarranted assumptions. | Open-world boundary detection (`R09` and `facts.required_family_information_missing`), guaranteeing that **missing data $\neq$ low genetic risk**. |

---

## 2. Formal Knowledge Base Architecture

The GeneTrace Knowledge Base operates on first-order propositional logic represented as structured production rules.

### Production Rule Formal Definition
Each rule $R_i$ is defined as a tuple:
$$R_i = \langle \text{RuleCode}, \text{Name}, \mathcal{P}, \text{Logic}, \mathcal{C}, \text{Category}, \text{Priority}, \text{Severity}, \mathcal{E}, \mathcal{G} \rangle$$
Where:
- $\mathcal{P} = \{p_1, p_2, \dots, p_k\}$ is a set of premises (conditions) where each $p_j = \langle \text{FactKey}, \text{Operator}, \text{ExpectedValue} \rangle$.
- $\text{Logic} \in \{\text{'AND'}, \text{'OR'}\}$ specifies whether all conditions or any condition must be satisfied.
- $\mathcal{C} = \langle \text{FactKey}, \text{Value} \rangle$ is the optional conclusion fact asserted into working memory upon activation.
- $\text{Category} \in \{\text{COUNSELOR\_REVIEW}, \text{REVIEW\_RECOMMENDED}, \text{INSUFFICIENT\_INFO}, \text{INFORMATIONAL}\}$.
- $\text{Priority} \in \mathbb{Z}^+$ is an integer weight used for conflict resolution (higher integer = higher priority).
- $\text{Severity} \in \{\text{'LOW'}, \text{'MODERATE'}, \text{'HIGH'}, \text{'CRITICAL'}\}$.
- $\mathcal{E}$ is the human-interpretable clinical explanation template.
- $\mathcal{G}$ is a set of actionable preconception guidance recommendations.

### Working Memory Partitioning

Working memory $W$ is strictly separated into two distinct sets:
1. **Base / Input Facts ($W_{\text{base}}$):** Deterministically extracted from patient pedigree topology by `server/rules/factBuilder.js`:
   - Lineage metrics: `total_members`, `biological_parent_count`, `affected_generations`.
   - Topological flags: `consanguinity_detected`, `multi_generational_transmission`.
   - Clinical observations: `affected_parent`, `affected_sibling`, `early_onset_detected`, `proband_is_carrier`, `couple_carrier_match`, `maternal_age_over_35`, `paternal_age_over_40`, `recurrent_pregnancy_loss`.
2. **Derived Intermediate Facts ($W_{\text{derived}}$):** Inferred dynamically during forward chaining passes:
   - `dual_carrier_recessive_risk`, `autosomal_dominant_pattern`, `early_onset_clustering`, `consanguinity_risk_flag`, `review_indicator`, `professional_review_recommended`, `maternal_age_guidance_indicated`, `karyotyping_evaluation_indicated`, `insufficient_information_flag`, `baseline_standard_risk`.

---

## 3. Inference Engine Mechanics

### Multi-Pass Forward Chaining Algorithm

```
Algorithm: MultiPassForwardChaining(W_base, KB)
Input: W_base (Initial Working Memory), KB (Active Production Rules)
Output: FinalAssessment (Outcome, DerivedFacts, FullTrace, ProofTree)

1.  W_working ← W_base
2.  W_derived ← ∅
3.  FiredRules ← ∅
4.  PassNumber ← 1
5.  MaxPasses ← 10
6.  NewDerivationInPass ← True
7.  PassesTrace ← []

8.  WHILE NewDerivationInPass == True AND PassNumber <= MaxPasses DO:
9.      NewDerivationInPass ← False
10.     CurrentPassTriggered ← []
11.     PassEvaluations ← []

12.     FOR each Rule R in KB (sorted by Priority descending) DO:
13.         IF R.RuleCode ∈ FiredRules THEN CONTINUE

14.         ConditionResults ← []
15.         FOR each Cond in R.Conditions DO:
16.             FactVal ← W_working[Cond.FactKey]
17.             IsMet ← EvaluateOperator(FactVal, Cond.Operator, Cond.ExpectedValue)
18.             Append IsMet to ConditionResults
19.         END FOR

20.         IF R.ConditionLogic == 'OR' THEN:
21.             RuleFired ← (True ∈ ConditionResults)
22.         ELSE:
23.             RuleFired ← (False ∉ ConditionResults)
24.         END IF

25.         Record evaluation log (Status: RuleFired ? 'TRIGGERED' : 'UNMET', UnmetPremises)

26.         IF RuleFired == True THEN:
27.             FiredRules ← FiredRules ∪ {R.RuleCode}
28.             NewDerivationInPass ← True
29.             Append R.RuleCode to CurrentPassTriggered
30.             IF R.Conclusion != Null THEN:
31.                 W_working[R.Conclusion.FactKey] ← R.Conclusion.Value
32.                 W_derived[R.Conclusion.FactKey] ← R.Conclusion.Value
33.             END IF
34.         END IF
35.     END FOR

36.     Append {PassNumber, RulesTriggered: CurrentPassTriggered, EvaluatedRules: PassEvaluations} to PassesTrace
37.     IF CurrentPassTriggered is NOT Empty THEN PassNumber ← PassNumber + 1
38.     ELSE BREAK (Fixed point reached)
39. END WHILE

40. Run ConflictResolution(FiredRules)
41. Construct BackwardChainingProof for dominant goal
42. RETURN {ResultCategory, DerivedFacts: W_derived, PassesTrace, ConflictResolutionTrace}
```

### Conflict Resolution Strategy

When multiple rules trigger in working memory, GeneTrace executes a **Priority-Weighted Severity Dominance** resolution strategy:
1. **Tier 1: Category Severity Precedence (Category Weight):**
   $$\text{COUNSELOR\_REVIEW (Weight 4)} > \text{REVIEW\_RECOMMENDED (Weight 3)} > \text{INSUFFICIENT\_INFO (Weight 2)} > \text{INFORMATIONAL (Weight 1)}$$
   A higher risk tier strictly dominates lower risk tiers to ensure patient safety and clinical conservatism.
2. **Tier 2: Intra-Category Rule Priority Tie-Breaking:**
   If multiple rules trigger within the same severity tier, the rule with the higher integer `priority` is declared the primary dominant explanation.
3. **Auditability:** The engine records `inferenceTrace.conflictResolution`, capturing every candidate rule, its weight, priority, and the explicit rationale for the winning outcome.

---

## 4. The 4 Worked Synthetic Demonstration Scenarios

These 4 scenarios are pre-loaded directly into the application's **AIES Analysis Studio** (`/expert-system`).

### Scenario 1: Autosomal Recessive Carrier Match & Consanguinity
- **Clinical Lineage:** Proband (Male, 29, CFTR carrier) and Partner (Female, 27, CFTR carrier) are 2nd cousins (`consanguinity_detected: true`). Proband's brother is affected with Cystic Fibrosis.
- **Pass 1 Execution:**
  - `RULE-AR-01` (`couple_carrier_match == true`): **FIRED**. Asserts `dual_carrier_recessive_risk = true`.
  - `RULE-CONS-01` (`consanguinity_detected == true`): **FIRED**. Asserts `consanguinity_risk_flag = true`.
  - `RULE-CARRIER-01` (`proband_is_carrier == true`): **FIRED**. Asserts `carrier_counseling_indicated = true`.
- **Pass 2 Execution:** No additional premises met. Fixed point reached.
- **Conflict Resolution:** `RULE-AR-01` (Priority 100, Severity CRITICAL, Weight 4) defeats `RULE-CONS-01` (Priority 80, Weight 3).
- **Outcome:** `COUNSELOR_REVIEW` (25% recurrence risk of affected child per pregnancy).

### Scenario 2: Multi-Generational Huntington's Disease (Autosomal Dominant)
- **Clinical Lineage:** Proband's father and paternal grandmother were both diagnosed with Huntington's Disease with onset before age 50. Vertical transmission across 3 generations.
- **Pass 1 Execution:**
  - `RULE-AD-01` (`multi_generational_transmission == true`): **FIRED**. Asserts `autosomal_dominant_pattern = true`.
  - `RULE-MULTI-01` (`multiple_affected_relatives == true` AND `early_onset_detected == true`): **FIRED**. Asserts `early_onset_clustering = true`.
  - `R04` (`multiple_affected_members == true` AND `multi_generational_pattern == true`): **FIRED**. Asserts `review_indicator = true`.
- **Pass 2 Execution (Demonstrating Multi-Pass Chaining):**
  - `R08` (`review_indicator == true`): **FIRED** because `review_indicator` was asserted in Pass 1! Asserts `professional_review_recommended = true`.
- **Pass 3 Execution:** Fixed point reached.
- **Conflict Resolution:** `RULE-AD-01` (Priority 95, Weight 4) wins dominance.
- **Outcome:** `COUNSELOR_REVIEW` (50% transmission risk per affected parent).

### Scenario 3: Advanced Parental Age & Recurrent Pregnancy Loss
- **Clinical Lineage:** Maternal age 39 (`maternal_age_over_35: true`), Paternal age 44 (`paternal_age_over_40: true`), 2 prior consecutive first-trimester pregnancy losses (`recurrent_pregnancy_loss: true`). Zero single-gene monogenic conditions.
- **Pass 1 Execution:**
  - `RULE-RPL-01` (`recurrent_pregnancy_loss == true`): **FIRED**. Asserts `karyotyping_evaluation_indicated = true`.
  - `RULE-AMA-01` (`maternal_age_over_35 == true`): **FIRED**. Asserts `maternal_age_guidance_indicated = true`.
  - `RULE-APA-01` (`paternal_age_over_40 == true`): **FIRED**. Asserts `paternal_age_guidance_indicated = true`.
- **Conflict Resolution:** Severity tier `REVIEW_RECOMMENDED` (Weight 3). Winner: `RULE-RPL-01` (Priority 74).
- **Outcome:** `REVIEW_RECOMMENDED` (Aneuploidy screening, parental karyotyping for balanced translocations).

### Scenario 4: Incomplete Biological Lineage (Uncertainty Handling)
- **Clinical Lineage:** Proband was adopted in infancy with zero biological parental health records. No medical conditions reported.
- **AIES Knowledge Boundary Principle:** In standard closed-world systems, "0 reported conditions" would falsely deduce low risk. GeneTrace detects `required_family_information_missing == true` and fires `R09`.
- **Pass 1 Execution:**
  - `R09` (`required_family_information_missing == true` AND `condition_present == false`): **FIRED**. Asserts `insufficient_information_flag = true`.
- **Outcome:** `INSUFFICIENT_INFORMATION` (Weight 2). Recommends universal population-level expanded carrier screening rather than false reassurance.

---

## 5. Step-by-Step Teacher / Faculty Demonstration Script

When presenting GeneTrace to your evaluator or professor, follow this exact sequence:

1. **Open the Application:** Navigate to `http://localhost:5173`.
2. **Click "AIES Studio" in the Top Navigation Bar:** This opens the dedicated **GeneTrace AIES Analysis Studio** (`/expert-system`).
3. **Demonstrate Case 1 (Recessive / Consanguinity):**
   - Click the **Case 1** card.
   - Click the **"Run Live Inference"** button.
   - Point out the **Multi-Pass Forward Chaining** tab: show how `RULE-AR-01`, `RULE-CONS-01`, and `RULE-CARRIER-01` fired in Pass 1.
   - Expand the **"Rules Evaluated but Not Triggered"** section: explain to the teacher that GeneTrace logs *why rules did not fire* (showing exact unmet premises).
4. **Demonstrate Multi-Pass Chaining in Case 2 (Dominant / Huntington's):**
   - Click the **Case 2** card.
   - Click **"Run Live Inference"**.
   - Show that **Pass 1** and **Pass 2** both executed:
     - In Pass 1, rule `R04` fired and derived intermediate fact `review_indicator = true`.
     - In Pass 2, rule `R08` fired because `review_indicator` was asserted in Pass 1! This proves genuine multi-stage forward chaining.
5. **Demonstrate Backward Chaining Goal Investigator:**
   - Switch to the **"Backward Chaining (Goal Tester)"** tab.
   - Select goal hypothesis: `autosomal_dominant_pattern = true`.
   - Click **"Query Goal Hypothesis"**.
   - Show the teacher the **Proof Tree**: GeneTrace started from the hypothesis, checked the production rules that deduce it, and recursively validated the required premises against working memory.
6. **Demonstrate Uncertainty & Knowledge Boundaries in Case 4:**
   - Click **Case 4 (Adoptive / Incomplete Lineage)**.
   - Explain the concept of the **Open-World Assumption**: *"In clinical genetics, absence of family records is NOT proof of low risk. GeneTrace detects the missing biological lineage and flags INSUFFICIENT_INFORMATION rather than giving false reassurance."*
7. **Show Explainable AI & Conflict Resolution:**
   - Switch to the **"Explainable AI (XAI) & Audit"** tab.
   - Show the **Conflict Resolution Decision Audit table**: demonstrate how candidate rules were weighted, how ties were broken, and how the final dominant recommendation was synthesized.

---

## 6. Comprehensive Faculty Viva Voce Q&A Cheat Sheet

### Q1: What type of Artificial Intelligence is used in GeneTrace?
> **Answer:** GeneTrace uses a **symbolic, deterministic rule-based expert system** implemented using propositional logic, multi-pass forward chaining, and recursive backward chaining. It models clinical domain knowledge through verified production rules (IF-THEN clauses) evaluated against an explicit working memory.

### Q2: Why did you use a Rule-Based Expert System instead of Deep Learning or Neural Networks?
> **Answer:** In preconception and clinical genetics, decisions require **100% auditability, determinism, and zero hallucination risk**. Neural networks are black boxes: they cannot provide a verifiable step-by-step mathematical proof of why a patient was assigned a carrier risk, and clinical medical device regulations (such as FDA/CE SaMD) require full explainability. Furthermore, hereditary genetic conditions are governed by well-established Mendelian biological laws (autosomal dominant, autosomal recessive, X-linked) rather than empirical statistical approximations, and rare genetic diseases have extremely scarce training data.

### Q3: What is the difference between Forward Chaining and Backward Chaining in your system?
> **Answer:**
> - **Forward Chaining (Data-Driven):** Starts with known facts (the patient's family tree) and applies inference rules in multiple passes to derive new intermediate facts and aggregate clinical conclusions until a fixed point is reached.
> - **Backward Chaining (Goal-Driven):** Starts with a specific hypothesis (e.g. *"Is this couple at high risk for autosomal dominant transmission?"*) and works backward, identifying which rules could prove that goal and recursively verifying whether the required evidence exists in working memory.

### Q4: How does GeneTrace handle Conflict Resolution when multiple rules fire?
> **Answer:** When multiple production rules trigger simultaneously, GeneTrace applies a **Priority-Weighted Severity Dominance** strategy:
> 1. Rules are grouped by clinical risk tiers (`COUNSELOR_REVIEW` weight 4 > `REVIEW_RECOMMENDED` weight 3 > `INSUFFICIENT_INFO` weight 2 > `INFORMATIONAL` weight 1). The highest risk tier dominates.
> 2. Within the same risk tier, ties are broken using strict integer **rule priority** (higher numerical priority wins).
> 3. The exact resolution trace is logged in `inferenceTrace.conflictResolution` for complete clinical auditability.

### Q5: How do you prevent infinite loops or cycles during Forward Chaining?
> **Answer:** We employ two cycle protection mechanisms:
> 1. **Rule Set Memory (`firedRuleCodes`):** Each rule instance can fire at most once during an inference session; once triggered, it cannot re-trigger in subsequent passes.
> 2. **Fixed-Point Termination with Hard Upper Bound:** The loop terminates as soon as a pass yields zero new derivations ($\Delta F = \emptyset$), with a strict safety guard of `maxPasses = 10`.

### Q6: What is the Closed-World Assumption and how does GeneTrace handle it?
> **Answer:** The Closed-World Assumption assumes that anything not currently known or recorded is false. In medical genetics, applying the closed-world assumption to incomplete family histories is dangerous because **absence of evidence is not evidence of absence** (e.g., an adopted person with zero recorded illnesses is not automatically at low risk). GeneTrace detects when biological parentage or generational records are missing (`required_family_information_missing`), triggering rule `R09` which assigns `INSUFFICIENT_INFORMATION` and recommends universal carrier screening.

### Q7: Can production rules use both AND and OR logical operators?
> **Answer:** Yes. In GeneTrace, every rule specifies `conditionLogic: 'AND' | 'OR'`. In `'AND'` mode (the default), all condition premises must evaluate to true. In `'OR'` mode (used in rules like `RULE-AMA-01` for maternal age), the rule triggers if any premise is satisfied.

### Q8: What relational operators are supported in your condition predicates?
> **Answer:** GeneTrace supports 6 formal relational operators (`server/constants/index.js`):
> - `EQUALS` ($==$)
> - `NOT_EQUALS` ($\neq$)
> - `GREATER_THAN` ($>$)
> - `LESS_THAN` ($<$)
> - `GREATER_OR_EQUAL` ($\ge$)
> - `CONTAINS` (set membership)

### Q9: How does the system verify why a rule did NOT fire?
> **Answer:** During every forward chaining pass, GeneTrace evaluates every active rule against working memory. For rules that evaluate to `UNMET`, the engine records `evaluatedRules` in the inference trace, explicitly logging the exact condition premises that failed along with their expected versus actual runtime values.

### Q10: Where is the knowledge base stored and can it be updated without changing source code?
> **Answer:** Knowledge base rules are stored in MongoDB under the `Rule` collection and managed via the Clinical Administrator Portal (`/admin/rules`). Clinical administrators can add new rules, modify condition predicates, adjust priorities, and update guidance without redeploying the backend application. Default rules are persisted in `server/rules/defaultRules.js` as a verified baseline fallback.
