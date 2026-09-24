import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { UserCheck, Stethoscope, Users, CheckCircle2 } from 'lucide-react';

export const CaseAssignments = () => {
  const [families, setFamilies] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedCounselor, setSelectedCounselor] = useState('');
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [fRes, cRes] = await Promise.all([
        api.get('/families'),
        api.get('/admin/counselors')
      ]);

      if (fRes.data.success) setFamilies(fRes.data.data);
      if (cRes.data.success) setCounselors(cRes.data.data);
    } catch (err) {
      setError('Failed to load assignment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedFamily || !selectedCounselor) return;
    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/admin/assign-case', {
        familyId: selectedFamily,
        counselorId: selectedCounselor
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Case assigned successfully!');
        setSelectedFamily('');
        setSelectedCounselor('');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign case.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Case Assignments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Assign patient family pedigrees to certified genetic counselors for clinical review
        </p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}
      {successMsg && <Alert type="success">{successMsg}</Alert>}

      <Card className="p-6 space-y-6">
        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Family Case *
            </label>
            <select
              required
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose Case...</option>
              {families.map(f => (
                <option key={f._id} value={f._id}>
                  {f.name} (Case ID: {f._id.slice(-6)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assign to Genetic Counselor *
            </label>
            <select
              required
              value={selectedCounselor}
              onChange={(e) => setSelectedCounselor(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Choose Counselor...</option>
              {counselors.map(c => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              size="md"
              loading={submitting}
              className="!bg-purple-600 hover:!bg-purple-700"
            >
              <UserCheck className="w-4 h-4 mr-1.5" /> Confirm Assignment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
