import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import {
  ClipboardList,
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText
} from 'lucide-react';

export const CounselorDashboard = () => {
  const [assignedCases, setAssignedCases] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingCases: 0,
    completedCases: 0,
    totalNotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/counselor/cases');
        if (res.data.success) {
          const cases = res.data.data;
          setAssignedCases(cases);

          const pending = cases.filter(c => c.status !== 'COMPLETED').length;
          const completed = cases.filter(c => c.status === 'COMPLETED').length;
          const notesCount = cases.reduce((acc, c) => acc + (c.notes?.length || 0), 0);

          setStats({
            totalAssigned: cases.length,
            pendingCases: pending,
            completedCases: completed,
            totalNotes: notesCount
          });
        }
      } catch (err) {
        setError('Failed to load counselor cases.');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  return (
    <div className="space-y-8">
      {/* Clinical Header */}
      <div className="bg-gradient-to-r from-sky-700 via-sky-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg shadow-sky-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <Badge variant="default" size="sm" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
            Clinical Triage Workspace
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Genetic Counselor Portal
          </h1>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            Review patient pedigrees, examine evidence-based clinical rule outcomes, and provide personalized clinical recommendations.
          </p>
        </div>

        <Link to="/counselor/cases">
          <Button size="md" className="!bg-white !text-sky-900 hover:!bg-sky-50 shadow-md">
            <ClipboardList className="w-4 h-4 mr-1.5 text-sky-700" /> View Case Queue
          </Button>
        </Link>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-4 p-5 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 flex items-center justify-center">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Assigned</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalAssigned}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.pendingCases}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Reviews</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.completedCases}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5 border-slate-200 dark:border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Clinical Notes</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stats.totalNotes}</p>
          </div>
        </Card>
      </div>

      {/* Assigned Cases Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Assigned Patient Cases</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pedigrees awaiting clinical evaluation or formal recommendations</p>
          </div>
          <Link to="/counselor/cases" className="text-xs font-semibold text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300">
            View All ({assignedCases.length})
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">Loading assigned cases...</div>
        ) : assignedCases.length === 0 ? (
          <Card className="p-12 text-center space-y-2 border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mx-auto">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">No Cases Currently Assigned</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              New patient cases will appear here once assigned by system administration.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedCases.map(item => {
              const family = item.familyId;
              if (!family) return null;

              return (
                <Card key={item._id} className="p-5 flex flex-col justify-between space-y-4 hover:border-sky-300 dark:hover:border-sky-700 transition-colors border-slate-200 dark:border-slate-800">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{family.name}</h3>
                      <Badge variant={item.status === 'COMPLETED' ? 'success' : item.status === 'IN_REVIEW' ? 'info' : 'warning'} size="sm">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Patient: <span className="font-semibold text-slate-800 dark:text-slate-200">{family.ownerId?.name || 'Anonymous'}</span> ({family.ownerId?.email})
                    </p>
                    {family.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic">"{family.description}"</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      Assigned {new Date(item.assignedAt).toLocaleDateString()}
                    </span>
                    <Link to={`/counselor/cases/${family._id}`}>
                      <Button variant="primary" size="sm" className="!bg-sky-600 hover:!bg-sky-700">
                        Review Pedigree & Case <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
