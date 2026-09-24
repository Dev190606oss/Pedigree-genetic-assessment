import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Cpu, Plus, Trash2, Edit3, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

export const RuleManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [ruleCode, setRuleCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('MENDELIAN');
  const [priority, setPriority] = useState(50);
  const [resultCategory, setResultCategory] = useState('REVIEW_RECOMMENDED');
  const [factName, setFactName] = useState('consanguinity_detected');
  const [operator, setOperator] = useState('EQUALS');
  const [targetValue, setTargetValue] = useState('true');
  const [explanation, setExplanation] = useState('');
  const [guidanceText, setGuidanceText] = useState('');

  const fetchRules = async () => {
    try {
      const res = await api.get('/admin/rules');
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (err) {
      setError('Failed to load expert rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreateRule = async (e) => {
    e.preventDefault();

    let parsedVal = targetValue;
    if (targetValue === 'true') parsedVal = true;
    if (targetValue === 'false') parsedVal = false;
    if (!isNaN(Number(targetValue)) && targetValue.trim() !== '') {
      parsedVal = Number(targetValue);
    }

    try {
      const res = await api.post('/admin/rules', {
        ruleCode,
        name,
        description,
        category,
        priority: Number(priority),
        conditions: [
          {
            fact: factName,
            operator,
            value: parsedVal
          }
        ],
        result: {
          category: resultCategory
        },
        explanation,
        guidance: guidanceText.split('\n').filter(Boolean)
      });

      if (res.data.success) {
        setShowModal(false);
        fetchRules();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create rule.');
    }
  };

  const handleToggleActive = async (rule) => {
    try {
      await api.patch(`/admin/rules/${rule._id}`, {
        isActive: !rule.isActive
      });
      fetchRules();
    } catch (err) {
      alert('Failed to toggle rule active status.');
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this rule from the expert system knowledge base?')) return;
    try {
      await api.delete(`/admin/rules/${id}`);
      fetchRules();
    } catch (err) {
      alert('Failed to delete rule.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AIES Rules Knowledge Base</h1>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic inference rules, conditional predicates, and priority-based conflict resolution
          </p>
        </div>

        <Button onClick={() => setShowModal(true)} size="md">
          <Plus className="w-4 h-4 mr-1.5" /> Define New Rule
        </Button>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map(rule => (
          <Card key={rule._id} className="p-6 space-y-4 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {rule.ruleCode}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm">{rule.name}</h3>
                  <span className="text-[11px] text-slate-400">v{rule.version || 1}</span>
                </div>
                <p className="text-xs text-slate-500">{rule.description}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={rule.result?.category} size="md">
                  {rule.result?.category?.replace(/_/g, ' ')}
                </Badge>
                <button
                  onClick={() => handleToggleActive(rule)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                    rule.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  {rule.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {rule.isActive ? 'Active' : 'Disabled'}
                </button>
                <button
                  onClick={() => handleDeleteRule(rule._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  title="Delete Rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rule Predicates */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
                  Conditions (IF):
                </span>
                <div className="flex flex-wrap gap-2">
                  {rule.conditions?.map((c, i) => (
                    <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800">
                      <span className="text-brand-700 font-bold">{c.fact}</span>{' '}
                      <span className="text-slate-500">{c.operator}</span>{' '}
                      <span className="text-purple-700 font-bold">{JSON.stringify(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
                  Explanation & Clinical Logic:
                </span>
                <p className="text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                  {rule.explanation}
                </p>
              </div>

              {rule.guidance?.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] block mb-1">
                    Generated Guidance:
                  </span>
                  <ul className="space-y-1 text-slate-600 pl-4 list-disc">
                    {rule.guidance.map((g, gi) => (
                      <li key={gi}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Define New Expert System Rule"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Code *</label>
              <input
                type="text"
                required
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                placeholder="e.g. RULE-CUSTOM-01"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority (1-100) *</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Consanguineous Recessive Screening Alert"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Condition Builder */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Conditional Predicate Clause (IF)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Normalized Fact</label>
                <select
                  value={factName}
                  onChange={(e) => setFactName(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                >
                  <option value="consanguinity_detected">consanguinity_detected</option>
                  <option value="couple_carrier_match">couple_carrier_match</option>
                  <option value="multi_generational_transmission">multi_generational_transmission</option>
                  <option value="multiple_affected_relatives">multiple_affected_relatives</option>
                  <option value="early_onset_detected">early_onset_detected</option>
                  <option value="first_degree_relative_affected">first_degree_relative_affected</option>
                  <option value="second_degree_relative_affected">second_degree_relative_affected</option>
                  <option value="condition_present">condition_present</option>
                  <option value="family_history_complete">family_history_complete</option>
                  <option value="required_family_information_missing">required_family_information_missing</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                >
                  <option value="EQUALS">EQUALS</option>
                  <option value="NOT_EQUALS">NOT_EQUALS</option>
                  <option value="EXISTS">EXISTS</option>
                  <option value="NOT_EXISTS">NOT_EXISTS</option>
                  <option value="GREATER_THAN">GREATER_THAN</option>
                  <option value="LESS_THAN">LESS_THAN</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Target Value</label>
                <input
                  type="text"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="true, false, or number"
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Outcome Result Category *</label>
            <select
              value={resultCategory}
              onChange={(e) => setResultCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="COUNSELOR_REVIEW">COUNSELOR_REVIEW (Critical/High)</option>
              <option value="REVIEW_RECOMMENDED">REVIEW_RECOMMENDED (Moderate)</option>
              <option value="INFORMATIONAL">INFORMATIONAL (Standard/Baseline)</option>
              <option value="INSUFFICIENT_INFORMATION">INSUFFICIENT_INFORMATION (Missing Lineage)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Explanation & Clinical Justification *</label>
            <textarea
              rows={2}
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this rule was triggered and what genetic risk it implies..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Educational Guidance (One per line)</label>
            <textarea
              rows={3}
              value={guidanceText}
              onChange={(e) => setGuidanceText(e.target.value)}
              placeholder="Recommended next steps for the consulting couple..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Rule to Knowledge Base
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
