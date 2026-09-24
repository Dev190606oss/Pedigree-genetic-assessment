import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Stethoscope, Mail, CheckCircle2 } from 'lucide-react';

export const CounselorManagement = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounselors = async () => {
      try {
        const res = await api.get('/admin/counselors');
        if (res.data.success) {
          setCounselors(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load counselors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounselors();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Genetic Counselor Roster</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered certified clinical genetic specialists available for case assignments
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading counselor roster...</div>
      ) : counselors.length === 0 ? (
        <Card className="p-8 text-center text-slate-500 text-sm">No counselors registered yet.</Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {counselors.map(c => (
            <Card key={c._id} className="p-6 space-y-4 border-sky-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  <Badge variant="info" size="sm">CGC Certified</Badge>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Status: {c.isActive ? 'Active on Roster' : 'Inactive'}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
