import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import {
  Users,
  Stethoscope,
  Activity,
  Cpu,
  ShieldAlert,
  BarChart2,
  TrendingUp,
  FileText
} from 'lucide-react';

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.data);
        }
      } catch (err) {
        setError('Failed to load system analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="space-y-8">
      {/* Governance Workspace Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
              System Administration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Administrator Governance Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Monitor system-wide preconception assessment activity, manage genetic counselors and user accounts, and govern the clinical rules knowledge base.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/rules">
            <Button size="sm">
              <Cpu className="w-4 h-4 mr-1.5" /> Clinical Rules Knowledge Base
            </Button>
          </Link>
          <Link to="/admin/audit-logs">
            <Button size="sm" variant="secondary">
              <ShieldAlert className="w-4 h-4 mr-1.5" /> Audit Logs
            </Button>
          </Link>
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
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Patient Accounts</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{analytics?.totalUsers || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200/50 dark:border-sky-800/50">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Genetic Counselors</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{analytics?.totalCounselors || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center border border-indigo-200/50 dark:border-indigo-800/50">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Family Cases</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{analytics?.totalFamilies || 0}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Health Assessments</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{analytics?.totalAssessments || 0}</p>
          </div>
        </Card>
      </div>

      {/* Analytics Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Category Distribution */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Outcome Category Distribution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Evaluated outcomes across all patient cases</p>
            </div>
            <BarChart2 className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="space-y-3">
            {analytics?.categoryDistribution && Object.keys(analytics.categoryDistribution).length > 0 ? (
              Object.entries(analytics.categoryDistribution).map(([cat, count]) => {
                const total = analytics.totalAssessments || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{cat.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500 dark:text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          cat === 'COUNSELOR_REVIEW'
                            ? 'bg-rose-500'
                            : cat === 'REVIEW_RECOMMENDED'
                            ? 'bg-amber-500'
                            : 'bg-sky-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No assessment outcomes computed yet.</p>
            )}
          </div>
        </Card>

        {/* Rule Triggering Frequencies */}
        <Card className="p-6 space-y-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Triggered Rule Frequencies</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Most active rules in the clinical inference engine</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>

          <div className="space-y-3">
            {analytics?.ruleFrequency && Object.keys(analytics.ruleFrequency).length > 0 ? (
              Object.entries(analytics.ruleFrequency).map(([ruleCode, count]) => (
                <div key={ruleCode} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{ruleCode}</span>
                  <Badge variant="purple" size="sm">Fired {count} time(s)</Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">No rules triggered yet.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
