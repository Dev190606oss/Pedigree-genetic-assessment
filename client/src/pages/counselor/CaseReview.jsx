import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { PedigreeGraph } from '../../features/pedigree/PedigreeGraph';
import {
  Stethoscope,
  ArrowLeft,
  Download,
  CheckCircle2,
  Calendar,
  Send,
  MessageSquare,
  FileCheck2,
  Cpu,
  Sparkles
} from 'lucide-react';

export const CaseReview = () => {
  const { familyId } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Note form state
  const [noteText, setNoteText] = useState('');
  const [recommendationText, setRecommendationText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [status, setStatus] = useState('IN_REVIEW');

  const fetchCaseDetails = async () => {
    try {
      const res = await api.get(`/counselor/cases/${familyId}`);
      if (res.data.success) {
        setCaseData(res.data.data);
        if (res.data.data.assignment?.status) {
          setStatus(res.data.data.assignment.status);
        }
      }
    } catch (err) {
      setError('Failed to load case review data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [familyId]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText) return;
    setSubmittingNote(true);

    try {
      const latestAssessmentId = caseData.assessments?.[0]?._id;
      const res = await api.post(`/counselor/cases/${familyId}/notes`, {
        assessmentId: latestAssessmentId,
        note: noteText,
        recommendation: recommendationText
      });

      if (res.data.success) {
        setNoteText('');
        setRecommendationText('');
        fetchCaseDetails();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit clinical note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      await api.patch(`/counselor/cases/${familyId}/status`, { status: newStatus });
      fetchCaseDetails();
    } catch (err) {
      alert('Failed to update case status.');
    }
  };

  const handleQuickFillClinicalNote = () => {
    const triggered = caseData?.assessments?.[0]?.triggeredRules || [];
    const ruleCodes = triggered.map(r => r.ruleCode);

    if (ruleCodes.includes('RULE-AR-01') || ruleCodes.includes('RULE-CONS-01')) {
      setNoteText('Reviewed 3-generation pedigree. Both prospective parents are confirmed heterozygous carriers for Cystic Fibrosis (CFTR c.1521_1523delCTT). 2nd-degree consanguinity verified between partners. High baseline probability (25% recurrence risk) for clinical manifestation in offspring.');
      setRecommendationText('1. Urgent pre-test and post-test genetic counseling with certified counselor.\n2. Discuss pre-implantation genetic diagnosis (PGT-M) and prenatal diagnostic options.\n3. Recommend targeted expanded carrier screening for extended family relatives.');
    } else if (ruleCodes.includes('RULE-AD-01') || ruleCodes.includes('RULE-MULTI-01')) {
      setNoteText('Pedigree confirms Autosomal Dominant vertical transmission across 3 successive generations with early-onset manifestation (<50 years) for Huntington Disease. Proband currently asymptomatic with 50% prior risk of carrying the dominant CAG repeat expansion.');
      setRecommendationText('1. Follow established genetic counseling protocol for pre-symptomatic predictive testing.\n2. Baseline neurological evaluation.\n3. Preconception consultation regarding PGT-M or gamete donation reproductive options.');
    } else if (ruleCodes.includes('RULE-XL-01')) {
      setNoteText('Pedigree demonstrates classic X-linked recessive criss-cross inheritance. Maternal grandfather was affected with severe Hemophilia A (HEMA-F8). Biological mother is a confirmed carrier. Offspring transmission risks explained.');
      setRecommendationText('1. Preconception genetic consultation regarding non-invasive prenatal fetal sex determination.\n2. Partner carrier screening for Factor VIII variants.\n3. Delivery management coordination with clinical hematology team.');
    } else if (ruleCodes.includes('R09')) {
      setNoteText('Proband was adopted in infancy with zero documented biological family health records. Open-world knowledge boundary applies: absence of recorded disease must not be misconstrued as low genetic risk.');
      setRecommendationText('1. Comprehensive pan-ethnic expanded carrier screening (ECS) recommended prior to conception.\n2. Standard baseline maternal health and obstetrical evaluation.\n3. Re-evaluate if biological lineage documentation becomes accessible.');
    } else {
      setNoteText('Comprehensive pedigree and clinical history review completed. No high-risk Mendelian conditions, consanguineous unions, or early-onset familial disease clusters identified in recorded lineage.');
      setRecommendationText('1. Maintain standard preconception folic acid supplementation (400 mcg daily).\n2. Standard population-level carrier screening and routine prenatal care.');
    }
    setStatus('REVIEWED');
  };

  const handleDownloadPDF = async () => {
    const latestAssessmentId = caseData?.assessments?.[0]?._id;
    if (!latestAssessmentId) return alert('No assessment found for this case.');

    try {
      const response = await api.get(`/reports/assessment/${latestAssessmentId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `counselor-report-${latestAssessmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to generate clinical report.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 dark:text-slate-500">Loading case file...</div>;
  }

  const family = caseData?.family;
  const members = caseData?.members || [];
  const relationships = caseData?.relationships || [];
  const conditions = caseData?.conditions || [];
  const latestAssessment = caseData?.assessments?.[0];
  const notes = caseData?.notes || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/counselor/cases" className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{family?.name}</h1>
            <Badge variant="info" size="sm">Case #{family?._id.slice(-6)}</Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{family?.ownerId?.name}</span> ({family?.ownerId?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="PENDING">PENDING</option>
              <option value="IN_REVIEW">IN_REVIEW</option>
              <option value="REVIEWED">REVIEWED</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>

          <Button
            onClick={handleDownloadPDF}
            variant="secondary"
            size="sm"
            disabled={!latestAssessment}
          >
            <Download className="w-3.5 h-3.5 mr-1" /> Download PDF
          </Button>
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Interactive Pedigree Review */}
      <Card className="p-4 space-y-3 border-sky-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Pedigree Visual Review</h2>
            <Badge variant="brand" size="sm">{members.length} Members</Badge>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Click symbols to inspect member records</span>
        </div>

        <PedigreeGraph
          members={members}
          relationships={relationships}
          conditions={conditions}
        />
      </Card>

      {/* Two Column Section: Assessment Evaluation & Counselor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Clinical Decision Support Evaluation Breakdown */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Clinical Decision Support Evaluation</h3>
              {latestAssessment && (
                <Badge variant={latestAssessment.resultCategory} size="md">
                  {latestAssessment.resultCategory.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>

            {latestAssessment ? (
              <div className="space-y-4 text-xs">
                <div>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase tracking-wider block text-[10px] mb-1">
                    System Classification Summary
                  </strong>
                  <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {latestAssessment.summary}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase tracking-wider block text-[10px] mb-2">
                    Triggered Rules & Reasoning ({latestAssessment.triggeredRules?.length || 0})
                  </strong>
                  <div className="space-y-2">
                    {latestAssessment.triggeredRules?.map((tr, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/80 dark:border-slate-700">
                        <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 mb-1">
                          <span>[{tr.ruleCode}] {tr.name}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">Priority {tr.priority}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">{tr.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <strong className="text-slate-800 dark:text-slate-200 uppercase tracking-wider block text-[10px] mb-1">
                    System Guidance
                  </strong>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {latestAssessment.guidance?.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-600 dark:text-brand-400">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No assessment has been run yet for this family.</p>
            )}
          </Card>
        </div>

        {/* Right: Counselor Clinical Notes Form & History */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4 border-sky-200 dark:border-sky-900/60">
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-sky-900/40 pb-3 text-sky-900 dark:text-sky-200">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className="font-bold text-sm">Add Clinical Notes & Recommendations</h3>
              </div>
              <button
                type="button"
                onClick={handleQuickFillClinicalNote}
                className="text-xs text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 font-medium flex items-center gap-1 px-2.5 py-1 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 rounded-lg border border-sky-200 dark:border-sky-800 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-500" /> Quick-Fill Sample Note
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Observation / Case Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record your observations on generational transmission, penetrance, expressivity..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Formal Clinical Recommendation
                </label>
                <textarea
                  rows={2}
                  value={recommendationText}
                  onChange={(e) => setRecommendationText(e.target.value)}
                  placeholder="e.g. Expanded partner carrier screening, PGT-M consultation, targeted variant testing..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  loading={submittingNote}
                  className="!bg-sky-600 hover:!bg-sky-700"
                >
                  <Send className="w-3.5 h-3.5 mr-1" /> Save Clinical Note
                </Button>
              </div>
            </form>
          </Card>

          {/* Previous Clinical Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Documented Clinical Notes ({notes.length})
            </h4>

            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No notes recorded yet for this case.</p>
            ) : (
              notes.map((n) => (
                <Card key={n._id} className="p-4 space-y-2 text-xs border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] border-b border-slate-100 dark:border-slate-800 pb-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{n.counselorId?.name || 'Counselor'}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{n.note}</p>
                  {n.recommendation && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-sky-900 dark:text-sky-300 bg-sky-50/50 dark:bg-sky-950/40 p-2 rounded-lg">
                      <strong className="block text-[11px] mb-0.5">Formal Recommendation:</strong>
                      <p className="text-slate-700 dark:text-slate-300">{n.recommendation}</p>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
