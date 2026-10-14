import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Cpu, Plus, Trash2, Edit3, CheckCircle, XCircle, ArrowRight, Sparkles, Filter } from 'lucide-react';

export const RuleManagement = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);

  // Form state
  const [ruleCode, setRuleCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('MENDELIAN');
  const [priority, setPriority] = useState(50);
  const [conditionLogic, setConditionLogic] = useState('AND');
  const [resultCategory, setResultCategory] = useState('REVIEW_RECOMMENDED');
  const [factName, setFactName] = useState('consanguinity_reported');
  const [operator, setOperator] = useState('EQUALS');
  const [targetValue, setTargetValue] = useState('true');
  const [conclusionFact, setConclusionFact] = useState('');
  const [conclusionValue, setConclusionValue] = useState('true');
  const [explanation, setExplanation] = useState('');
  const [guidanceText, setGuidanceText] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');

  const fetchRules = async () => {
    try {
      const res = await api.get('/admin/rules');
      if (res.data.success) {
        setRules(res.data.data);
      }
    } catch (err) {
      setError('Failed to load decision rules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const openCreateModal = () => {
    setEditingRuleId(null);
    setRuleCode('');
    setName('');
    setDescription('');
    setCategory('MENDELIAN');
    setPriority(50);
    setConditionLogic('AND');
    setResultCategory('REVIEW_RECOMMENDED');
    setFactName('consanguinity_reported');
    setOperator('EQUALS');
    setTargetValue('true');
    setConclusionFact('');
    setConclusionValue('true');
    setExplanation('');
    setGuidanceText('');
    setShowModal(true);
  };

  const handleQuickFillSampleRule = () => {
    setRuleCode('RULE-CUSTOM-01');
    setName('Advanced Maternal Age & Recessive Carrier Synthesis');
    setDescription('Synthesizes prospective maternal age >=35 with proband carrier status to recommend structured preconception genetic counseling.');
    setCategory('CARRIER_STATUS');
    setPriority(75);
    setConditionLogic('AND');
    setFactName('maternal_age_over_35');
    setOperator('EQUALS');
    setTargetValue('true');
    setConclusionFact('maternal_carrier_counseling_indicated');
    setConclusionValue('true');
    setResultCategory('REVIEW_RECOMMENDED');
    setExplanation('Prospective maternal age >=35 combined with confirmed carrier status indicates elevated baseline reproductive risk, warranting structured clinical genetic counseling.');
    setGuidanceText('Recommend preconception consultation with a certified genetic counselor.\nDiscuss non-invasive prenatal screening (cfDNA/NIPT).\nReview targeted partner carrier screening options.');
  };

  const openEditModal = (rule) => {
    setEditingRuleId(rule._id);
    setRuleCode(rule.ruleCode || '');
    setName(rule.name || '');
    setDescription(rule.description || '');
    setCategory(rule.category || 'MENDELIAN');
    setPriority(rule.priority !== undefined ? rule.priority : 50);
    setConditionLogic(rule.conditionLogic || 'AND');
    setResultCategory(rule.result?.category || 'REVIEW_RECOMMENDED');
    
    const firstCond = (rule.conditions && rule.conditions[0]) || {};
    setFactName(firstCond.fact || 'condition_present');
    setOperator(firstCond.operator || 'EQUALS');
    setTargetValue(firstCond.value !== undefined ? String(firstCond.value) : 'true');

    if (rule.conclusion) {
      setConclusionFact(rule.conclusion.fact || '');
      setConclusionValue(rule.conclusion.value !== undefined ? String(rule.conclusion.value) : 'true');
    } else {
      setConclusionFact('');
      setConclusionValue('true');
    }

    setExplanation(rule.explanation || '');
    setGuidanceText((rule.guidance || []).join('\n'));
    setShowModal(true);
  };

  const handleSubmitRule = async (e) => {
    e.preventDefault();

    let parsedCondVal = targetValue;
    if (targetValue === 'true') parsedCondVal = true;
    if (targetValue === 'false') parsedCondVal = false;
    if (!isNaN(Number(targetValue)) && targetValue.trim() !== '') {
      parsedCondVal = Number(targetValue);
    }

    let parsedConcVal = conclusionValue;
    if (conclusionValue === 'true') parsedConcVal = true;
    if (conclusionValue === 'false') parsedConcVal = false;
    if (!isNaN(Number(conclusionValue)) && conclusionValue.trim() !== '') {
      parsedConcVal = Number(conclusionValue);
    }

    const payload = {
      ruleCode: ruleCode.trim().toUpperCase(),
      name: name.trim(),
      description: description.trim(),
      category,
      priority: Number(priority),
      conditionLogic: conditionLogic === 'OR' ? 'OR' : 'AND',
      conditions: [
        {
          fact: factName,
          operator,
          value: parsedCondVal
        }
      ],
      conclusion: conclusionFact.trim() ? {
        fact: conclusionFact.trim(),
        value: parsedConcVal
      } : null,
      result: {
        category: resultCategory
      },
      explanation: explanation.trim(),
      guidance: guidanceText.split('\n').map(s => s.trim()).filter(Boolean)
    };

    try {
      if (editingRuleId) {
        const res = await api.put(`/admin/rules/${editingRuleId}`, payload);
        if (res.data.success) {
          setShowModal(false);
          fetchRules();
        }
      } else {
        const res = await api.post('/admin/rules', payload);
        if (res.data.success) {
          setShowModal(false);
          fetchRules();
        }
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save rule.');
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
    if (!window.confirm('Delete this rule from the clinical knowledge base?')) return;
    try {
      await api.delete(`/admin/rules/${id}`);
      fetchRules();
    } catch (err) {
      alert('Failed to delete rule.');
    }
  };

  const filteredRules = filterCategory === 'ALL'
    ? rules
    : rules.filter(r => r.category === filterCategory || r.result?.category === filterCategory);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <Cpu className="w-6 h-6 text-brand-600 dark:text-brand-400" />
            Decision Rules Knowledge Base
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic inference rules, conditional premises, and forward-chaining conclusions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={openCreateModal} size="md" className="shadow-sm">
            <Plus className="w-4 h-4 mr-1.5" /> Define New Rule
          </Button>
        </div>
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Filter Rules:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'AUTOSOMAL_DOMINANT', 'AUTOSOMAL_RECESSIVE', 'COUNSELOR_REVIEW', 'REVIEW_RECOMMENDED', 'INFORMATIONAL'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                filterCategory === cat
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500">Loading rules knowledge base...</div>
        ) : filteredRules.length === 0 ? (
          <Card className="p-8 text-center text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800">
            No rules match the selected filter.
          </Card>
        ) : (
          filteredRules.map(rule => (
            <Card key={rule._id} className="p-6 space-y-4 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200/50 dark:border-brand-800/50">
                      {rule.ruleCode}
                    </span>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{rule.name}</h3>
                    <span className="text-[11px] text-slate-400">v{rule.version || 1}</span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Priority: {rule.priority}
                    </span>
                    <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/60 px-2 py-0.5 rounded border border-brand-200/50 dark:border-brand-800/50">
                      {rule.conditionLogic || 'AND'} Logic
                    </span>
                  </div>
                  {rule.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">{rule.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant={rule.result?.category} size="md">
                    {rule.result?.category?.replace(/_/g, ' ')}
                  </Badge>

                  <button
                    onClick={() => handleToggleActive(rule)}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                      rule.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {rule.isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {rule.isActive ? 'Active' : 'Disabled'}
                  </button>

                  <button
                    onClick={() => openEditModal(rule)}
                    className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit Rule"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule._id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rule Predicates (IF) & Conclusion (THEN) */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* IF Conditions */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] block mb-1.5">
                      Premise Condition (IF):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rule.conditions?.map((c, i) => (
                        <div key={i} className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-[11px] text-slate-800 dark:text-slate-200">
                          <span className="text-brand-700 dark:text-brand-400 font-bold">{c.fact}</span>{' '}
                          <span className="text-slate-500">{c.operator}</span>{' '}
                          <span className="text-purple-700 dark:text-purple-300 font-bold">{JSON.stringify(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* THEN Conclusion */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] block mb-1.5">
                      Derived Fact Conclusion (THEN):
                    </span>
                    {rule.conclusion?.fact ? (
                      <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg font-mono text-[11px] text-emerald-800 dark:text-emerald-300 inline-flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{rule.conclusion.fact} = {JSON.stringify(rule.conclusion.value)}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No intermediate fact derived (direct outcome rule)</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] block mb-1">
                    Clinical Explanation & Rationale:
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-200/50 dark:border-slate-800">
                    {rule.explanation}
                  </p>
                </div>

                {rule.guidance?.length > 0 && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] block mb-1">
                      Recommended Guidance:
                    </span>
                    <ul className="space-y-1 text-slate-600 dark:text-slate-300 pl-4 list-disc">
                      {rule.guidance.map((g, gi) => (
                        <li key={gi}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create / Edit Rule Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRuleId ? 'Edit Decision Rule' : 'Define New Decision Rule'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitRule} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Code *</label>
              <input
                type="text"
                required
                value={ruleCode}
                onChange={(e) => setRuleCode(e.target.value)}
                placeholder="e.g. R04 or RULE-CUSTOM-01"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority (1-100) *</label>
              <input
                type="number"
                min="1"
                max="100"
                required
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Two Affected Siblings Recessive Review"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief explanation of when this rule applies"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Condition Builder (IF) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Conditional Premise Clause (IF)
              </span>
              <div className="flex items-center gap-1.5 text-xs">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Logic:</label>
                <select
                  value={conditionLogic}
                  onChange={(e) => setConditionLogic(e.target.value)}
                  className="px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-brand-600 dark:text-brand-400"
                >
                  <option value="AND">AND (All Required)</option>
                  <option value="OR">OR (Any Satisfied)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Fact Name</label>
                <input
                  type="text"
                  required
                  value={factName}
                  onChange={(e) => setFactName(e.target.value)}
                  placeholder="e.g. affected_members"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Operator</label>
                <select
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  <option value="EQUALS">EQUALS</option>
                  <option value="NOT_EQUALS">NOT_EQUALS</option>
                  <option value="GREATER_THAN">GREATER_THAN</option>
                  <option value="GREATER_THAN_OR_EQUAL">GREATER_THAN_OR_EQUAL</option>
                  <option value="LESS_THAN">LESS_THAN</option>
                  <option value="LESS_THAN_OR_EQUAL">LESS_THAN_OR_EQUAL</option>
                  <option value="EXISTS">EXISTS</option>
                  <option value="NOT_EXISTS">NOT_EXISTS</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Target Value</label>
                <input
                  type="text"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder="true, false, or number"
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Conclusion Builder (THEN) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
              Derived Fact Conclusion (THEN) - Optional for Forward Chaining
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Conclusion Fact Name</label>
                <input
                  type="text"
                  value={conclusionFact}
                  onChange={(e) => setConclusionFact(e.target.value)}
                  placeholder="e.g. review_indicator or leave empty"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">Conclusion Fact Value</label>
                <input
                  type="text"
                  value={conclusionValue}
                  onChange={(e) => setConclusionValue(e.target.value)}
                  placeholder="true, false, or value"
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Knowledge Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="MENDELIAN">MENDELIAN</option>
                <option value="AUTOSOMAL_DOMINANT">AUTOSOMAL DOMINANT</option>
                <option value="AUTOSOMAL_RECESSIVE">AUTOSOMAL RECESSIVE</option>
                <option value="X_LINKED">X LINKED</option>
                <option value="MULTI_FACTORIAL">MULTI FACTORIAL</option>
                <option value="CONSANGUINITY">CONSANGUINITY</option>
                <option value="CARRIER_STATUS">CARRIER STATUS</option>
                <option value="GENERAL_GENETICS">GENERAL GENETICS</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Result Category *</label>
              <select
                value={resultCategory}
                onChange={(e) => setResultCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="COUNSELOR_REVIEW">COUNSELOR_REVIEW (Critical/High)</option>
                <option value="REVIEW_RECOMMENDED">REVIEW_RECOMMENDED (Moderate)</option>
                <option value="INFORMATIONAL">INFORMATIONAL (Standard/Baseline)</option>
                <option value="INSUFFICIENT_INFORMATION">INSUFFICIENT_INFORMATION (Missing Lineage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Explanation & Health Rationale *</label>
            <textarea
              rows={2}
              required
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this rule was triggered and what hereditary pattern it indicates..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Recommended Guidance (One recommendation per line)</label>
            <textarea
              rows={3}
              value={guidanceText}
              onChange={(e) => setGuidanceText(e.target.value)}
              placeholder="Recommended next steps for the individual or consulting couple..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            {!editingRuleId ? (
              <button
                type="button"
                onClick={handleQuickFillSampleRule}
                className="text-xs text-brand-700 dark:text-brand-300 hover:text-brand-800 font-medium flex items-center gap-1 px-2.5 py-1 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors"
              >
                <Sparkles className="w-3 h-3 text-brand-500" /> Fill Sample Rule Template
              </button>
            ) : <div />}
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                {editingRuleId ? 'Update Rule' : 'Save Rule to Knowledge Base'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
