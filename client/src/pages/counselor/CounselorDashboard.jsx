import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import {
  ClipboardList,
  Stethoscope,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Sparkles
} from 'lucide-react';

export const CounselorDashboard = () => {
  const navigate = useNavigate();
  const [assignedCases, setAssignedCases] = useState([]);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pendingCases: 0,
    completedCases: 0,
    totalNotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [quickFilling, setQuickFilling] = useState(false);

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

  const handleQuickFillCase = async (scenarioKey) => {
    setQuickFilling(true);
    try {
      const res = await api.post('/counselor/quick-fill-case', { scenarioKey });
      if (res.data?.success && res.data.data?.familyId) {
        navigate(`/counselor/cases/${res.data.data.familyId}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to prepare demo review case.');
    } finally {
      setQuickFilling(false);
      setShowScenarioModal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Clinical Provider Workspace Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60">
              Clinical Triage Workspace
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Genetic Counselor Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Review patient pedigrees, examine evidence-based clinical rule outcomes, and provide personalized clinical recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowScenarioModal(true)}
            className="border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-950/50"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" /> Quick-Fill Demo Case
          </Button>
          <Link to="/counselor/cases">
            <Button size="sm">
              <ClipboardList className="w-4 h-4 mr-1.5" /> View Case Queue
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center border border-sky-200/50 dark:border-sky-800/50">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Assigned</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.totalAssigned}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-3.5 p-4 border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center border border-amber-200/50 dark:border-amber-800/50">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{stats.pendingCases}</p>
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
            <div className="pt-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setShowScenarioModal(true)}
                className="!bg-sky-600 hover:!bg-sky-700"
              >
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-300" /> Quick-Fill Demo Review Case
              </Button>
            </div>
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

      {/* Quick Fill Scenario Modal */}
      <Modal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        title="Quick Fill Demo Patient Case for Review"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a verified clinical demonstration pedigree to assign to your counselor queue. GeneTrace will prepare the family case and execute the symbolic AIES assessment engine so you can inspect the reasoning trace and document clinical notes.
          </p>

          <div className="space-y-2">
            {[
              {
                key: 'recessive_consanguinity',
                title: 'Scenario A: Autosomal Recessive & Consanguinity (Cystic Fibrosis)',
                desc: 'Consanguineous union (2nd cousins), both CFTR carriers, affected brother. Triggers RULE-AR-01 (Priority 100, CRITICAL) and RULE-CONS-01.'
              },
              {
                key: 'dominant_multirule',
                title: 'Scenario B: Multi-Generational Huntington & Parental Age',
                desc: 'Vertical transmission across 3 generations with early onset (<50), maternal age 38, paternal age 44. Triggers RULE-AD-01, RULE-MULTI-01, RULE-AMA-01, RULE-APA-01.'
              },
              {
                key: 'x_linked_recessive',
                title: 'Scenario C: X-Linked Recessive Hemophilia Lineage',
                desc: 'Maternal grandfather affected with Hemophilia A, carrier mother, male proband. Triggers RULE-XL-01 (Priority 92).'
              },
              {
                key: 'incomplete_lineage',
                title: 'Scenario D: Incomplete Lineage / Adopted Proband (Uncertainty)',
                desc: 'Adopted proband with zero biological family records. Triggers Rule R09 (INSUFFICIENT_INFORMATION).'
              }
            ].map(sc => (
              <button
                key={sc.key}
                type="button"
                disabled={quickFilling}
                onClick={() => handleQuickFillCase(sc.key)}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 transition-all flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{sc.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{sc.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowScenarioModal(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
