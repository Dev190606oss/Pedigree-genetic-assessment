import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { Modal } from '../../components/common/Modal';
import { ClipboardList, ArrowRight, Search, Filter, Sparkles } from 'lucide-react';

export const AssignedCases = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [quickFilling, setQuickFilling] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.get('/counselor/cases');
        if (res.data.success) {
          setCases(res.data.data);
        }
      } catch (err) {
        setError('Failed to load case queue.');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const filteredCases = cases.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const famName = item.familyId?.name || '';
    const patientName = item.familyId?.ownerId?.name || '';
    const matchesSearch = famName.toLowerCase().includes(search.toLowerCase()) ||
                          patientName.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Case Review Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Triaged patient pedigrees and preconception assessment evaluations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowScenarioModal(true)}
            className="border-sky-200 text-sky-800 hover:bg-sky-50"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" /> Quick-Fill Demo Case
          </Button>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'PENDING', 'IN_REVIEW', 'REVIEWED', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filter === status
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by case name or patient..."
          className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Case Table / List */}
      <Card className="overflow-hidden p-0 border-slate-200">
        {loading ? (
          <div className="p-12 text-center text-slate-400">Loading cases...</div>
        ) : filteredCases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No cases match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Family Case</th>
                  <th className="px-6 py-3.5">Patient / Client</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Assigned Date</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCases.map(item => {
                  const family = item.familyId;
                  if (!family) return null;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm">{family.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{family.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-semibold">{family.ownerId?.name || 'Anonymous'}</div>
                        <div className="text-[11px] text-slate-400">{family.ownerId?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={item.status === 'COMPLETED' ? 'success' : item.status === 'IN_REVIEW' ? 'info' : 'warning'}
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {new Date(item.assignedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/counselor/cases/${family._id}`}>
                          <Button size="sm" variant="primary" className="!bg-sky-600 hover:!bg-sky-700">
                            Review <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Fill Scenario Modal */}
      <Modal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        title="Quick Fill Demo Patient Case for Review"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
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
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all flex flex-col gap-1 disabled:opacity-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{sc.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{sc.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
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
