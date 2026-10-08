import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Stepper } from '../../components/common/Stepper';
import { PedigreeGraph } from '../../features/pedigree/PedigreeGraph';
import {
  RELATIONSHIP_GROUPS,
  RELATIONSHIP_DEFINITIONS,
  getRelationshipDefinition,
  getInverseRelationship,
  getRelationshipPreviewText
} from '../../utils/relationshipHelper';
import {
  Users,
  GitMerge,
  Activity,
  Heart,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';

const STEPS = [
  { id: 'info', title: '1. Basic Info' },
  { id: 'members', title: '2. Members' },
  { id: 'relations', title: '3. Relationships' },
  { id: 'conditions', title: '4. Conditions' },
  { id: 'review', title: '5. Review' },
  { id: 'pedigree', title: '6. Pedigree' },
  { id: 'assessment', title: '7. Assessment' }
];

export const FamilyBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial step from query param if available
  const initialStep = parseInt(searchParams.get('step') || '0', 10);
  const [currentStep, setCurrentStep] = useState(isNaN(initialStep) ? 0 : initialStep);

  const [familyData, setFamilyData] = useState(null);
  const [conditionsCatalog, setConditionsCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Modals
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showRelModal, setShowRelModal] = useState(false);
  const [showCondModal, setShowCondModal] = useState(false);

  // Form states
  const [memberName, setMemberName] = useState('');
  const [memberSex, setMemberSex] = useState('FEMALE');
  const [memberDob, setMemberDob] = useState('');
  const [memberIsProband, setMemberIsProband] = useState(false);
  const [memberDeceased, setMemberDeceased] = useState(false);
  const [memberNotes, setMemberNotes] = useState('');

  const [relFrom, setRelFrom] = useState('');
  const [relTo, setRelTo] = useState('');
  const [relType, setRelType] = useState('PARENT_CHILD');
  const [relSearch, setRelSearch] = useState('');
  const [relError, setRelError] = useState('');

  const [condMemberId, setCondMemberId] = useState('');
  const [condId, setCondId] = useState('');
  const [condStatus, setCondStatus] = useState('AFFECTED');
  const [condAge, setCondAge] = useState('');
  const [condNotes, setCondNotes] = useState('');

  const fetchFamilyDetails = async () => {
    try {
      const [famRes, condsRes] = await Promise.all([
        api.get(`/families/${id}`),
        api.get('/admin/conditions').catch(() => ({ data: { data: [] } }))
      ]);

      if (famRes.data.success) {
        setFamilyData(famRes.data.data);
        if (famRes.data.data.latestAssessment) {
          setAssessmentResult(famRes.data.data.latestAssessment);
        }
      }
      if (condsRes.data.success) {
        setConditionsCatalog(condsRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load family data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'new') {
      fetchFamilyDetails();
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    setSearchParams({ step: newStep });
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/families/${id}/members`, {
        name: memberName,
        sex: memberSex,
        dateOfBirth: memberDob || null,
        isProband: memberIsProband,
        deceased: memberDeceased,
        notes: memberNotes
      });
      setShowMemberModal(false);
      setMemberName('');
      setMemberDob('');
      setMemberIsProband(false);
      setMemberDeceased(false);
      setMemberNotes('');
      fetchFamilyDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add member.');
    }
  };

  // Delete Member
  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Delete this member and their relationships/conditions?')) return;
    try {
      await api.delete(`/families/${id}/members/${memberId}`);
      fetchFamilyDetails();
    } catch (err) {
      alert('Failed to remove member.');
    }
  };

  // Add Relationship
  const handleAddRelationship = async (e) => {
    e.preventDefault();
    setRelError('');
    if (!relFrom || !relTo) {
      setRelError('Please select both family members.');
      return;
    }
    if (relFrom === relTo) {
      setRelError('A member cannot have a relationship with themselves.');
      return;
    }
    try {
      await api.post(`/families/${id}/relationships`, {
        fromMemberId: relFrom,
        toMemberId: relTo,
        type: relType
      });
      setShowRelModal(false);
      setRelFrom('');
      setRelTo('');
      setRelSearch('');
      setRelError('');
      fetchFamilyDetails();
    } catch (err) {
      setRelError(err.response?.data?.error || 'Failed to add relationship.');
    }
  };

  // Delete Relationship
  const handleDeleteRelationship = async (relId) => {
    try {
      await api.delete(`/families/${id}/relationships/${relId}`);
      fetchFamilyDetails();
    } catch (err) {
      alert('Failed to remove relationship.');
    }
  };

  // Add Condition
  const handleAddCondition = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/families/${id}/conditions`, {
        memberId: condMemberId,
        conditionId: condId,
        status: condStatus,
        ageAtOnset: condAge ? Number(condAge) : null,
        notes: condNotes
      });
      setShowCondModal(false);
      setCondMemberId('');
      setCondId('');
      setCondAge('');
      setCondNotes('');
      fetchFamilyDetails();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add condition.');
    }
  };

  // Delete Condition
  const handleDeleteCondition = async (recordId) => {
    try {
      await api.delete(`/families/${id}/conditions/${recordId}`);
      fetchFamilyDetails();
    } catch (err) {
      alert('Failed to remove condition.');
    }
  };

  // Run Assessment
  const handleRunAssessment = async () => {
    setEvaluating(true);
    try {
      const res = await api.post('/assessments', { familyId: id });
      if (res.data.success) {
        setAssessmentResult(res.data.data);
        handleStepChange(6); // Navigate to Assessment Results
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to run assessment.');
    } finally {
      setEvaluating(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!assessmentResult?._id) return;
    try {
      const response = await api.get(`/reports/assessment/${assessmentResult._id}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedigree-report-${assessmentResult._id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400">Loading family workspace...</div>;
  }

  const members = familyData?.members || [];
  const relationships = familyData?.relationships || [];
  const conditions = familyData?.conditions || [];
  const proband = members.find(m => m.isProband);

  return (
    <div className="space-y-6">
      {/* Header & Stepper */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{familyData?.family?.name}</h1>
              <Badge variant="brand" size="sm">Case Builder</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Step {currentStep + 1} of 7: {STEPS[currentStep].title}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/user/families">
              <Button variant="secondary" size="sm">Back to Cases</Button>
            </Link>
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={() => handleStepChange(currentStep + 1)} size="sm">
                Next Step <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => handleStepChange(5)} size="sm" variant="secondary">
                View Pedigree
              </Button>
            )}
          </div>
        </div>

        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(stepIdx) => handleStepChange(stepIdx)}
        />
      </div>

      {error && <Alert type="danger">{error}</Alert>}

      {/* --- STEP 0: BASIC INFO --- */}
      {currentStep === 0 && (
        <Card className="p-6 space-y-4 max-w-2xl">
          <h2 className="text-base font-bold text-slate-900">Case Overview & Clinical Context</h2>
          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold uppercase">Case Name:</span>
              <p className="text-sm font-semibold text-slate-800">{familyData?.family?.name}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase">Description / Objectives:</span>
              <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 mt-1">
                {familyData?.family?.description || 'No descriptive notes recorded.'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold uppercase">Status:</span>
              <p className="text-slate-800 font-medium mt-0.5">{familyData?.family?.status}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={() => handleStepChange(1)} size="sm">
              Proceed to Family Members <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      )}

      {/* --- STEP 1: MEMBERS --- */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Family Members ({members.length})</h2>
              <p className="text-xs text-slate-500">Record all individuals across maternal and paternal lines</p>
            </div>
            <Button onClick={() => setShowMemberModal(true)} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Family Member
            </Button>
          </div>

          {members.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <p className="text-sm text-slate-600">No members added yet.</p>
              <Button onClick={() => setShowMemberModal(true)} size="sm">
                Add First Member (Proband)
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map(m => (
                <Card key={m._id} className="p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm">{m.name}</h4>
                      {m.isProband && <Badge variant="brand" size="sm">Proband</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 capitalize">
                      {m.sex?.toLowerCase()} • {m.deceased ? 'Deceased' : 'Living'}
                    </p>
                    {m.notes && <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-2">"{m.notes}"</p>}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => handleDeleteMember(m._id)}
                      className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => handleStepChange(0)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={() => handleStepChange(2)} size="sm">
              Proceed to Relationships <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* --- STEP 2: RELATIONSHIPS --- */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Family Relationships ({relationships.length})</h2>
              <p className="text-xs text-slate-500">Connect immediate, extended, step, and adoptive family members</p>
            </div>
            <Button onClick={() => { setRelError(''); setShowRelModal(true); }} size="sm" disabled={members.length < 2}>
              <Plus className="w-4 h-4 mr-1" /> Add Family Relationship
            </Button>
          </div>

          {relationships.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <p className="text-sm text-slate-600">No relationships established yet.</p>
              <p className="text-xs text-slate-400">Add relationships between family members to construct the pedigree tree.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {relationships.map(rel => {
                const fromMember = rel.fromMemberId;
                const toMember = rel.toMemberId;
                const fromName = fromMember?.name || 'Member';
                const toName = toMember?.name || 'Member';
                const def = getRelationshipDefinition(rel.metadata?.specificType || rel.type);
                const inverseType = rel.metadata?.inverseType || getInverseRelationship(def.code, fromMember?.sex, toMember?.sex);
                const inverseDef = getRelationshipDefinition(inverseType);

                return (
                  <Card key={rel._id} className="p-3.5 flex items-center justify-between hover:border-slate-300 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-bold text-slate-800">{fromName}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${def.badgeClass || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                          {def.label}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="font-bold text-slate-800">{toName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Reverse: {toName} is the {inverseDef.label.toLowerCase()} of {fromName}</span>
                        {def.group && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                            {def.group}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteRelationship(rel._id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove relationship"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => handleStepChange(1)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={() => handleStepChange(3)} size="sm">
              Proceed to Conditions <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* --- STEP 3: CONDITIONS --- */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Hereditary Conditions & Carrier Statuses ({conditions.length})</h2>
              <p className="text-xs text-slate-500">Record clinical diagnoses and genetic test outcomes</p>
            </div>
            <Button onClick={() => setShowCondModal(true)} size="sm" disabled={members.length === 0}>
              <Plus className="w-4 h-4 mr-1" /> Record Condition
            </Button>
          </div>

          {conditions.length === 0 ? (
            <Card className="p-8 text-center space-y-2">
              <p className="text-sm text-slate-600">No medical conditions or carrier statuses recorded.</p>
              <p className="text-xs text-slate-400">If your family has no diagnosed genetic conditions, you may proceed directly to review.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conditions.map(c => (
                <Card key={c._id} className="p-4 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">
                        {c.memberId?.name || 'Member'}
                      </span>
                      <Badge variant={c.status === 'AFFECTED' ? 'danger' : 'info'} size="sm">
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-brand-700">
                      {c.conditionId?.name} ({c.conditionId?.category?.replace(/_/g, ' ')})
                    </p>
                    {c.ageAtOnset !== null && c.ageAtOnset !== undefined && (
                      <p className="text-[11px] text-slate-500">Onset age: {c.ageAtOnset} years</p>
                    )}
                    {c.notes && <p className="text-[11px] text-slate-500 italic">"{c.notes}"</p>}
                  </div>

                  <button
                    onClick={() => handleDeleteCondition(c._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </Card>
              ))}
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => handleStepChange(2)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={() => handleStepChange(4)} size="sm">
              Proceed to Review & Readiness <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* --- STEP 4: REVIEW & READINESS --- */}
      {currentStep === 4 && (
        <Card className="p-8 space-y-6 max-w-2xl mx-auto">
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Pre-Assessment Readiness Checklist</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review your recorded family dataset before initiating the clinical health assessment
            </p>
          </div>

          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Designated Proband (Index Patient)</span>
              {proband ? (
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> {proband.name}
                </span>
              ) : (
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Missing Proband
                </span>
              )}
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Total Family Members</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{members.length} member(s)</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-400">Relationships Documented</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{relationships.length} relationship(s)</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-600 dark:text-slate-400">Hereditary Conditions Linked</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{conditions.length} condition record(s)</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => handleStepChange(3)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button onClick={() => handleStepChange(5)} variant="secondary" size="sm">
                View Pedigree First
              </Button>
              <Button
                onClick={handleRunAssessment}
                variant="primary"
                size="md"
                loading={evaluating}
                disabled={members.length === 0}
                className="w-full sm:w-auto shadow-md shadow-brand-600/20"
              >
                <Sparkles className="w-4 h-4 mr-1.5" /> Run Health Assessment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* --- STEP 5: PEDIGREE VIEW --- */}
      {currentStep === 5 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Interactive Family Pedigree</h2>
              <p className="text-xs text-slate-500">
                Generated from recorded relationships and conditions. Drag to pan, scroll to zoom.
              </p>
            </div>
            <Button onClick={handleRunAssessment} loading={evaluating} size="sm">
              <Sparkles className="w-4 h-4 mr-1" /> Run Assessment
            </Button>
          </div>

          <PedigreeGraph
            members={members}
            relationships={relationships}
            conditions={conditions}
          />

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => handleStepChange(4)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={() => handleStepChange(6)} size="sm">
              View Assessment Outcome <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* --- STEP 6: ASSESSMENT RESULTS & GUIDANCE --- */}
      {currentStep === 6 && (
        <div className="space-y-6">
          {!assessmentResult ? (
            <Card className="p-8 text-center space-y-3">
              <p className="text-sm text-slate-600">No assessment evaluated yet.</p>
              <Button onClick={handleRunAssessment} loading={evaluating} size="md">
                <Sparkles className="w-4 h-4 mr-1.5" /> Evaluate Expert Rules
              </Button>
            </Card>
          ) : (
            <>
              {/* Classification Banner */}
              <div className={`p-6 rounded-2xl border ${
                assessmentResult.resultCategory === 'COUNSELOR_REVIEW'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : assessmentResult.resultCategory === 'REVIEW_RECOMMENDED'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-sky-50 border-sky-200 text-sky-900'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <Badge variant={assessmentResult.resultCategory} size="lg">
                      {assessmentResult.resultCategory.replace(/_/g, ' ')}
                    </Badge>
                    <h2 className="text-lg font-bold mt-2">Executive Summary</h2>
                    <p className="text-xs sm:text-sm mt-1 leading-relaxed max-w-2xl">
                      {assessmentResult.summary}
                    </p>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="primary"
                    size="md"
                    className="flex-shrink-0 shadow-md"
                  >
                    <Download className="w-4 h-4 mr-1.5" /> Download PDF Report
                  </Button>
                </div>
              </div>

              {/* Triggered Rules Breakdown */}
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Triggered Decision-Support Rules ({assessmentResult.triggeredRules?.length || 0})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Transparent clinical rule evaluation audit</p>
                  </div>
                  <Badge variant="brand" size="sm">Evidence-Based Assessment</Badge>
                </div>

                <div className="space-y-3">
                  {assessmentResult.triggeredRules?.map((tr, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          [{tr.ruleCode}] {tr.name}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          Priority: {tr.priority}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        <strong className="text-slate-800 dark:text-slate-200">Reasoning:</strong> {tr.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Guidance Recommendations */}
              <Card className="p-6 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3">
                  Educational Guidance & Recommended Next Steps
                </h3>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  {assessmentResult.guidance?.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 flex-shrink-0 mt-0.5" />
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Health Notice Disclaimer */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 leading-relaxed">
                <strong>Important Health Notice:</strong> {assessmentResult.disclaimer}
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => handleStepChange(5)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> View Pedigree
            </Button>
            <Link to="/user/dashboard">
              <Button size="sm">Return to Dashboard</Button>
            </Link>
          </div>
        </div>
      )}

      {/* --- ADD MEMBER MODAL --- */}
      <Modal
        isOpen={showMemberModal}
        onClose={() => setShowMemberModal(false)}
        title="Add Family Member"
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="e.g. Eleanor Morgan"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sex *</label>
              <select
                value={memberSex}
                onChange={(e) => setMemberSex(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="FEMALE">Female (Circle)</option>
                <option value="MALE">Male (Square)</option>
                <option value="OTHER">Other / Unknown (Diamond)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={memberDob}
                onChange={(e) => setMemberDob(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
              </input>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={memberIsProband}
                onChange={(e) => setMemberIsProband(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              Designate as Primary Consulting Patient (Proband)
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={memberDeceased}
                onChange={(e) => setMemberDeceased(e.target.checked)}
                className="rounded text-brand-600 focus:ring-brand-500"
              />
              Mark as Deceased
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes</label>
            <textarea
              rows={2}
              value={memberNotes}
              onChange={(e) => setMemberNotes(e.target.value)}
              placeholder="Health history, general observations..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowMemberModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Member
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- ADD RELATIONSHIP MODAL --- */}
      <Modal
        isOpen={showRelModal}
        onClose={() => { setShowRelModal(false); setRelError(''); setRelSearch(''); }}
        title="Add Family Relationship"
      >
        <form onSubmit={handleAddRelationship} className="space-y-4">
          {relError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{relError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">From Member *</label>
            <select
              required
              value={relFrom}
              onChange={(e) => { setRelFrom(e.target.value); setRelError(''); }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">Select Member...</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.sex})</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Relationship Type *</label>
              <span className="text-[11px] text-slate-400">51 pedigree options</span>
            </div>
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search relationships (e.g. maternal, uncle, step, cousin)..."
                value={relSearch}
                onChange={(e) => setRelSearch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50 placeholder:text-slate-400"
              />
            </div>
            <select
              value={relType}
              onChange={(e) => { setRelType(e.target.value); setRelError(''); }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {Object.values(RELATIONSHIP_GROUPS).map(groupName => {
                const groupOptions = RELATIONSHIP_DEFINITIONS.filter(def => {
                  if (def.group !== groupName) return false;
                  if (!relSearch.trim()) return true;
                  const q = relSearch.toLowerCase();
                  return def.label.toLowerCase().includes(q) || def.code.toLowerCase().includes(q);
                });
                if (groupOptions.length === 0) return null;
                return (
                  <optgroup key={groupName} label={groupName}>
                    {groupOptions.map(def => (
                      <option key={def.code} value={def.code}>
                        {def.label}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">To Member *</label>
            <select
              required
              value={relTo}
              onChange={(e) => { setRelTo(e.target.value); setRelError(''); }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              <option value="">Select Target Member...</option>
              {members.filter(m => m._id !== relFrom).map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.sex})</option>
              ))}
            </select>
          </div>

          {/* Dynamic Preview Helper Text */}
          {relFrom && relTo && (
            <div className="p-3 bg-brand-50 border border-brand-200 rounded-xl text-xs text-brand-900 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-brand-950">
                  {getRelationshipPreviewText(
                    relType,
                    members.find(m => m._id === relFrom)?.name || 'From Member',
                    members.find(m => m._id === relTo)?.name || 'To Member'
                  )}
                </p>
                <p className="text-[11px] text-brand-700">
                  Reverse:{' '}
                  {members.find(m => m._id === relTo)?.name} is the{' '}
                  {getRelationshipDefinition(
                    getInverseRelationship(
                      relType,
                      members.find(m => m._id === relFrom)?.sex,
                      members.find(m => m._id === relTo)?.sex
                    )
                  ).label.toLowerCase()}{' '}
                  of {members.find(m => m._id === relFrom)?.name}.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => { setShowRelModal(false); setRelError(''); setRelSearch(''); }}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Establish Relationship
            </Button>
          </div>
        </form>
      </Modal>

      {/* --- ADD CONDITION MODAL --- */}
      <Modal
        isOpen={showCondModal}
        onClose={() => setShowCondModal(false)}
        title="Record Genetic Condition or Carrier Status"
      >
        <form onSubmit={handleAddCondition} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Family Member *</label>
            <select
              required
              value={condMemberId}
              onChange={(e) => setCondMemberId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Member...</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition from Catalogue *</label>
            <select
              required
              value={condId}
              onChange={(e) => setCondId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Condition...</option>
              {conditionsCatalog.map(c => (
                <option key={c._id} value={c._id}>{c.name} ({c.code} - {c.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Status *</label>
              <select
                value={condStatus}
                onChange={(e) => setCondStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="AFFECTED">Clinically Affected (Diagnosed)</option>
                <option value="CARRIER">Carrier (Heterozygous)</option>
                <option value="SUSPECTED">Suspected / Symptoms Present</option>
                <option value="UNAFFECTED">Unaffected / Normal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age at Onset (Years)</label>
              <input
                type="number"
                min="0"
                max="120"
                value={condAge}
                onChange={(e) => setCondAge(e.target.value)}
                placeholder="e.g. 44"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Verification</label>
            <textarea
              rows={2}
              value={condNotes}
              onChange={(e) => setCondNotes(e.target.value)}
              placeholder="e.g. Biopsy confirmed, pathogenic variant identified..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setShowCondModal(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Link Condition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
