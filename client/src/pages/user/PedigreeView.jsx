import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Alert } from '../../components/common/Alert';
import { PedigreeGraph } from '../../features/pedigree/PedigreeGraph';
import { GitMerge, ArrowLeft, Sparkles, Download, Users, FileText } from 'lucide-react';

export const PedigreeView = () => {
  const { id } = useParams();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const res = await api.get(`/families/${id}`);
        if (res.data.success) {
          setFamilyData(res.data.data);
        }
      } catch (err) {
        setError('Failed to load family pedigree data.');
      } finally {
        setLoading(false);
      }
    };
    fetchFamily();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Rendering genealogical pedigree...</div>;
  }

  const members = familyData?.members || [];
  const relationships = familyData?.relationships || [];
  const conditions = familyData?.conditions || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/user/families" className="text-slate-400 hover:text-slate-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {familyData?.family?.name} — Pedigree
            </h1>
            <Badge variant="brand" size="sm">D3.js Dynamic Graph</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard medical nomenclature pedigree. Click on any member symbol to inspect genetic records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/user/families/${id}/builder`}>
            <Button variant="secondary" size="sm">
              <Users className="w-4 h-4 mr-1.5" /> Edit Family Data
            </Button>
          </Link>
          <Link to={`/user/families/${id}/builder?step=6`}>
            <Button size="sm">
              <Sparkles className="w-4 h-4 mr-1.5" /> Assessment Results
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {members.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <p className="text-sm text-slate-600">No members have been added to this family yet.</p>
          <Link to={`/user/families/${id}/builder?step=1`}>
            <Button size="sm">Add Family Members</Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-4 shadow-sm border-slate-200">
          <PedigreeGraph
            members={members}
            relationships={relationships}
            conditions={conditions}
          />
        </Card>
      )}
    </div>
  );
};
