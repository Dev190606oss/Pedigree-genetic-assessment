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
  Cpu
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
    return <div className="p-12 text-center text-slate-400">Loading case file...</div>;
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
            <Link to="/counselor/cases" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900">{family?.name}</h1>
            <Badge variant="info" size="sm">Case #{family?._id.slice(-6)}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Patient: <span className="font-semibold text-slate-800">{family?.ownerId?.name}</span> ({family?.ownerId?.email})
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500"
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
      <Card className="p-4 space-y-3 border-sky-100 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Pedigree Visual Review</h2>
            <Badge variant="brand" size="sm">{members.length} Members</Badge>
          </div>
          <span className="text-[11px] text-slate-400">Click symbols to inspect member records</span>
        </div>

        <PedigreeGraph
          members={members}
          relationships={relationships}
          conditions={conditions}
        />
      </Card>

      {/* Two Column Section: Assessment Evaluation & Counselor Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: AIES Evaluation Breakdown */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">AIES Expert Evaluation</h3>
              {latestAssessment && (
                <Badge variant={latestAssessment.resultCategory} size="md">
                  {latestAssessment.resultCategory.replace(/_/g, ' ')}
                </Badge>
              )}
            </div>

            {latestAssessment ? (
              <div className="space-y-4 text-xs">
                <div>
                  <strong className="text-slate-800 uppercase tracking-wider block text-[10px] mb-1">
                    System Classification Summary
                  </strong>
                  <p className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 leading-relaxed">
                    {latestAssessment.summary}
                  </p>
                </div>

                <div>
                  <strong className="text-slate-800 uppercase tracking-wider block text-[10px] mb-2">
                    Triggered Rules & Reasoning ({latestAssessment.triggeredRules?.length || 0})
                  </strong>
                  <div className="space-y-2">
                    {latestAssessment.triggeredRules?.map((tr, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                        <div className="flex items-center justify-between font-bold text-slate-800 mb-1">
                          <span>[{tr.ruleCode}] {tr.name}</span>
                          <span className="text-[10px] text-slate-400">Priority {tr.priority}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px]">{tr.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <strong className="text-slate-800 uppercase tracking-wider block text-[10px] mb-1">
                    System Guidance
                  </strong>
                  <ul className="space-y-1.5 text-slate-600">
                    {latestAssessment.guidance?.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-brand-600">•</span>
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No assessment has been run yet for this family.</p>
            )}
          </Card>
        </div>

        {/* Right: Counselor Clinical Notes Form & History */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4 border-sky-200">
            <div className="flex items-center gap-2 border-b border-sky-100 pb-3 text-sky-900">
              <Stethoscope className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm">Add Clinical Notes & Recommendations</h3>
            </div>

            <form onSubmit={handleAddNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinical Observation / Case Note *
                </label>
                <textarea
                  rows={3}
                  required
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Record your observations on generational transmission, penetrance, expressivity..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Formal Clinical Recommendation
                </label>
                <textarea
                  rows={2}
                  value={recommendationText}
                  onChange={(e) => setRecommendationText(e.target.value)}
                  placeholder="e.g. Expanded partner carrier screening, PGT-M consultation, targeted variant testing..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Documented Clinical Notes ({notes.length})
            </h4>

            {notes.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No notes recorded yet for this case.</p>
            ) : (
              notes.map((n) => (
                <Card key={n._id} className="p-4 space-y-2 text-xs border-slate-200">
                  <div className="flex items-center justify-between text-slate-500 text-[11px] border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-800">{n.counselorId?.name || 'Counselor'}</span>
                    <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{n.note}</p>
                  {n.recommendation && (
                    <div className="pt-2 border-t border-slate-100 text-sky-900 bg-sky-50/50 p-2 rounded-lg">
                      <strong className="block text-[11px] mb-0.5">Formal Recommendation:</strong>
                      <p className="text-slate-700">{n.recommendation}</p>
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
