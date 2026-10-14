import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import {
  Users,
  GitMerge,
  Activity,
  FileText,
  PlusCircle,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const UserDashboard = () => {
  const { user } = useAuth();
  const [families, setFamilies] = useState([]);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [familiesRes, notifRes] = await Promise.all([
          api.get('/families'),
          api.get('/notifications')
        ]);

        if (familiesRes.data.success) {
          setFamilies(familiesRes.data.data);
          // If there is an active family, fetch its latest assessments
          if (familiesRes.data.data.length > 0) {
            const firstFamId = familiesRes.data.data[0]._id;
            const assessRes = await api.get(`/assessments/family/${firstFamId}`);
            if (assessRes.data.success) {
              setRecentAssessments(assessRes.data.data.slice(0, 5));
            }
          }
        }
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const latestFamily = families[0];
  const latestAssessment = recentAssessments[0];

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
    <div className="space-y-8">
      {/* Clinical Workspace Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60">
              Patient Clinical Record
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Welcome, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Record your family history, map hereditary health conditions, and generate explainable rule-based preconception risk guidance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {latestFamily ? (
            <Link to={`/user/families/${latestFamily._id}/builder?step=6`}>
              <Button size="sm">
                Continue Evaluation
              </Button>
            </Link>
          ) : (
            <Link to="/user/families/new">
              <Button size="sm">
                <PlusCircle className="w-4 h-4 mr-1.5" /> Create Family Case
              </Button>
            </Link>
          )}

          {latestFamily && (
            <Link to={`/user/families/${latestFamily._id}/pedigree`}>
              <Button size="sm" variant="secondary">
                <GitMerge className="w-4 h-4 mr-1.5" /> View Pedigree
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center border border-brand-200/50 dark:border-brand-800/50">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Family Cases</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{families.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Evaluations Run</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{recentAssessments.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200/50 dark:border-sky-800/50">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pedigree Status</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {latestFamily ? 'Diagram Ready' : 'Awaiting Data'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Latest Outcome</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
              {latestAssessment ? latestAssessment.resultCategory.replace(/_/g, ' ') : 'Not yet evaluated'}
            </p>
          </div>
        </Card>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Family Cases */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">My Family Cases</h2>
            <Link to="/user/families/new" className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-semibold flex items-center gap-1">
              <PlusCircle className="w-3.5 h-3.5" /> Add New Family
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">Loading family records...</div>
          ) : families.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">You haven't recorded any family cases yet.</p>
              <Link to="/user/families/new">
                <Button size="sm">Get Started with Family Builder</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {families.map(fam => (
                <Card key={fam._id} hover className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{fam.name}</h3>
                      <Badge variant="brand" size="sm">{fam.status}</Badge>
                    </div>
                    {fam.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md line-clamp-1">{fam.description}</p>
                    )}
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Updated {new Date(fam.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/user/families/${fam._id}/pedigree`}>
                      <Button variant="secondary" size="sm">
                        <GitMerge className="w-3.5 h-3.5 mr-1" /> Pedigree
                      </Button>
                    </Link>
                    <Link to={`/user/families/${fam._id}/builder`}>
                      <Button variant="primary" size="sm">
                        Open Builder <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Latest Assessment Summary */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Latest Assessment</h2>

          {latestAssessment ? (
            <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant={latestAssessment.resultCategory} size="md">
                    {latestAssessment.resultCategory.replace(/_/g, ' ')}
                  </Badge>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(latestAssessment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Assessment Summary</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {latestAssessment.summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {latestAssessment.triggeredRules?.length || 0} Genetic Rule(s) Evaluated
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link to={`/user/assessments/${latestAssessment._id}`} className="w-full">
                  <Button variant="secondary" size="sm" className="w-full">
                    View Complete Explanation <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
                <Button
                  onClick={() => handleDownloadPDF(latestAssessment._id)}
                  variant="primary"
                  size="sm"
                  className="w-full"
                >
                  <Download className="w-3.5 h-3.5 mr-1" /> Download PDF Report
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p>No assessment has been evaluated yet for your family case.</p>
              {latestFamily && (
                <Link to={`/user/families/${latestFamily._id}/builder?step=6`}>
                  <Button size="sm" variant="secondary" className="mt-2">
                    Run Assessment Now
                  </Button>
                </Link>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
