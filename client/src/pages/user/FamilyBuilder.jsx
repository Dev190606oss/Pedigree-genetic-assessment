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
  Info,
  RotateCcw,
  FlaskConical,
  ShieldCheck
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
  const [showScenarioModal, setShowScenarioModal] = useState(false);

  // Quick Fill Synthetic Scenarios State
  const [availableScenarios, setAvailableScenarios] = useState([]);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('recessive_consanguinity');
  const [applyingScenario, setApplyingScenario] = useState(false);
  const [resettingCase, setResettingCase] = useState(false);
  const [scenarioMessage, setScenarioMessage] = useState(null);

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
    // Fetch available synthetic scenarios for Quick Fill
    api.get('/families/quick-fill-scenarios')
      .then(res => {
        if (res.data?.success && res.data.data) {
          setAvailableScenarios(res.data.data);
        }
      })
      .catch(() => {});
  }, [id]);

  const handleStepChange = (newStep) => {
    setCurrentStep(newStep);
    setSearchParams({ step: newStep });
  };

  // Apply Synthetic Quick Fill Scenario
  const handleApplyScenario = async (scenarioKey) => {
    setApplyingScenario(true);
    setError('');
    try {
      const res = await api.post(`/families/${id}/quick-fill`, {
        scenarioKey: scenarioKey || selectedScenarioKey
      });
      if (res.data.success) {
        setScenarioMessage({
          type: 'success',
          text: res.data.message || 'Synthetic scenario applied successfully.',
          title: res.data.scenario?.title,
          badge: res.data.scenario?.badge
        });
        setShowScenarioModal(false);
        await fetchFamilyDetails();
        handleStepChange(1); // Jump to members to see populated lineage
      }
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to apply synthetic scenario.');
    } finally {
      setApplyingScenario(false);
    }
  };

  // Reset / Clear Case
  const handleResetCase = async () => {
    if (!window.confirm('Are you sure you want to reset this case? All members, relationships, conditions, and previous assessments will be permanently cleared so you can start fresh.')) {
      return;
    }
    setResettingCase(true);
    try {
      const res = await api.post(`/families/${id}/reset`);
      if (res.data.success) {
        setScenarioMessage({
          type: 'info',
          text: 'Family case has been reset to empty state.'
        });
        await fetchFamilyDetails();
        handleStepChange(0);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reset family case.');
    } finally {
      setResettingCase(false);
    }
  };

  // Quick fill helper for Add Member modal
  const handleQuickFillMember = () => {
    const hasProband = members.some(m => m.isProband);
    if (!hasProband) {
      setMemberName('Alex Morgan (Proband)');
      setMemberSex('FEMALE');
      setMemberDob('1996-04-12');
      setMemberIsProband(true);
      setMemberDeceased(false);
      setMemberNotes('Proband seeking preconception genetic risk assessment.');
    } else {
      const proband = members.find(m => m.isProband);
      setMemberName('Jordan Morgan');
      setMemberSex(proband?.sex === 'FEMALE' ? 'MALE' : 'FEMALE');
      setMemberDob('1994-08-20');
      setMemberIsProband(false);
      setMemberDeceased(false);
      setMemberNotes('Reproductive partner. Carrier screening completed.');
    }
  };

  // Quick fill helper for Add Condition modal
  const handleQuickFillCondition = () => {
    if (members.length === 0 || conditionsCatalog.length === 0) return;
    const targetMember = members.find(m => m.isProband) || members[0];
    setCondMemberId(targetMember._id);

    const chosenCond = conditionsCatalog.find(c => c._id === condId) || conditionsCatalog[0];
    setCondId(chosenCond._id);

    if (chosenCond.category === 'AUTOSOMAL_DOMINANT') {
      setCondStatus('AFFECTED');
      setCondAge('44');
      setCondNotes('Early onset clinical diagnosis confirmed by molecular genetics.');
    } else if (chosenCond.category === 'X_LINKED') {
      const isFemale = targetMember.sex === 'FEMALE';
      setCondStatus(isFemale ? 'CARRIER' : 'AFFECTED');
      setCondAge(isFemale ? '' : '3');
      setCondNotes(isFemale ? 'DNA sequencing confirmed carrier of pathogenic variant.' : 'Factor VIII deficiency with severe clinical phenotype.');
    } else {
      setCondStatus('CARRIER');
      setCondAge('');
      setCondNotes('Heterozygous pathogenic variant identified through targeted carrier screening.');
    }
  };

  // Quick fill helper for Add Relationship modal
  const handleQuickFillRelationship = () => {
    if (members.length < 2) return;
    const proband = members.find(m => m.isProband);
    const other = members.find(m => !m.isProband) || members[1];
    if (proband && other) {
      setRelFrom(proband._id);
      setRelTo(other._id);
      setRelType('PARTNER');
      setRelError('');
    } else {
      setRelFrom(members[0]._id);
      setRelTo(members[1]._id);
      setRelType('PARENT_CHILD');
      setRelError('');
    }
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

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowScenarioModal(true)}
              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200 font-semibold"
              title="Populate a clinically realistic synthetic pedigree for AIES demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> Quick Fill Scenario
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetCase}
              loading={resettingCase}
              className="hover:text-rose-600 hover:border-rose-200"
              title="Reset case to empty state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
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

        {familyData?.family?.name?.includes('[Synthetic Demo]') && (
          <div className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-900 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold">Simulated Clinical Case:</span>
              <span className="text-indigo-700">Populated with valid synthetic pedigree data for syllabus-aligned rule evaluation.</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
              AIES Demo
            </span>
          </div>
        )}

        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(stepIdx) => handleStepChange(stepIdx)}
        />
      </div>

      {scenarioMessage && (
        <Alert type={scenarioMessage.type || 'info'} onClose={() => setScenarioMessage(null)}>
          <div className="flex items-center justify-between">
            <div>
              {scenarioMessage.title && <p className="font-bold">{scenarioMessage.title}</p>}
              <p className="text-xs">{scenarioMessage.text}</p>
            </div>
            {scenarioMessage.badge && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/80 border text-slate-800">
                {scenarioMessage.badge}
              </span>
            )}
          </div>
        </Alert>
      )}

      {error && <Alert type="danger">{error}</Alert>}

      {/* --- STEP 0: BASIC INFO --- */}
      {currentStep === 0 && (
        <div className="space-y-6 max-w-4xl">
          <Card className="p-6 space-y-4">
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

          {/* Quick-Start Synthetic Scenarios Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Quick-Start with Syllabus-Aligned Synthetic Scenarios
                </h3>
                <p className="text-xs text-slate-500">
                  Select a pre-built clinical case to immediately test rule evaluation, forward chaining, and uncertainty handling
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Scenario A */}
              <Card className="p-4 flex flex-col justify-between border-amber-200/60 bg-gradient-to-b from-amber-50/30 to-white hover:border-amber-400 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                      Scenario A
                    </span>
                    <span className="text-[10px] text-slate-500">9 Members</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Autosomal Recessive & Consanguinity
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Couple are 2nd cousins who both carry Cystic Fibrosis (CFTR). Brother is clinically affected.
                  </p>
                  <div className="pt-1 text-[10px] text-slate-400 font-mono">
                    Fires: RULE-AR-01, RULE-CONS-01
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                    onClick={() => handleApplyScenario('recessive_consanguinity')}
                    loading={applyingScenario}
                  >
                    Load Scenario A
                  </Button>
                </div>
              </Card>

              {/* Scenario B */}
              <Card className="p-4 flex flex-col justify-between border-slate-200 hover:border-slate-400 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      Scenario B
                    </span>
                    <span className="text-[10px] text-slate-500">1 Member</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Incomplete Lineage / Adopted Proband
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Proband adopted with zero biological parental records. Demonstrates open-world uncertainty.
                  </p>
                  <div className="pt-1 text-[10px] text-slate-400 font-mono">
                    Fires: R09 (Insufficient Info)
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs font-semibold"
                    onClick={() => handleApplyScenario('incomplete_lineage')}
                    loading={applyingScenario}
                  >
                    Load Scenario B
                  </Button>
                </div>
              </Card>

              {/* Scenario C */}
              <Card className="p-4 flex flex-col justify-between border-indigo-200/60 bg-gradient-to-b from-indigo-50/30 to-white hover:border-indigo-400 transition-colors">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      Scenario C
                    </span>
                    <span className="text-[10px] text-slate-500">7 Members</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs">
                    Huntington Lineage & Parental Age
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Vertical dominant transmission across 3 generations + maternal age 38 + paternal age 44.
                  </p>
                  <div className="pt-1 text-[10px] text-slate-400 font-mono">
                    Fires: RULE-AD-01, AMA, APA, R04, R08
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border-indigo-200"
                    onClick={() => handleApplyScenario('dominant_multirule')}
                    loading={applyingScenario}
                  >
                    Load Scenario C
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* --- STEP 1: MEMBERS --- */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Family Members ({members.length})</h2>
              <p className="text-xs text-slate-500">Record all individuals across maternal and paternal lines</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowScenarioModal(true)}>
                <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-500" /> Demo Scenarios
              </Button>
              <Button onClick={() => setShowMemberModal(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Family Member
              </Button>
            </div>
          </div>

          {members.length === 0 ? (
            <Card className="p-8 text-center space-y-4 max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">No Members Added Yet</h3>
                <p className="text-xs text-slate-500">
                  You can start manually by adding your first family member, or quick-fill a complete synthetic case to immediately test the system.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                <Button onClick={() => setShowMemberModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-1" /> Add First Member (Proband)
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowScenarioModal(true)}
                  size="sm"
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-600" /> Quick-Fill Demo Scenario
                </Button>
              </div>
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <Button variant="secondary" onClick={() => handleStepChange(5)} size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> View Pedigree
            </Button>
            <div className="flex items-center gap-2">
              {assessmentResult?._id && (
                <Link to={`/user/assessments/${assessmentResult._id}`}>
                  <Button variant="secondary" size="sm">
                    View Full Explanation &amp; Audit <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              )}
              <Link to="/user/dashboard">
                <Button size="sm">Return to Dashboard</Button>
              </Link>
            </div>
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

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleQuickFillMember}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Fill Sample Member
            </button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowMemberModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Member
              </Button>
            </div>
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

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleQuickFillRelationship}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Fill Sample Relationship
            </button>
            <div className="flex items-center gap-2">
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

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleQuickFillCondition}
              className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Fill Sample Condition
            </button>
            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setShowCondModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Link Condition
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* --- QUICK FILL SYNTHETIC SCENARIO MODAL --- */}
      <Modal
        isOpen={showScenarioModal}
        onClose={() => setShowScenarioModal(false)}
        title="Quick Fill Synthetic Demonstration Scenario"
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-amber-950">Syllabus-Aligned AIES Clinical Benchmark</p>
              <p className="text-amber-800 leading-relaxed">
                Loading a synthetic scenario populates biologically consistent members, relationships, and condition records. Existing records in this case will be safely replaced.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {availableScenarios.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading scenarios...</div>
            ) : (
              availableScenarios.map(sc => (
                <div
                  key={sc.key}
                  onClick={() => setSelectedScenarioKey(sc.key)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    selectedScenarioKey === sc.key
                      ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedScenarioKey === sc.key}
                        onChange={() => setSelectedScenarioKey(sc.key)}
                        className="text-brand-600 focus:ring-brand-500"
                      />
                      <span className="font-bold text-slate-900 text-xs">{sc.title}</span>
                    </div>
                    <Badge variant={sc.key === 'incomplete_lineage' ? 'default' : 'brand'} size="sm">
                      {sc.badge}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-600 pl-5 mb-2 leading-relaxed">
                    {sc.clinicalDescription}
                  </p>
                  <div className="pl-5 flex flex-wrap items-center gap-3 text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                    <span><strong>Members:</strong> {sc.memberCount}</span>
                    <span><strong>Relationships:</strong> {sc.relationshipCount}</span>
                    <span><strong>Conditions:</strong> {sc.conditionCount}</span>
                    <span className="text-brand-700 font-mono"><strong>Target:</strong> {sc.expectedOutcome?.winningRule} ({sc.expectedOutcome?.category})</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              {members.length > 0 ? `Replaces ${members.length} existing members` : 'Populates fresh pedigree'}
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowScenarioModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                loading={applyingScenario}
                onClick={() => handleApplyScenario(selectedScenarioKey)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Apply Synthetic Scenario
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
