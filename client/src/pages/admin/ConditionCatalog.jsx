import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { BookOpen, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';

export const ConditionCatalog = () => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCond, setEditingCond] = useState(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('AUTOSOMAL_RECESSIVE');
  const [error, setError] = useState('');

  const fetchConditions = async () => {
    try {
      const res = await api.get('/admin/conditions');
      if (res.data.success) {
        setConditions(res.data.data);
      }
    } catch (err) {
      setError('Failed to load genetic conditions catalogue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConditions();
  }, []);

  const handleOpenCreate = () => {
    setEditingCond(null);
    setName('');
    setCode('');
    setDescription('');
    setCategory('AUTOSOMAL_RECESSIVE');
    setShowModal(true);
  };

  const handleQuickFillCondition = () => {
    setName('Fragile X Syndrome');
    setCode('FXS-FMR1');
    setCategory('X_LINKED');
    setDescription('Trinucleotide CGG repeat expansion disorder in the FMR1 gene, leading to developmental delay and intellectual impairment.');
  };

  const handleOpenEdit = (c) => {
    setEditingCond(c);
    setName(c.name);
    setCode(c.code);
    setDescription(c.description || '');
    setCategory(c.category);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCond) {
        await api.patch(`/admin/conditions/${editingCond._id}`, {
          name,
          code,
          description,
          category
        });
      } else {
        await api.post('/admin/conditions', {
          name,
          code,
          description,
          category
        });
      }
      setShowModal(false);
      fetchConditions();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this condition from catalog?')) return;
    try {
      await api.delete(`/admin/conditions/${id}`);
      fetchConditions();
    } catch (err) {
      alert('Failed to delete condition.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Genetic Conditions Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Standard hereditary disease and carrier trait nomenclature definitions
          </p>
        </div>

        <Button onClick={handleOpenCreate} size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Add Condition
        </Button>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Conditions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {conditions.map(c => (
          <Card key={c._id} className="p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                  <span className="font-mono text-xs font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                    {c.code}
                  </span>
                </div>
                <Badge variant="purple" size="sm">
                  {c.category?.replace(/_/g, ' ')}
                </Badge>
              </div>

              {c.description && (
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => handleOpenEdit(c)}
                className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Edit Condition"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Delete Condition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCond ? 'Edit Condition' : 'Add New Genetic Condition'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cystic Fibrosis"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. CF-CFTR"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inheritance Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="AUTOSOMAL_RECESSIVE">Autosomal Recessive</option>
                <option value="AUTOSOMAL_DOMINANT">Autosomal Dominant</option>
                <option value="X_LINKED">X-Linked</option>
                <option value="MITOCHONDRIAL">Mitochondrial</option>
                <option value="MULTIFACTORIAL">Multifactorial</option>
                <option value="CHROMOSOMAL">Chromosomal</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Pathophysiology, affected genes, typical manifestations..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {!editingCond ? (
              <button
                type="button"
                onClick={handleQuickFillCondition}
                className="text-xs text-brand-700 hover:text-brand-800 font-medium flex items-center gap-1 px-2.5 py-1 bg-brand-50 hover:bg-brand-100 rounded-lg border border-brand-200 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-brand-500" /> Fill Sample Condition
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Condition
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
