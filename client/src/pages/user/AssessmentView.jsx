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
  ShieldCheck
} from 'lucide-react';

export const AssessmentView = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [counselorNotes, setCounselorNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

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
    return <div className="p-12 text-center text-slate-400">Loading assessment evaluation...</div>;
  }

  if (!assessment) {
    return <Alert type="danger">Assessment record not found.</Alert>;
  }

  const categoryStyles = {
    COUNSELOR_REVIEW: 'bg-rose-50 border-rose-200 text-rose-900',
    REVIEW_RECOMMENDED: 'bg-amber-50 border-amber-200 text-amber-900',
    INFORMATIONAL: 'bg-sky-50 border-sky-200 text-sky-900',
    INSUFFICIENT_INFORMATION: 'bg-slate-100 border-slate-300 text-slate-800'
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/user/dashboard" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900">
              Preconception Assessment Outcome
            </h1>
            <Badge variant="brand" size="sm">AIES v{assessment.engineVersion}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
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

      {/* Triggered Rules & Transparent Reasoning */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Triggered Decision-Support Rules ({assessment.triggeredRules?.length || 0})
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic inference explaining why this risk classification was reached
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
            <Cpu className="w-3.5 h-3.5" /> Explainable AIES
          </div>
        </div>

        {assessment.triggeredRules?.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-4 text-center">
            No specific genetic alert rules met triggering criteria.
          </p>
        ) : (
          <div className="space-y-3">
            {assessment.triggeredRules.map((tr, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">
                    [{tr.ruleCode}] {tr.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">
                      Priority: {tr.priority}
                    </span>
                    <Badge variant={tr.resultCategory} size="sm">
                      {tr.resultCategory?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-700 leading-relaxed">
                    <strong className="text-slate-900">Clinical Reasoning:</strong> {tr.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recommended Educational Guidance */}
      <Card className="p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
          Recommended Guidance & Preconception Next Steps
        </h3>
        <ul className="space-y-2.5 text-xs text-slate-700">
          {assessment.guidance?.map((g, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{g}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Genetic Counselor Review & Notes Section */}
      {counselorNotes.length > 0 && (
        <Card className="p-6 space-y-4 border-sky-200 bg-sky-50/20">
          <div className="flex items-center gap-2 border-b border-sky-100 pb-3 text-sky-900">
            <Stethoscope className="w-5 h-5 text-sky-600" />
            <h3 className="font-bold text-sm">Genetic Counselor Clinical Review</h3>
          </div>
          <div className="space-y-3">
            {counselorNotes.map((cn) => (
              <div key={cn._id} className="p-4 bg-white rounded-xl border border-sky-100 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span className="font-bold text-slate-800">{cn.counselorId?.name || 'Genetic Counselor'}</span>
                  <span>{new Date(cn.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-700">{cn.note}</p>
                {cn.recommendation && (
                  <div className="pt-2 border-t border-slate-100">
                    <strong className="text-sky-900">Formal Clinical Recommendation:</strong>
                    <p className="text-slate-700 mt-0.5">{cn.recommendation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Mandatory Non-Diagnostic Disclaimer */}
      <div className="p-4 bg-slate-100 rounded-xl text-[11px] text-slate-500 border border-slate-200 leading-relaxed flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Mandatory Academic Disclaimer:</strong> {assessment.disclaimer}
        </div>
      </div>
    </div>
  );
};
