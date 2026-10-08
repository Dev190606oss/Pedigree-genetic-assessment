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
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-700 to-teal-800 rounded-3xl p-8 text-white shadow-lg shadow-brand-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge variant="default" size="sm" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            Patient Portal
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
            Record your family tree, map hereditary health conditions, and generate transparent rule-based preconception risk assessments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {latestFamily ? (
            <Link to={`/user/families/${latestFamily._id}/builder?step=6`}>
              <Button size="md" className="!bg-white !text-brand-800 hover:!bg-brand-50 shadow-md">
                <Sparkles className="w-4 h-4 mr-1.5 text-brand-600" /> Continue Assessment
              </Button>
            </Link>
          ) : (
            <Link to="/user/families/new">
              <Button size="md" className="!bg-white !text-brand-800 hover:!bg-brand-50 shadow-md">
                <PlusCircle className="w-4 h-4 mr-1.5 text-brand-600" /> Create Family Case
              </Button>
            </Link>
          )}

          {latestFamily && (
            <Link to={`/user/families/${latestFamily._id}/pedigree`}>
              <Button size="md" variant="secondary" className="!bg-brand-800/40 !border-white/20 !text-white hover:!bg-brand-800/60">
                <GitMerge className="w-4 h-4 mr-1.5" /> View Pedigree
              </Button>
            </Link>
          )}
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Family Cases</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{families.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Evaluations Run</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{recentAssessments.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pedigree Status</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {latestFamily ? 'Diagram Ready' : 'Awaiting Data'}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Latest Outcome</p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
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
