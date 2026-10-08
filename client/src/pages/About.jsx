import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { ShieldCheck, Stethoscope, Lock, HeartHandshake, CheckCircle2, GitMerge, Cpu, FileText } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="brand" size="md">About the Platform</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100">
          Empowering Preconception Care Through Family Lineage
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          PEDIGREE is a comprehensive family health history and preconception genetic assessment platform designed to turn complex hereditary patterns into clear, actionable clinical guidance.
        </p>
      </div>

      {/* Two Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pillar 1: Platform Reliability */}
        <Card className="border-t-4 border-t-brand-600 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold">
              <GitMerge className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Lineage Intelligence & Visualization</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Standardized Pedigree Charting & Graph Integrity</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Accurate preconception guidance begins with rigorous family data modeling. Our lineage engine validates biological relationships, prevents circular connections, and translates complex family records into standardized pedigree trees.
          </p>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Graph Integrity Guardrails:</strong> Strict relationship validation prevents self-references and generational contradictions.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Interactive Pedigree Visualizer:</strong> Dynamic SVG charts rendered using clinical pedigree standard symbols with pan and zoom.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Structured Condition Catalog:</strong> Tracks carrier status, affected states, onset ages, and maternal/paternal lineage.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Secure Role Separation:</strong> Dedicated workspaces for patients, clinical counselors, and administrators.</span>
            </div>
          </div>
        </Card>

        {/* Pillar 2: Transparent Decision Support */}
        <Card className="border-t-4 border-t-indigo-600 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Transparent Clinical Logic</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Explainable, Deterministic Evaluation</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            In healthcare decision-making, transparency is critical. PEDIGREE evaluates family health histories using deterministic, evidence-based clinical rules rather than opaque algorithms.
          </p>

          <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span><strong>Fact-Based Analysis:</strong> Evaluates degree of relationship (1st/2nd degree), consanguinity, and inheritance patterns.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span><strong>100% Explainable Triggers:</strong> Every assessment outcome explicitly details which family factors and clinical rules were matched.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span><strong>Severity Triage:</strong> Clearly categorizes results into Informational, Review Recommended, or Counselor Review.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <span><strong>Clinical Governance:</strong> Rule definitions and clinical guidance are managed and audited by authorized clinical personnel.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Decision Support Pipeline */}
      <Card className="p-8">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2 text-center">
          How the Health Assessment Works
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-6 max-w-xl mx-auto">
          From patient input to clinical guidance, each step is designed for accuracy, transparency, and clinical utility.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400">1. Data Collection</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">Document family lineage, health conditions, and carrier test results.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400">2. Fact Extraction</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">Analyze relationships, generational distance, and affected statuses.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">3. Rule Evaluation</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">Match extracted facts against verified clinical knowledge bases.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">4. Clinical Guidance</span>
            <p className="text-xs text-slate-600 dark:text-slate-400">Generate transparent summaries, action steps, and downloadable reports.</p>
          </div>
        </div>
      </Card>

      {/* Clinical & Privacy Commitment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Health Information Privacy</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Your family health history is sensitive personal information. We employ encrypted communication, role-based access restrictions, and strict session isolation to protect your data at all times.
          </p>
        </Card>

        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <Stethoscope className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Role of Decision Support</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            PEDIGREE is an educational and clinical decision-support tool. It organizes information and highlights potential risks to help you prepare for constructive conversations with certified genetic counselors and physicians.
          </p>
        </Card>
      </div>
    </div>
  );
};
