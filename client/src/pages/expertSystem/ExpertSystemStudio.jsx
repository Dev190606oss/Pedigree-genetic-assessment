import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Database,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  Search,
  Filter,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  ChevronDown,
  ChevronRight,
  FileText,
  Activity,
  Layers,
  Award,
  Users,
  Network,
  Share2,
  Box,
  Code2
} from 'lucide-react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const ExpertSystemStudio = () => {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('forward'); // 'forward', 'facts', 'rules', 'representation', 'backward', 'xai'
  const [repSubTab, setRepSubTab] = useState('all'); // 'all', 'fopl', 'semantic', 'frames'
  const [loading, setLoading] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data State
  const [demoCases, setDemoCases] = useState([]);
  const [selectedCaseId, setSelectedCaseId] = useState('case-recessive-consanguinity');
  const [kbRules, setKbRules] = useState([]);
  const [userFamilies, setUserFamilies] = useState([]);
  const [selectedFamilyId, setSelectedFamilyId] = useState('');

  // Inference Outcome State
  const [evaluation, setEvaluation] = useState(null);

  // Backward Chaining Goal Investigator State
  const [goalFact, setGoalFact] = useState('dual_carrier_recessive_risk');
  const [goalTargetValue, setGoalTargetValue] = useState(true);
  const [backwardProof, setBackwardProof] = useState(null);
  const [backwardLoading, setBackwardLoading] = useState(false);

  // Filters & Search
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleCategoryFilter, setRuleCategoryFilter] = useState('ALL');
  const [factSearch, setFactSearch] = useState('');
  const [factTypeFilter, setFactTypeFilter] = useState('ALL'); // 'ALL', 'BASE', 'DERIVED'
  const [expandedPasses, setExpandedPasses] = useState({ 1: true, 2: true });

  // Load Demo Cases & Knowledge Base Rules on Mount
  useEffect(() => {
    async function initStudio() {
      try {
        setRulesLoading(true);
        // 1. Fetch Demo Cases
        const casesRes = await api.get('/expert-system/demo-cases');
        if (casesRes.data?.cases) {
          setDemoCases(casesRes.data.cases);
        }

        // 2. Fetch KB Rules
        const rulesRes = await api.get('/expert-system/rules');
        if (rulesRes.data?.rules) {
          setKbRules(rulesRes.data.rules);
        }

        // 3. Fetch user families if logged in
        try {
          const famRes = await api.get('/families');
          if (famRes.data?.families) {
            setUserFamilies(famRes.data.families);
          }
        } catch {
          // Guest user exploring studio
        }
      } catch (err) {
        setError('Failed to initialize AIES Studio data: ' + (err.response?.data?.message || err.message));
      } finally {
        setRulesLoading(false);
      }
    }
    initStudio();
  }, []);

  // Run initial evaluation once demo cases are loaded
  useEffect(() => {
    if (demoCases.length > 0 && selectedCaseId) {
      handleRunInference(selectedCaseId, null);
    }
  }, [demoCases]);

  // Execute Forward Chaining Inference
  const handleRunInference = async (caseId, familyId) => {
    setLoading(true);
    setError(null);
    try {
      const payload = familyId ? { familyId } : { caseId: caseId || selectedCaseId };
      const res = await api.post('/expert-system/evaluate', payload);
      setEvaluation(res.data);

      // Pre-populate backward chaining goal with dominant conclusion or default
      if (res.data?.backwardChaining?.goal) {
        setGoalFact(res.data.backwardChaining.goal);
        setBackwardProof(res.data.backwardChaining);
      }
    } catch (err) {
      setError('Inference engine execution error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Run On-Demand Backward Chaining Goal Investigation
  const handleQueryGoal = async () => {
    if (!goalFact) return;
    setBackwardLoading(true);
    try {
      const res = await api.post('/expert-system/query-goal', {
        goalFact,
        targetValue: goalTargetValue,
        facts: evaluation?.facts || {},
        derivedFacts: evaluation?.derivedFacts || {}
      });
      setBackwardProof(res.data.proof);
    } catch (err) {
      setError('Backward chaining query failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setBackwardLoading(false);
    }
  };

  // Filtered Rules
  const filteredRules = kbRules.filter(r => {
    const matchesSearch =
      (r.name && r.name.toLowerCase().includes(ruleSearch.toLowerCase())) ||
      (r.ruleCode && r.ruleCode.toLowerCase().includes(ruleSearch.toLowerCase())) ||
      (r.explanation && r.explanation.toLowerCase().includes(ruleSearch.toLowerCase()));
    const matchesCategory = ruleCategoryFilter === 'ALL' || r.category === ruleCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const ruleCategories = ['ALL', ...new Set(kbRules.map(r => r.category).filter(Boolean))];

  // Selected Demo Case Details
  const activeCase = demoCases.find(c => c.id === selectedCaseId);

  // Dynamic Knowledge Representation generator based on selected scenario
  const getKnowledgeRepresentation = () => {
    const predicates = [];
    const hornClauses = [];
    const triples = [];
    const frames = [];

    if (selectedCaseId === 'case-recessive-consanguinity') {
      predicates.push(
        { text: 'proband(alex_morgan, biological_sex: female, age: 31)', category: 'Entity' },
        { text: 'partner(david_morgan, biological_sex: male, age: 33)', category: 'Entity' },
        { text: 'consanguineous(alex_morgan, david_morgan, degree: first_cousin)', category: 'Lineage' },
        { text: 'carrier_status(alex_morgan, condition: "cystic_fibrosis", gene: "CFTR")', category: 'Clinical' },
        { text: 'carrier_status(david_morgan, condition: "cystic_fibrosis", gene: "CFTR")', category: 'Clinical' },
        { text: 'matches_recessive_pair(alex_morgan, david_morgan, "cystic_fibrosis") := true', category: 'Deduction' },
        { text: 'consanguinity_reported() := true', category: 'Deduction' }
      );
      hornClauses.push(
        {
          ruleCode: 'RULE-REC-01',
          clause: '∀p, q, c [ carrier(p, c) ∧ carrier(q, c) ∧ partners(p, q) ∧ recessive(c) ⇒ dual_carrier_recessive_risk(p, q, c, 0.25) ]',
          description: 'If both reproductive partners carry pathogenic variants for the same autosomal recessive condition, the recurrence risk in offspring is 25% (1 in 4).'
        },
        {
          ruleCode: 'RULE-CON-01',
          clause: '∀p, q [ partners(p, q) ∧ consanguineous(p, q) ⇒ consanguinity_risk_flag(p, q) ]',
          description: 'Consanguineous partnership elevates baseline risk for unmasked shared autosomal recessive alleles.'
        }
      );
      triples.push(
        { subject: 'Alex Morgan', predicate: 'partner_of', object: 'David Morgan', type: 'lineage' },
        { subject: 'Alex Morgan', predicate: 'carrier_of', object: 'Cystic Fibrosis (CFTR)', type: 'clinical' },
        { subject: 'David Morgan', predicate: 'carrier_of', object: 'Cystic Fibrosis (CFTR)', type: 'clinical' },
        { subject: 'Alex Morgan', predicate: 'consanguineous_with', object: 'David Morgan', type: 'lineage' },
        { subject: 'Cystic Fibrosis', predicate: 'inheritance_mode', object: 'Autosomal Recessive', type: 'ontological' },
        { subject: 'RULE-REC-01', predicate: 'evaluates_pattern', object: 'Dual Carrier Match', type: 'aies' },
        { subject: 'InferenceEngine', predicate: 'triggers_conclusion', object: 'COUNSELOR_REVIEW', type: 'aies' }
      );
      frames.push(
        {
          name: 'FRAME: Patient_AlexMorgan',
          parent: 'FamilyMember',
          slots: [
            { slot: 'Identifier', type: 'UUID', value: 'MEM-001', facet: 'Unique Key' },
            { slot: 'Role', type: 'Symbol', value: 'Proband (Self)', facet: 'Clinical Role' },
            { slot: 'BiologicalSex', type: 'Enum', value: 'Female', facet: 'Mendelian Facet' },
            { slot: 'Age', type: 'Integer', value: '31', facet: 'Quantitative' },
            { slot: 'CarrierStatus', type: 'List<String>', value: '["Cystic Fibrosis (CFTR)"]', facet: 'Evidence Slot' },
            { slot: 'ConsanguinityFlag', type: 'Boolean', value: 'true', facet: 'Working Memory' }
          ]
        },
        {
          name: 'FRAME: ProductionRule_RULE-REC-01',
          parent: 'ClinicalInferenceRule',
          slots: [
            { slot: 'RuleCode', type: 'String', value: 'RULE-REC-01', facet: 'Knowledge Base Key' },
            { slot: 'PremiseLogic', type: 'Expression', value: 'dual_carrier_recessive_risk == true', facet: 'IF Slot' },
            { slot: 'InferenceMode', type: 'Symbol', value: 'ForwardChaining_MultiPass', facet: 'Engine Facet' },
            { slot: 'ConsequentAction', type: 'Expression', value: 'Assert(dual_carrier_recessive_risk=true)', facet: 'THEN Slot' },
            { slot: 'TriageOutcome', type: 'Enum', value: 'COUNSELOR_REVIEW', facet: 'Clinical Tier' },
            { slot: 'NumericalPriority', type: 'Integer', value: '90', facet: 'Conflict Resolution' }
          ]
        }
      );
    } else if (selectedCaseId === 'case-dominant-huntington') {
      predicates.push(
        { text: 'proband(clara_oswald, biological_sex: female, age: 29)', category: 'Entity' },
        { text: 'biological_father(robert_oswald, clara_oswald)', category: 'Lineage' },
        { text: 'diagnosed_with(robert_oswald, condition: "huntingtons_disease", onset: 42)', category: 'Clinical' },
        { text: 'affected_status(robert_oswald) := true', category: 'Clinical' },
        { text: 'dominant_transmission_pattern(robert_oswald, clara_oswald) := true', category: 'Deduction' },
        { text: 'offspring_at_risk(clara_oswald, risk: 0.50) := true', category: 'Deduction' }
      );
      hornClauses.push(
        {
          ruleCode: 'RULE-DOM-01',
          clause: '∀parent, child, c [ parent_of(parent, child) ∧ affected(parent, c) ∧ dominant(c) ⇒ autosomal_dominant_pattern(child, c, 0.50) ]',
          description: 'A parent affected by an autosomal dominant condition confers a 50% prior risk of transmitting the variant to each biological child.'
        }
      );
      triples.push(
        { subject: 'Robert Oswald', predicate: 'biological_father_of', object: 'Clara Oswald', type: 'lineage' },
        { subject: 'Robert Oswald', predicate: 'diagnosed_with', object: "Huntington's Disease", type: 'clinical' },
        { subject: "Huntington's Disease", predicate: 'inheritance_mode', object: 'Autosomal Dominant', type: 'ontological' },
        { subject: 'Clara Oswald', predicate: 'at_risk_of', object: 'Inherited Allele (50%)', type: 'clinical' },
        { subject: 'RULE-DOM-01', predicate: 'evaluates_pattern', object: 'Vertical Transmission', type: 'aies' },
        { subject: 'InferenceEngine', predicate: 'triggers_conclusion', object: 'COUNSELOR_REVIEW', type: 'aies' }
      );
      frames.push(
        {
          name: 'FRAME: Patient_ClaraOswald',
          parent: 'FamilyMember',
          slots: [
            { slot: 'Identifier', type: 'UUID', value: 'MEM-002', facet: 'Unique Key' },
            { slot: 'Role', type: 'Symbol', value: 'Proband (Self)', facet: 'Clinical Role' },
            { slot: 'BiologicalSex', type: 'Enum', value: 'Female', facet: 'Mendelian Facet' },
            { slot: 'Age', type: 'Integer', value: '29', facet: 'Quantitative' },
            { slot: 'FirstDegreeAffected', type: 'Boolean', value: 'true (Father)', facet: 'Lineage Evidence' },
            { slot: 'CalculatedPriorRisk', type: 'Float', value: '0.50', facet: 'Inference Slot' }
          ]
        },
        {
          name: 'FRAME: ProductionRule_RULE-DOM-01',
          parent: 'ClinicalInferenceRule',
          slots: [
            { slot: 'RuleCode', type: 'String', value: 'RULE-DOM-01', facet: 'Knowledge Base Key' },
            { slot: 'PremiseLogic', type: 'Expression', value: 'autosomal_dominant_pattern == true', facet: 'IF Slot' },
            { slot: 'InferenceMode', type: 'Symbol', value: 'ForwardChaining_MultiPass', facet: 'Engine Facet' },
            { slot: 'ConsequentAction', type: 'Expression', value: 'Assert(autosomal_dominant_pattern=true)', facet: 'THEN Slot' },
            { slot: 'TriageOutcome', type: 'Enum', value: 'COUNSELOR_REVIEW', facet: 'Clinical Tier' },
            { slot: 'NumericalPriority', type: 'Integer', value: '85', facet: 'Conflict Resolution' }
          ]
        }
      );
    } else if (selectedCaseId === 'case-ama-aneuploidy') {
      predicates.push(
        { text: 'proband(eleanor_vance, biological_sex: female, age: 39)', category: 'Entity' },
        { text: 'partner(mark_vance, biological_sex: male, age: 41)', category: 'Entity' },
        { text: 'maternal_age_gt_35(eleanor_vance, age: 39) := true', category: 'Clinical' },
        { text: 'prior_pregnancy_loss_count(eleanor_vance, count: 2)', category: 'Clinical' },
        { text: 'advanced_maternal_age_guidance_indicated() := true', category: 'Deduction' },
        { text: 'aneuploidy_screening_recommended() := true', category: 'Deduction' }
      );
      hornClauses.push(
        {
          ruleCode: 'RULE-AMA-01',
          clause: '∀p [ proband(p) ∧ sex(p, female) ∧ age(p) ≥ 35 ⇒ maternal_age_guidance_indicated(p) ]',
          description: 'Maternal age of 35 or greater at estimated date of delivery increases risk for fetal chromosomal aneuploidies.'
        },
        {
          ruleCode: 'RULE-RPL-01',
          clause: '∀p [ pregnancy_loss_count(p) ≥ 2 ⇒ recurrent_pregnancy_loss_review(p) ]',
          description: 'History of two or more pregnancy losses warrants evaluation for parental balanced chromosomal rearrangements.'
        }
      );
      triples.push(
        { subject: 'Eleanor Vance', predicate: 'age_at_conception', object: '39 years', type: 'clinical' },
        { subject: 'Eleanor Vance', predicate: 'recurrent_losses', object: '2 miscarriages', type: 'clinical' },
        { subject: 'Eleanor Vance', predicate: 'partner_of', object: 'Mark Vance', type: 'lineage' },
        { subject: 'RULE-AMA-01', predicate: 'evaluates_premise', object: 'Maternal Age ≥ 35', type: 'aies' },
        { subject: 'InferenceEngine', predicate: 'triggers_conclusion', object: 'REVIEW_RECOMMENDED', type: 'aies' }
      );
      frames.push(
        {
          name: 'FRAME: Patient_EleanorVance',
          parent: 'FamilyMember',
          slots: [
            { slot: 'Identifier', type: 'UUID', value: 'MEM-003', facet: 'Unique Key' },
            { slot: 'Role', type: 'Symbol', value: 'Proband (Self)', facet: 'Clinical Role' },
            { slot: 'MaternalAge', type: 'Integer', value: '39', facet: 'Threshold: 35' },
            { slot: 'PregnancyLossCount', type: 'Integer', value: '2', facet: 'Clinical History' },
            { slot: 'AneuploidyRiskFlag', type: 'Boolean', value: 'true', facet: 'Deduction Slot' }
          ]
        },
        {
          name: 'FRAME: ProductionRule_RULE-AMA-01',
          parent: 'ClinicalInferenceRule',
          slots: [
            { slot: 'RuleCode', type: 'String', value: 'RULE-AMA-01', facet: 'Knowledge Base Key' },
            { slot: 'PremiseLogic', type: 'Expression', value: 'maternal_age_over_35 == true', facet: 'IF Slot' },
            { slot: 'InferenceMode', type: 'Symbol', value: 'ForwardChaining_MultiPass', facet: 'Engine Facet' },
            { slot: 'ConsequentAction', type: 'Expression', value: 'Assert(maternal_age_guidance_indicated=true)', facet: 'THEN Slot' },
            { slot: 'TriageOutcome', type: 'Enum', value: 'REVIEW_RECOMMENDED', facet: 'Clinical Tier' },
            { slot: 'NumericalPriority', type: 'Integer', value: '65', facet: 'Conflict Resolution' }
          ]
        }
      );
    } else {
      predicates.push(
        { text: 'proband(maya_lin, biological_sex: female, age: 28)', category: 'Entity' },
        { text: 'lineage_status(maya_lin, adopted: true, biological_records: unavailable)', category: 'Lineage' },
        { text: 'biological_parents_unknown(maya_lin) := true', category: 'Lineage' },
        { text: 'knowledge_boundary_triggered("Maternal and Paternal Lineage Incomplete")', category: 'Deduction' },
        { text: 'uncertainty_flag(maya_lin) := true', category: 'Deduction' }
      );
      hornClauses.push(
        {
          ruleCode: 'RULE-UNC-01',
          clause: '∀p [ proband(p) ∧ (adopted(p) ∨ unknown_parents(p)) ⇒ insufficient_information_flag(p) ]',
          description: 'Absence of verifiable biological ancestor history bounds inference capabilities and mandates explicit uncertainty qualification.'
        }
      );
      triples.push(
        { subject: 'Maya Lin', predicate: 'adoption_status', object: 'Adopted (Closed)', type: 'lineage' },
        { subject: 'Maya Lin', predicate: 'lineage_completeness', object: 'Unavailable', type: 'clinical' },
        { subject: 'Maya Lin', predicate: 'partner_of', object: 'Kevin Lin', type: 'lineage' },
        { subject: 'RULE-UNC-01', predicate: 'evaluates_pattern', object: 'Epistemic Uncertainty', type: 'aies' },
        { subject: 'InferenceEngine', predicate: 'triggers_conclusion', object: 'INSUFFICIENT_INFO', type: 'aies' }
      );
      frames.push(
        {
          name: 'FRAME: Patient_MayaLin',
          parent: 'FamilyMember',
          slots: [
            { slot: 'Identifier', type: 'UUID', value: 'MEM-004', facet: 'Unique Key' },
            { slot: 'Role', type: 'Symbol', value: 'Proband (Self)', facet: 'Clinical Role' },
            { slot: 'AdoptionStatus', type: 'Boolean', value: 'true', facet: 'Epistemic Boundary' },
            { slot: 'AvailableLineageGenerations', type: 'Integer', value: '0', facet: 'Completeness Metric' },
            { slot: 'UncertaintyTriage', type: 'Enum', value: 'INSUFFICIENT_INFO', facet: 'System Safety' }
          ]
        },
        {
          name: 'FRAME: ProductionRule_RULE-UNC-01',
          parent: 'ClinicalInferenceRule',
          slots: [
            { slot: 'RuleCode', type: 'String', value: 'RULE-UNC-01', facet: 'Knowledge Base Key' },
            { slot: 'PremiseLogic', type: 'Expression', value: 'family_history_unavailable == true', facet: 'IF Slot' },
            { slot: 'InferenceMode', type: 'Symbol', value: 'ForwardChaining_MultiPass', facet: 'Engine Facet' },
            { slot: 'ConsequentAction', type: 'Expression', value: 'Assert(insufficient_information_flag=true)', facet: 'THEN Slot' },
            { slot: 'TriageOutcome', type: 'Enum', value: 'INSUFFICIENT_INFO', facet: 'Clinical Tier' },
            { slot: 'NumericalPriority', type: 'Integer', value: '95', facet: 'Conflict Resolution' }
          ]
        }
      );
    }

    return { predicates, hornClauses, triples, frames };
  };

  const krData = getKnowledgeRepresentation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* --- AIES STUDIO HEADER BANNER --- */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Artificial Intelligence &amp; Expert Systems (AIES) Workbench
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              GeneTrace Expert System Workbench
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore the deterministic, rule-based expert system powering preconception genetic assessments. Inspect formal knowledge representation (First-Order Predicates, Semantic Networks, Frames), step through multi-pass forward chaining, test goal hypotheses with backward chaining, and audit conflict resolution decisions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="brand"
              onClick={() => handleRunInference(selectedCaseId, selectedFamilyId)}
              disabled={loading}
              size="md"
              className="whitespace-nowrap"
            >
              {loading ? (
                <>
                  <RotateCcw className="w-4 h-4 mr-1.5 animate-spin" /> Running Inference...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1.5 fill-current" /> Run Live Inference
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Syllabus / AI Concept Tags */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          <span className="font-semibold text-indigo-300 uppercase tracking-wider text-[10px]">AI Syllabus Concepts Demonstrated:</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">First-Order Predicate Logic (FOPL)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">Semantic Networks</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">Minsky Frames (Slot-Filler)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">Production Rules (IF-THEN)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">Multi-Pass Forward Chaining</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">Backward Chaining (Goal Trees)</span>
          <span className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-200">Conflict Resolution Precedence</span>
        </div>
      </div>

      {/* --- ERROR ALERT --- */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs font-semibold hover:underline">Dismiss</button>
        </div>
      )}

      {/* --- DEMONSTRATION CASE SELECTOR BAR --- */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Select Demonstration Case or Patient Pedigree
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick one of 4 faculty-curated benchmark cases or choose a live patient family from your database.
            </p>
          </div>

          {/* User Families dropdown if available */}
          {userFamilies.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Or Patient Family:</span>
              <select
                value={selectedFamilyId}
                onChange={(e) => {
                  const famId = e.target.value;
                  setSelectedFamilyId(famId);
                  if (famId) {
                    setSelectedCaseId('');
                    handleRunInference(null, famId);
                  }
                }}
                className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select a saved family...</option>
                {userFamilies.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 4 Curated Synthetic Case Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {demoCases.map((c, index) => {
            const isSelected = selectedCaseId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCaseId(c.id);
                  setSelectedFamilyId('');
                  handleRunInference(c.id, null);
                }}
                className={`p-3.5 rounded-xl text-left border transition-all space-y-1.5 ${
                  isSelected
                    ? 'bg-brand-50/80 dark:bg-brand-950/50 border-brand-500 dark:border-brand-500 shadow-sm ring-1 ring-brand-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
                    Case {index + 1}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                  )}
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {c.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  {c.clinicalDescription}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Case Context Card */}
        {activeCase && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 dark:text-slate-200">Active Scenario:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{activeCase.title}</span>
                <Badge variant="brand" size="sm">{activeCase.badge}</Badge>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Expected Winner: <code className="font-mono text-brand-600 dark:text-brand-400">{activeCase.expectedOutcome.winningRuleCode}</code> ({activeCase.expectedOutcome.resultCategory})
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              <strong>AIES Focus:</strong> {activeCase.aiesFocus}
            </p>
            {activeCase.sampleFamily?.membersSummary && (
              <div className="pt-1.5 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lineage Setup:</span>
                {activeCase.sampleFamily.membersSummary.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* --- STUDIO TAB NAVIGATION --- */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('forward')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'forward'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Multi-Pass Forward Chaining
          {evaluation?.inferenceTrace?.passes && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {evaluation.inferenceTrace.passes.length} Passes
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('facts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'facts'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          Working Memory &amp; Facts
          {evaluation && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {Object.keys(evaluation.facts || {}).length + Object.keys(evaluation.derivedFacts || {}).length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'rules'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Knowledge Base (Rules)
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px]">
            {kbRules.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('representation')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'representation'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          Knowledge Representation Lab
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
            FOPL • Graphs • Frames
          </span>
        </button>

        <button
          onClick={() => setActiveTab('backward')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'backward'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          Backward Chaining (Goal Tester)
        </button>

        <button
          onClick={() => setActiveTab('xai')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'xai'
              ? 'bg-brand-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Explainable AI (XAI) &amp; Audit
        </button>
      </div>

      {/* --- TAB 1: MULTI-PASS FORWARD CHAINING --- */}
      {activeTab === 'forward' && (
        <div className="space-y-6">
          {/* Forward Chaining Overview Banner */}
          <Card className="p-5 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent border-emerald-500/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Data-Driven Inference Loop
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Forward Chaining Cycle to Fixpoint
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                  The inference engine evaluates production rules against working memory. Triggered rules assert new intermediate facts into memory, triggering downstream rules in subsequent passes until no further rules can fire (fixpoint).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {evaluation?.inferenceTrace?.passes?.length || 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Passes</span>
                </div>
                <div className="text-center px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="block text-xl font-bold text-indigo-600 dark:text-indigo-400">
                    {evaluation?.triggeredRules?.length || 0}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Rules Fired</span>
                </div>
                <div className="text-center px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="block text-xl font-bold text-teal-600 dark:text-teal-400">
                    {Object.keys(evaluation?.derivedFacts || {}).length}
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Derived Facts</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Pass-by-Pass Execution Cards */}
          <div className="space-y-4">
            {(evaluation?.inferenceTrace?.passes || []).map((pass) => {
              const isExpanded = expandedPasses[pass.passNumber] !== false;
              const hasTriggered = (pass.rulesTriggered || []).length > 0;

              return (
                <Card key={pass.passNumber} className="overflow-hidden border border-slate-200 dark:border-slate-800">
                  {/* Pass Header */}
                  <div
                    onClick={() =>
                      setExpandedPasses(prev => ({ ...prev, [pass.passNumber]: !isExpanded }))
                    }
                    className="p-4 bg-slate-50 dark:bg-slate-800/80 cursor-pointer flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        P{pass.passNumber}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          Inference Pass {pass.passNumber}
                          {hasTriggered ? (
                            <Badge variant="success" size="sm">
                              {pass.rulesTriggered.length} Fired
                            </Badge>
                          ) : (
                            <Badge variant="neutral" size="sm">
                              Fixed Point / Termination
                            </Badge>
                          )}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {pass.rulesEvaluated || kbRules.length} rules evaluated against working memory
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {Object.keys(pass.newFactsDerived || {}).length > 0 && (
                        <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold hidden sm:inline">
                          +{Object.keys(pass.newFactsDerived).length} new fact(s) asserted
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Pass Body */}
                  {isExpanded && (
                    <div className="p-5 space-y-5">
                      {/* Section 1: Rules that fired in this pass */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Rules Triggered in Pass {pass.passNumber} ({pass.rulesTriggered?.length || 0})
                        </h5>

                        {hasTriggered ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {pass.rulesTriggered.map((code) => {
                              const ruleDetail = evaluation?.triggeredRules?.find(r => r.ruleCode === code);
                              return (
                                <div
                                  key={code}
                                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 shadow-sm space-y-2"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5">
                                      <code className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                                        {code}
                                      </code>
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {ruleDetail?.name}
                                      </span>
                                    </div>
                                    <Badge variant="brand" size="sm">
                                      Priority {ruleDetail?.priority}
                                    </Badge>
                                  </div>

                                  {ruleDetail?.conclusion && (
                                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/40 text-[11px] text-emerald-800 dark:text-emerald-200 font-mono flex items-center justify-between">
                                      <span>Asserts into memory:</span>
                                      <strong>{ruleDetail.conclusion.fact} = {String(ruleDetail.conclusion.value)}</strong>
                                    </div>
                                  )}

                                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                                    {ruleDetail?.explanation}
                                  </p>

                                  {/* Matched Premises */}
                                  {ruleDetail?.matchingFacts && (
                                    <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] space-y-1">
                                      <span className="font-semibold text-slate-500 uppercase tracking-wider">
                                        Matched Conditions:
                                      </span>
                                      {Object.entries(ruleDetail.matchingFacts).map(([factKey, match]) => (
                                        <div key={factKey} className="flex items-center justify-between font-mono text-slate-600 dark:text-slate-400">
                                          <span>{factKey} {match.operator} {String(match.expectedValue)}</span>
                                          <span className="text-emerald-600 font-semibold">[Actual: {String(match.actualValue)}]</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
                            <Info className="w-4 h-4 text-slate-400" />
                            <span>No additional rules satisfied working memory conditions in this pass. System reached a fixed point and successfully terminated.</span>
                          </div>
                        )}
                      </div>

                      {/* Section 2: Non-Firing Rules Audit (Why rules failed to trigger) */}
                      {pass.evaluatedRules && (
                        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                            Rules Evaluated but Not Triggered in Pass {pass.passNumber}
                          </h5>

                          <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                            {pass.evaluatedRules
                              .filter(r => r.status === 'UNMET')
                              .slice(0, 10)
                              .map(r => (
                                <div
                                  key={r.ruleCode}
                                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <code className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                        {r.ruleCode}
                                      </code>
                                      <span className="font-medium text-slate-800 dark:text-slate-200">{r.name}</span>
                                      <span className="text-[10px] text-slate-400">({r.conditionLogic} Logic)</span>
                                    </div>
                                    <div className="text-[11px] text-rose-600 dark:text-rose-400 mt-1 flex items-center gap-1">
                                      <XCircle className="w-3 h-3 flex-shrink-0" />
                                      <span>
                                        Unmet premise(s):{' '}
                                        {r.unmetConditions.map(u => `${u.fact} ${u.operator} ${u.expectedValue} (Actual: ${u.actualValue})`).join('; ')}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant="neutral" size="sm">Priority {r.priority}</Badge>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: WORKING MEMORY & FACTS EXPLORER --- */}
      {activeTab === 'facts' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Working Memory State
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Facts asserted directly from patient family data vs. intermediate facts deduced by rule execution.
                </p>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search facts..."
                    value={factSearch}
                    onChange={(e) => setFactSearch(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
                  <button
                    onClick={() => setFactTypeFilter('ALL')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${factTypeFilter === 'ALL' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFactTypeFilter('BASE')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${factTypeFilter === 'BASE' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Base Evidence
                  </button>
                  <button
                    onClick={() => setFactTypeFilter('DERIVED')}
                    className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${factTypeFilter === 'DERIVED' ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
                  >
                    Derived Facts
                  </button>
                </div>
              </div>
            </div>

            {/* Fact Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Derived Intermediate Facts */}
              {(factTypeFilter === 'ALL' || factTypeFilter === 'DERIVED') &&
                Object.entries(evaluation?.derivedFacts || {})
                  .filter(([key]) => key.toLowerCase().includes(factSearch.toLowerCase()))
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-center justify-between"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 block">
                          Derived Intermediate Fact
                        </span>
                        <code className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block font-mono">
                          {key}
                        </code>
                      </div>
                      <Badge variant="purple" size="sm">
                        {String(value)}
                      </Badge>
                    </div>
                  ))}

              {/* Base Working Facts */}
              {(factTypeFilter === 'ALL' || factTypeFilter === 'BASE') &&
                Object.entries(evaluation?.facts || {})
                  .filter(([key]) => key.toLowerCase().includes(factSearch.toLowerCase()))
                  .map(([key, value]) => {
                    const isTrue = value === true;
                    const isFalse = value === false;
                    return (
                      <div
                        key={key}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-2xs"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Base Lineage Fact
                          </span>
                          <code className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block font-mono">
                            {key}
                          </code>
                        </div>
                        <Badge
                          variant={isTrue ? 'success' : isFalse ? 'neutral' : 'info'}
                          size="sm"
                        >
                          {String(value)}
                        </Badge>
                      </div>
                    );
                  })}
            </div>
          </Card>
        </div>
      )}

      {/* --- TAB 3: KNOWLEDGE BASE RULE EXPLORER --- */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Production Rule Knowledge Base
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formally codified clinical genetics rules ({filteredRules.length} matching rules).
                </p>
              </div>

              {/* Category Pills & Search */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search rules..."
                    value={ruleSearch}
                    onChange={(e) => setRuleSearch(e.target.value)}
                    className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <select
                  value={ruleCategoryFilter}
                  onChange={(e) => setRuleCategoryFilter(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                >
                  {ruleCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rules Table / Cards */}
            <div className="space-y-3">
              {filteredRules.map((rule) => {
                const isTriggered = evaluation?.triggeredRules?.some(r => r.ruleCode === rule.ruleCode);
                return (
                  <div
                    key={rule.ruleCode}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isTriggered
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 ring-1 ring-emerald-400/40'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-bold text-brand-700 dark:text-brand-300 font-mono px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
                          {rule.ruleCode}
                        </code>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                          {rule.name}
                        </h4>
                        {isTriggered && (
                          <Badge variant="success" size="sm">Fired in Active Assessment</Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="purple" size="sm">{rule.category}</Badge>
                        <Badge variant="neutral" size="sm">Priority {rule.priority}</Badge>
                        <Badge variant={rule.conditionLogic === 'OR' ? 'info' : 'brand'} size="sm">
                          {rule.conditionLogic || 'AND'} Logic
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {rule.description || rule.explanation}
                    </p>

                    {/* Premise & Action Logic Box */}
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-mono space-y-1.5">
                      <div className="text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex-shrink-0">IF:</span>
                        <div className="flex flex-wrap gap-1">
                          {(rule.conditions || []).map((c, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                              {c.fact} {c.operator} {String(c.value)}
                              {i < (rule.conditions.length - 1) && (
                                <strong className="ml-1 text-indigo-600 dark:text-indigo-400">
                                  {rule.conditionLogic || 'AND'}
                                </strong>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>

                      {rule.conclusion && (
                        <div className="text-slate-700 dark:text-slate-300 flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">THEN:</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800">
                            Assert ({rule.conclusion.fact} = {String(rule.conclusion.value)}) &amp; Triage as {rule.result?.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* --- TAB: KNOWLEDGE REPRESENTATION LAB --- */}
      {activeTab === 'representation' && (
        <div className="space-y-6">
          {/* Header Card */}
          <Card className="p-5 border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Artificial Intelligence Knowledge Representation (KR)
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Network className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Knowledge Representation Formalisms
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                  Compare how clinical genetics knowledge, patient pedigree assertions, and inference rules are formally encoded across the three foundational AI knowledge representation paradigms: First-Order Predicate Logic (FOPL), Semantic Networks, and Minsky Frames.
                </p>
              </div>

              {/* Paradigm Selector Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-center">
                <button
                  onClick={() => setRepSubTab('all')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    repSubTab === 'all'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  All Paradigms
                </button>
                <button
                  onClick={() => setRepSubTab('fopl')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    repSubTab === 'fopl'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  1. Predicate Logic
                </button>
                <button
                  onClick={() => setRepSubTab('semantic')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    repSubTab === 'semantic'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2. Semantic Networks
                </button>
                <button
                  onClick={() => setRepSubTab('frames')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    repSubTab === 'frames'
                      ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  3. Frames &amp; Slots
                </button>
              </div>
            </div>
          </Card>

          {/* PARADIGM 1: FIRST-ORDER PREDICATE LOGIC (FOPL) */}
          {(repSubTab === 'all' || repSubTab === 'fopl') && (
            <Card className="p-6 space-y-5 border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      First-Order Predicate Logic (FOPL) Formalization
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Declarative representation using n-ary predicates, constants, variables, and universal Horn clauses
                    </p>
                  </div>
                </div>
                <Badge variant="purple" size="sm">First-Order Predicate Calculus</Badge>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Ground Atomic Formulas */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Ground Atomic Formulas (Current Working Facts)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {krData.predicates.length} Extracted Predicates
                    </span>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] border border-slate-800">
                    <div className="text-slate-400 text-[10px] pb-1 border-b border-slate-800 mb-2">
                      % Ground predicate statements asserted into working memory
                    </div>
                    {krData.predicates.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-0.5">
                        <span className="text-teal-300">{p.text}.</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                          {p.category}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Ground atomic formulas represent specific factual propositions about individuals and relationships in the current case without free variables.
                  </p>
                </div>

                {/* Right: Horn Clause Production Rules */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                    Horn Clause Production Rules (Universal Implication)
                  </span>

                  <div className="space-y-3">
                    {krData.hornClauses.map((hc) => (
                      <div
                        key={hc.ruleCode}
                        className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <code className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 font-mono">
                            {hc.ruleCode}
                          </code>
                          <Badge variant="brand" size="sm">Definite Horn Clause</Badge>
                        </div>

                        <div className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-indigo-900 dark:text-indigo-300">
                          {hc.clause}
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                          {hc.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* PARADIGM 2: SEMANTIC NETWORKS */}
          {(repSubTab === 'all' || repSubTab === 'semantic') && (
            <Card className="p-6 space-y-5 border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Semantic Network (Relational Graph &amp; Triples)
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Graph representation where entities and concepts are nodes connected by labeled directional relations
                    </p>
                  </div>
                </div>
                <Badge variant="teal" size="sm">Directed Relational Graph</Badge>
              </div>

              {/* Visual Semantic Network Diagram */}
              <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Share2 className="w-3.5 h-3.5 text-teal-400" />
                    Interactive Semantic Network Diagram
                  </span>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span> Entity
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Condition
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Rule / Outcome
                    </span>
                  </div>
                </div>

                {/* SVG Visual Graph */}
                <div className="w-full overflow-x-auto py-2">
                  <svg className="w-full min-w-[600px] h-48" viewBox="0 0 650 180">
                    <defs>
                      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                      </marker>
                    </defs>

                    {/* Edge 1: Proband -> Partner */}
                    <path d="M 120 70 L 250 70" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 3" markerEnd="url(#arrow)" />
                    <text x="185" y="60" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="monospace">partner_of</text>

                    {/* Edge 2: Proband -> Condition */}
                    <path d="M 120 95 L 360 135" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <text x="230" y="125" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="monospace">carrier_of / at_risk</text>

                    {/* Edge 3: Partner -> Condition */}
                    <path d="M 290 95 L 375 130" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />

                    {/* Edge 4: Condition -> Rule */}
                    <path d="M 440 135 L 530 85" stroke="#94a3b8" strokeWidth="1.5" markerEnd="url(#arrow)" />
                    <text x="495" y="120" fill="#cbd5e1" fontSize="10" textAnchor="middle" fontFamily="monospace">evaluated_by</text>

                    {/* Edge 5: Proband -> Patient Class */}
                    <path d="M 80 50 L 80 25 L 540 25 L 540 50" stroke="#64748b" strokeWidth="1" strokeDasharray="4 4" fill="none" />
                    <text x="310" y="20" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">consequent_triage</text>

                    {/* Node 1: Proband */}
                    <g transform="translate(40, 50)">
                      <rect width="80" height="40" rx="8" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.5" />
                      <text x="40" y="24" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">Proband</text>
                    </g>

                    {/* Node 2: Partner */}
                    <g transform="translate(250, 50)">
                      <rect width="80" height="40" rx="8" fill="#0f766e" stroke="#14b8a6" strokeWidth="1.5" />
                      <text x="40" y="24" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">Partner</text>
                    </g>

                    {/* Node 3: Condition / Trait */}
                    <g transform="translate(340, 120)">
                      <rect width="130" height="40" rx="8" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="65" y="24" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {activeCase?.badge || 'Clinical Trait'}
                      </text>
                    </g>

                    {/* Node 4: Decision Rule / Triage */}
                    <g transform="translate(520, 50)">
                      <rect width="110" height="40" rx="8" fill="#4338ca" stroke="#6366f1" strokeWidth="1.5" />
                      <text x="55" y="24" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {evaluation?.resultCategory || 'Triage'}
                      </text>
                    </g>
                  </svg>
                </div>
              </div>

              {/* Relational Triples Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Knowledge Base Relational Triples ⟨Subject, Predicate, Object⟩
                </span>
                <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 text-[10px] uppercase">
                      <tr>
                        <th className="p-2.5">Subject Entity</th>
                        <th className="p-2.5">Directed Semantic Relation (Arc)</th>
                        <th className="p-2.5">Object / Concept</th>
                        <th className="p-2.5">Relation Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                      {krData.triples.map((t, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">{t.subject}</td>
                          <td className="p-2.5 text-teal-600 dark:text-teal-400">--[{t.predicate}]--&gt;</td>
                          <td className="p-2.5 text-slate-700 dark:text-slate-300">{t.object}</td>
                          <td className="p-2.5">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-sans">
                              {t.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* PARADIGM 3: MINSKY FRAMES & SLOT-FILLER */}
          {(repSubTab === 'all' || repSubTab === 'frames') && (
            <Card className="p-6 space-y-5 border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Minsky Frames &amp; Slot-Filler Representation
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Object-oriented prototype frames structured with named slots, data types, constraints, and facets
                    </p>
                  </div>
                </div>
                <Badge variant="purple" size="sm">Frame Theory (Minsky 1974)</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {krData.frames.map((frame, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs space-y-3 p-4"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Box className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <h5 className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {frame.name}
                        </h5>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        is_a: {frame.parent}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-slate-800/60">
                          <tr>
                            <th className="p-1.5 font-mono">Slot</th>
                            <th className="p-1.5">Facet / Semantic</th>
                            <th className="p-1.5 font-mono">Type</th>
                            <th className="p-1.5 font-mono">Instantiated Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                          {frame.slots.map((s, sIdx) => (
                            <tr key={sIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                              <td className="p-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">{s.slot}</td>
                              <td className="p-1.5 text-slate-500 text-[10px]">{s.facet}</td>
                              <td className="p-1.5 font-mono text-purple-600 dark:text-purple-400 text-[10px]">{s.type}</td>
                              <td className="p-1.5 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{s.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* --- TAB 4: BACKWARD CHAINING GOAL INVESTIGATOR --- */}
      {activeTab === 'backward' && (
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Goal-Driven Reasoning Engine
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Backward Chaining Goal Investigator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                Test any clinical hypothesis or target conclusion against the knowledge base and current working memory. The engine traverses rules backwards from conclusion to required premises, verifying whether evidence exists or can be recursively established.
              </p>
            </div>

            {/* Interactive Goal Tester Form */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Hypothesis / Goal Fact:
                  </label>
                  <select
                    value={goalFact}
                    onChange={(e) => setGoalFact(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 font-mono"
                  >
                    <option value="dual_carrier_recessive_risk">dual_carrier_recessive_risk (Dual CFTR/Recessive Match)</option>
                    <option value="autosomal_dominant_pattern">autosomal_dominant_pattern (Dominant Transmission)</option>
                    <option value="early_onset_clustering">early_onset_clustering (Early Onset Clustering)</option>
                    <option value="consanguinity_risk_flag">consanguinity_risk_flag (Consanguinity Risk Flag)</option>
                    <option value="professional_review_recommended">professional_review_recommended (Review Indicator)</option>
                    <option value="maternal_age_guidance_indicated">maternal_age_guidance_indicated (Maternal Age Guidance)</option>
                    <option value="insufficient_information_flag">insufficient_information_flag (Uncertainty Flag)</option>
                    <option value="baseline_standard_risk">baseline_standard_risk (Standard Baseline Risk)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Expected Target Value:
                  </label>
                  <select
                    value={goalTargetValue ? 'true' : 'false'}
                    onChange={(e) => setGoalTargetValue(e.target.value === 'true')}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500 font-mono"
                  >
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </div>
              </div>

              <Button
                variant="brand"
                size="sm"
                onClick={handleQueryGoal}
                disabled={backwardLoading}
                className="w-full sm:w-auto"
              >
                {backwardLoading ? 'Investigating Goal...' : 'Query Goal Hypothesis'}
              </Button>
            </div>

            {/* Backward Chaining Proof Display */}
            {backwardProof && (
              <div className="space-y-4 pt-2">
                {/* Outcome Badge */}
                <div className={`p-4 rounded-xl border flex items-center justify-between ${
                  backwardProof.satisfied
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100'
                }`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {backwardProof.satisfied ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600" />
                      )}
                      <h4 className="text-sm font-bold">
                        Hypothesis {backwardProof.status || (backwardProof.satisfied ? 'PROVEN' : 'REFUTED')}:{' '}
                        <code className="font-mono">{backwardProof.goal} = {String(backwardProof.targetValue)}</code>
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {backwardProof.summary || (backwardProof.satisfied
                        ? 'All required premises were satisfied by base evidence or upstream rule derivations.'
                        : 'Required premise conditions could not be satisfied from available evidence.')}
                    </p>
                  </div>

                  <Badge variant={backwardProof.satisfied ? 'success' : 'danger'} size="md">
                    {backwardProof.satisfied ? 'PROVEN' : 'REFUTED'}
                  </Badge>
                </div>

                {/* Step-by-Step Proof Table */}
                {backwardProof.proofSteps && backwardProof.proofSteps.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Backward Chaining Proof Steps ({backwardProof.proofSteps.length})
                    </h5>

                    <div className="space-y-2">
                      {backwardProof.proofSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                              {step.step || idx + 1}
                            </span>
                            <div className="space-y-0.5 font-mono text-[11px]">
                              <div className="text-slate-800 dark:text-slate-200">
                                Check: <span className="text-brand-600 dark:text-brand-400 font-semibold">{step.requiredFact}</span> {step.operator} {String(step.expectedValue)}
                              </div>
                              <div className="text-slate-500 text-[10px]">
                                Actual Value: {String(step.actualValue)} {step.derivedFromRule ? `[Derived via rule ${step.derivedFromRule}]` : ''}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {step.satisfied ? (
                              <Badge variant="success" size="sm">Satisfied</Badge>
                            ) : (
                              <Badge variant="danger" size="sm">Unmet</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* --- TAB 5: EXPLAINABLE AI (XAI) & AUDIT SYNTHESIS --- */}
      {activeTab === 'xai' && (
        <div className="space-y-6">
          {/* Transparent Deduction Pipeline */}
          <Card className="p-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Explainability Guarantee
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Why did GeneTrace produce this assessment result?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Step-by-step causal deduction tracing patient inputs through rule conditions, intermediate derivations, and conflict resolution arbitration.
              </p>
            </div>

            {/* Visual Pipeline Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">1. Base Evidence</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {Object.keys(evaluation?.facts || {}).length} Facts Extracted
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">2. Premise Matching</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {evaluation?.triggeredRules?.length || 0} Rules Triggered
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">3. Derived Knowledge</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {Object.keys(evaluation?.derivedFacts || {}).length} Inferred Facts
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">4. Conflict Resolution</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {evaluation?.conflictResolution?.winningRuleCode || 'Baseline'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 space-y-1">
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">5. Final Guidance</span>
                <p className="text-xs font-bold text-brand-700 dark:text-brand-300">
                  {evaluation?.resultCategory}
                </p>
              </div>
            </div>

            {/* Conflict Resolution Audit Card */}
            {evaluation?.conflictResolution && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-indigo-500" />
                    Conflict Resolution Decision Audit
                  </h4>
                  <Badge variant="purple" size="sm">
                    {evaluation.conflictResolution.strategy}
                  </Badge>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {evaluation.conflictResolution.rationale}
                </p>

                {/* Candidate Rules Comparison Table */}
                {evaluation.conflictResolution.candidatesEvaluated?.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      Competing Candidate Rules Evaluated:
                    </span>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 text-[10px] uppercase">
                          <tr>
                            <th className="p-2">Rule Code</th>
                            <th className="p-2">Rule Name</th>
                            <th className="p-2">Category Weight</th>
                            <th className="p-2">Numerical Priority</th>
                            <th className="p-2">Outcome Tier</th>
                            <th className="p-2">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {evaluation.conflictResolution.candidatesEvaluated.map((cand, i) => {
                            const isWinner = cand.ruleCode === evaluation.conflictResolution.winningRuleCode;
                            return (
                              <tr key={i} className={isWinner ? 'bg-emerald-50/50 dark:bg-emerald-950/20 font-semibold' : ''}>
                                <td className="p-2 font-mono text-[11px]">{cand.ruleCode}</td>
                                <td className="p-2 text-slate-800 dark:text-slate-200">{cand.name}</td>
                                <td className="p-2 font-mono">{cand.categoryWeight}</td>
                                <td className="p-2 font-mono">{cand.priority}</td>
                                <td className="p-2">{cand.resultCategory}</td>
                                <td className="p-2">
                                  {isWinner ? (
                                    <Badge variant="success" size="sm">Dominant Winner</Badge>
                                  ) : (
                                    <Badge variant="neutral" size="sm">Subsumed</Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Clinical Guidance Recommendations */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Actionable Clinical Recommendations ({evaluation?.guidance?.length || 0})
              </h4>
              <ul className="space-y-2">
                {(evaluation?.guidance || []).map((item, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Non-Directive Clinical Disclaimer */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Clinical Notice &amp; Regulatory Scope:</strong> {evaluation?.disclaimer}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
