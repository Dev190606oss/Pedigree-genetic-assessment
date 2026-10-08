import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Cpu,
  GitMerge,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Info,
  ListChecks,
  Layers,
  Search,
  Check,
  Activity,
  Users
} from 'lucide-react';

export const AssessmentView = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [counselorNotes, setCounselorNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [showInferenceTrace, setShowInferenceTrace] = useState(true);
  const [showBackwardChaining, setShowBackwardChaining] = useState(true);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const res = await api.get(`/assessments/${id}`);
        if (res.data.success) {
          setAssessment(res.data.data);
          // Also fetch counselor case notes if available
          if (res.data.data.familyId?._id) {
            try {
              const caseRes = await api.get(`/counselor/cases/${res.data.data.familyId._id}`);
              if (caseRes.data.success) {
                setCounselorNotes(caseRes.data.data.notes || []);
              }
            } catch {
              // Non-counselor might get 403 on counselor endpoint, which is normal
            }
          }
        }
      } catch (err) {
        setError('Failed to load assessment report.');
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/reports/assessment/${id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedigree-report-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 dark:text-slate-500">Loading assessment evaluation...</div>;
  }

  if (!assessment) {
    return <Alert type="danger">Assessment record not found.</Alert>;
  }

  const categoryStyles = {
    COUNSELOR_REVIEW: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200',
    REVIEW_RECOMMENDED: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200',
    INFORMATIONAL: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-900 text-sky-900 dark:text-sky-200',
    INSUFFICIENT_INFORMATION: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200'
  };

  // Extract facts as normalized plain objects
  const rawFacts = assessment.facts || {};
  const factsObj = rawFacts instanceof Map ? Object.fromEntries(rawFacts) : (typeof rawFacts.toJSON === 'function' ? rawFacts.toJSON() : rawFacts);
  
  const rawDerived = assessment.derivedFacts || {};
  const derivedFactsObj = rawDerived instanceof Map ? Object.fromEntries(rawDerived) : (typeof rawDerived.toJSON === 'function' ? rawDerived.toJSON() : rawDerived);

  const inferenceTrace = assessment.inferenceTrace || { passes: [], totalPasses: 0 };
  const backwardChaining = assessment.backwardChaining || null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/user/dashboard" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              Preconception Health Assessment
            </h1>
            <Badge variant="brand" size="sm">Decision Engine v{assessment.engineVersion || '2.0.0'}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Evaluated on {new Date(assessment.createdAt).toLocaleString()} for {assessment.familyId?.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {assessment.familyId?._id && (
            <Link to={`/user/families/${assessment.familyId._id}/pedigree`}>
              <Button variant="secondary" size="sm">
                <GitMerge className="w-3.5 h-3.5 mr-1" /> View Pedigree
              </Button>
            </Link>
          )}
          <Button
            onClick={handleDownloadPDF}
            loading={downloading}
            variant="primary"
            size="sm"
            className="shadow-md shadow-brand-600/20"
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Download PDF Report
          </Button>
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Outcome Category Banner */}
      <div className={`p-6 rounded-2xl border ${categoryStyles[assessment.resultCategory] || categoryStyles.INFORMATIONAL}`}>
        <div className="space-y-3">
          <Badge variant={assessment.resultCategory} size="lg">
            {assessment.resultCategory.replace(/_/g, ' ')}
          </Badge>
          <h2 className="text-lg font-bold">Executive Assessment Summary</h2>
          <p className="text-xs sm:text-sm leading-relaxed max-w-3xl">
            {assessment.summary}
          </p>
        </div>
      </div>

      {/* 1. Information Identified (Extracted Base Facts) */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Information Identified from Family Data
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verified facts extracted from your recorded family members and health entries
            </p>
          </div>
          <Badge variant="neutral" size="sm">Base Evidence</Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Family Members</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {factsObj.total_members ?? 0}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Relatives Affected</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {factsObj.affected_members ?? (factsObj.condition_present ? 1 : 0)}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Generations Affected</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {factsObj.affected_generations ?? 0}
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Carrier Statuses</span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {factsObj.carrier_count ?? 0}
            </span>
          </div>
        </div>

        {/* Observed Health History Flags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300">Parent Health History Present</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${factsObj.affected_parent || factsObj.parent_history_present ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              {factsObj.affected_parent || factsObj.parent_history_present ? 'Yes' : 'None reported'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300">Sibling Health History Present</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${factsObj.affected_sibling || factsObj.sibling_history_present ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              {factsObj.affected_sibling || factsObj.sibling_history_present ? 'Yes' : 'None reported'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300">Grandparent History Present</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${factsObj.affected_grandparent ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
              {factsObj.affected_grandparent ? 'Yes' : 'None reported'}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-slate-700 dark:text-slate-300">Consanguinity / Related Partners</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${factsObj.consanguinity_reported ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'}`}>
              {factsObj.consanguinity_reported ? 'Reported' : 'None reported'}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Assessment Factors (Triggered Rules) */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Assessment Factors Identified ({assessment.triggeredRules?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Specific health indicators established based on your family data
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-brand-700 dark:text-brand-300 font-semibold bg-brand-50 dark:bg-brand-950/60 px-2.5 py-1 rounded-lg">
            <Cpu className="w-3.5 h-3.5" /> Transparent Logic
          </div>
        </div>

        {assessment.triggeredRules?.length === 0 ? (
          <div className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center space-y-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Standard Baseline Health Indicators
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No elevated risk factors or familial health patterns met triggering criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessment.triggeredRules.map((tr, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                  <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    [{tr.ruleCode}] {tr.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      Priority: {tr.priority}
                    </span>
                    <Badge variant={tr.resultCategory} size="sm">
                      {tr.resultCategory?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 text-slate-700 dark:text-slate-300">
                  <p className="leading-relaxed">
                    <strong className="text-slate-900 dark:text-slate-100">Health Rationale:</strong> {tr.explanation}
                  </p>
                  {tr.conclusion?.fact && (
                    <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">Derived Finding:</span>
                      <code className="px-1.5 py-0.5 bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 rounded font-mono">
                        {tr.conclusion.fact} = {String(tr.conclusion.value)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Forward Chaining Inference Trace */}
      {inferenceTrace.passes && inferenceTrace.passes.length > 0 && (
        <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                How Your Assessment Was Reached (Multi-Pass Reasoning)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Step-by-step forward evaluation showing how initial family entries led to conclusions
              </p>
            </div>
            <button
              onClick={() => setShowInferenceTrace(!showInferenceTrace)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showInferenceTrace ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showInferenceTrace ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showInferenceTrace && (
            <div className="space-y-4 pt-1">
              {inferenceTrace.passes.map((pass, pIdx) => {
                const derivedKeys = pass.newFactsDerived ? Object.keys(pass.newFactsDerived) : [];
                return (
                  <div key={pIdx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center">
                          {pass.passNumber}
                        </span>
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {pass.passNumber === 1
                            ? 'Pass 1: Evaluation of Base Family Observations'
                            : pass.rulesTriggered?.length > 0
                            ? `Pass ${pass.passNumber}: Higher-Level Pattern Synthesis`
                            : `Pass ${pass.passNumber}: Logical Fixed Point Reached`}
                        </span>
                      </div>
                      <Badge variant="neutral" size="sm">
                        {pass.rulesTriggered?.length || 0} Rule(s) Triggered
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-2 pl-8">
                      {pass.rulesTriggered?.length > 0 ? (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Rules Activated: </span>
                          <span className="font-mono text-[11px] text-brand-700 dark:text-brand-300">
                            {pass.rulesTriggered.join(', ')}
                          </span>
                        </div>
                      ) : (
                        <p className="italic text-slate-400">
                          No additional rules fired. All logical consequences verified.
                        </p>
                      )}

                      {derivedKeys.length > 0 && (
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300 block mb-1">
                            Newly Established Facts in this Pass:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {derivedKeys.map((k) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-mono text-[11px] border border-emerald-200/60 dark:border-emerald-800/60"
                              >
                                {k}: {String(pass.newFactsDerived[k])}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* 4. Backward Chaining Explanation: "Why this result?" */}
      {backwardChaining && backwardChaining.proofSteps && backwardChaining.proofSteps.length > 0 && (
        <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                Why this result? (Goal Verification Proof)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Goal-driven audit trail verifying the chain of evidence supporting the primary recommendation
              </p>
            </div>
            <button
              onClick={() => setShowBackwardChaining(!showBackwardChaining)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {showBackwardChaining ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showBackwardChaining ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {showBackwardChaining && (
            <div className="space-y-4 pt-1">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/70 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Target Clinical Finding:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100 ml-2">
                    {backwardChaining.goal} = {String(backwardChaining.targetValue)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Conclusion Satisfied by Evidence</span>
                </div>
              </div>

              <div className="space-y-2">
                {backwardChaining.proofSteps.map((step, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center">
                          {step.step || sIdx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {step.ruleCode ? `[${step.ruleCode}] ${step.ruleName}` : 'Base Observation Requirement'}
                        </span>
                      </div>
                      <div className="pl-7 text-slate-600 dark:text-slate-400 space-y-1">
                        <div>
                          Required Condition: <code className="font-mono text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{step.requiredFact} {step.operator} {String(step.expectedValue)}</code>
                        </div>
                        <div>
                          Actual Value from Family Data: <code className="font-mono text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-1 py-0.5 rounded">{String(step.actualValue)}</code>
                        </div>
                        {step.derivedFromRule && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            (Derived via upstream rule <strong className="text-slate-700 dark:text-slate-300 font-mono">[{step.derivedFromRule}]</strong>)
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="sm:self-center pl-7 sm:pl-0">
                      {step.satisfied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                          <Check className="w-3 h-3" /> Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          Not Met
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 5. Recommended Guidance & Preconception Next Steps */}
      <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Recommended Guidance & Preconception Next Steps
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
          {assessment.guidance?.map((g, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{g}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* 6. Counselor Review & Notes Section */}
      {counselorNotes.length > 0 && (
        <Card className="p-6 space-y-4 border-sky-200 dark:border-sky-900/60 bg-sky-50/20 dark:bg-sky-950/20">
          <div className="flex items-center gap-2 border-b border-sky-100 dark:border-sky-900/40 pb-3 text-sky-900 dark:text-sky-200">
            <Stethoscope className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h3 className="font-bold text-sm">Genetic Counselor Clinical Review</h3>
          </div>
          <div className="space-y-3">
            {counselorNotes.map((cn) => (
              <div key={cn._id} className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-sky-100 dark:border-sky-900/40 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cn.counselorId?.name || 'Genetic Counselor'}</span>
                  <span>{new Date(cn.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{cn.note}</p>
                {cn.recommendation && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <strong className="text-sky-900 dark:text-sky-300">Formal Clinical Recommendation:</strong>
                    <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">{cn.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. Mandatory Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Important Health Notice:</strong> {assessment.disclaimer}
        </div>
      </div>
    </div>
  );
};
