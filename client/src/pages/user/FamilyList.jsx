import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { PlusCircle, GitMerge, FileText, Trash2, Edit3, ArrowRight, Users, Sparkles } from 'lucide-react';

export const FamilyList = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFamilies = async () => {
    try {
      const res = await api.get('/families');
      if (res.data.success) {
        setFamilies(res.data.data);
      }
    } catch (err) {
      setError('Failed to fetch family cases.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      const res = await api.post('/families', { name, description });
      if (res.data.success) {
        setName('');
        setDescription('');
        setShowCreateModal(false);
        fetchFamilies();
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create family case.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this family case? All members, relationships, conditions, and assessments will be permanently removed.')) {
      return;
    }
    try {
      await api.delete(`/families/${id}`);
      setFamilies(prev => prev.filter(f => f._id !== id));
    } catch (err) {
      alert('Failed to delete family case.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Family Cases</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your family lineages, pedigree models, and preconception evaluations
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="md">
          <PlusCircle className="w-4 h-4 mr-1.5" /> Create Family Case
        </Button>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading family cases...</div>
      ) : families.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Family Cases Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Create your first family case to start recording family members, relationships, and hereditary health data.
          </p>
          <Button onClick={() => setShowCreateModal(true)} size="sm">
            Create Case Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {families.map(fam => (
            <Card key={fam._id} className="p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{fam.name}</h3>
                  <Badge variant="brand" size="sm">{fam.status}</Badge>
                </div>
                {fam.description && (
                  <p className="text-xs text-slate-600 line-clamp-2">{fam.description}</p>
                )}
                <p className="text-[11px] text-slate-400">
                  Last updated {new Date(fam.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDelete(fam._id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete Case"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <Link to={`/user/families/${fam._id}/pedigree`}>
                    <Button variant="secondary" size="sm">
                      <GitMerge className="w-3.5 h-3.5 mr-1" /> Pedigree
                    </Button>
                  </Link>
                  <Link to={`/user/families/${fam._id}/builder`}>
                    <Button variant="primary" size="sm">
                      Builder <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Family Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Family Case"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Family / Case Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morgan Preconception Assessment"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Case Description / Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Clinical or family history context, concerns, or goals..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
            >
              Create Case
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
