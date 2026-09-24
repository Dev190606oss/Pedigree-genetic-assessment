import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { History, Download, ArrowRight, Calendar, Users, FileText } from 'lucide-react';

export const AssessmentHistory = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const famRes = await api.get('/families');
        if (famRes.data.success && famRes.data.data.length > 0) {
          // Fetch assessments for all user's families
          const allAssessments = [];
          for (const fam of famRes.data.data) {
            const aRes = await api.get(`/assessments/family/${fam._id}`);
            if (aRes.data.success) {
              aRes.data.data.forEach(item => {
                allAssessments.push({ ...item, familyName: fam.name });
              });
            }
          }
          allAssessments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setAssessments(allAssessments);
        }
      } catch (err) {
        setError('Failed to load assessment history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDownloadPDF = async (assessmentId) => {
    try {
      const response = await api.get(`/reports/assessment/${assessmentId}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedigree-report-${assessmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assessment History</h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical record of all evaluated preconception expert system assessments
        </p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading historical evaluations...</div>
      ) : assessments.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Assessment History Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't run any expert system evaluations yet. Open one of your family cases to trigger an assessment.
          </p>
          <Link to="/user/families">
            <Button size="sm">Go to Family Cases</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {assessments.map(item => (
            <Card key={item._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Badge variant={item.resultCategory} size="md">
                    {item.resultCategory?.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs font-bold text-slate-800">
                    {item.familyName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">{item.summary}</p>
                <div className="flex items-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.createdAt).toLocaleString()}
                  </span>
                  <span>•</span>
                  <span>{item.triggeredRules?.length || 0} rule(s) fired</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => handleDownloadPDF(item._id)}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> PDF
                </Button>
                <Link to={`/user/assessments/${item._id}`}>
                  <Button variant="primary" size="sm">
                    View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
