import React from 'react';
import { Link } from 'react-router-dom';
import {
  Dna,
  Users,
  GitMerge,
  Activity,
  FileText,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  User,
  Cpu,
  CheckCircle2,
  Lock,
  Layers,
  Search,
  BookOpen
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Card } from '../components/common/Card';

export const Landing = () => {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 pb-12 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" />
            Clinical Preconception Decision-Support &amp; Rule-Based Expert System
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Evidence-Based Preconception Genetic Assessment &amp; Guidance
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            GeneTrace combines rigorous genealogical data modeling with a deterministic, rule-based expert system. Record multi-generational family pedigrees, evaluate Mendelian transmission patterns, and generate transparent clinical summaries to support informed conversations with healthcare professionals.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link to="/register">
              <Button size="md" variant="primary">
                Start Patient Assessment <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/expert-system">
              <Button size="md" variant="secondary">
                <Cpu className="w-4 h-4 mr-1.5 text-brand-700 dark:text-brand-400" /> Open AIES Workbench
              </Button>
            </Link>
            <Link to="/about">
              <Button size="md" variant="ghost">
                System Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Core Clinical Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Platform Capabilities
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Engineered for Clinical Transparency &amp; Rigor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Designed to bridge patient family history capture, expert system evaluation, and certified genetic counselor workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-brand-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Family Lineage Modeling</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Structured entry of biological parentage, consanguinity, carrier states, and clinical onset ages across multiple generations.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <GitMerge className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Interactive Pedigree Chart</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Standardized clinical pedigree notation generated dynamically via D3.js with pan, zoom, and member inspector overlays.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Deterministic AIES Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Explainable production rules (IF-THEN) evaluating autosomal recessive, dominant, consanguinity, and aneuploidy indicators.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Clinical Summary Reports</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Export comprehensive PDF summary reports documenting triggered factors, counselor recommendations, and audit histories.
            </p>
          </Card>
        </div>
      </section>

      {/* 3 Dedicated Role Portals */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-400">
            Role Separation
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dedicated Workspaces by Access Role
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Role-based access control protecting clinical integrity and sensitive pedigree records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Patient Portal */}
          <Card className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <Badge variant="neutral" size="sm">Patient Role</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Patient &amp; Family Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Step-by-step family builder, dynamic pedigree charts, plain-language risk evaluations, and historical report downloads.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" /> Multi-generational lineage builder</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" /> Interactive visual pedigree exploration</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-700 dark:text-brand-400" /> Plain-language risk justifications</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/login" className="w-full block">
                <Button variant="secondary" className="w-full">
                  Sign In as Patient <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Counselor Portal */}
          <Card className="flex flex-col justify-between space-y-4 border-slate-300 dark:border-slate-700">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <Badge variant="brand" size="sm">Clinical Specialist</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Genetic Counselor Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Case queue triage, detailed pedigree inspector, rule trigger audit trails, case notes, and formal clinical recommendations.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> Case queue &amp; triage management</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> Clinical pedigree inspection &amp; audit</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" /> Professional clinical notes &amp; sign-off</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/counselor/login" className="w-full block">
                <Button variant="primary" className="w-full">
                  Counselor Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Admin Portal */}
          <Card className="flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <Badge variant="neutral" size="sm">System Admin</Badge>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Administrator Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Knowledge base rule creation and editing, hereditary condition catalog management, user accounts, and immutable audit logging.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-1">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Production rule knowledge base manager</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> Hereditary conditions catalog</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" /> System security audit trail</li>
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/admin/login" className="w-full block">
                <Button variant="secondary" className="w-full">
                  Admin Sign In <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* AIES Expert System Workbench Feature Box */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-brand-900/60 text-brand-300 border border-brand-700/50 text-[11px] font-mono">
                <Cpu className="w-3.5 h-3.5 text-brand-400" />
                AIES Academic Suite
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                GeneTrace Expert System Workbench
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                A dedicated environment for faculty review, syllabus concept demonstrations, and live knowledge engineering inspection.
              </p>
            </div>

            <Link to="/expert-system">
              <Button size="md" variant="primary" className="!bg-brand-600 hover:!bg-brand-500 whitespace-nowrap">
                Launch Workbench <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2 border-t border-slate-800">
            <div className="space-y-1">
              <span className="font-bold text-brand-400">1. Knowledge Base Explorer</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Filterable repository of production rules with IF-THEN predicates, AND/OR logic, and priority weights.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-teal-400">2. Knowledge Representation</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Structured predicate logic propositions, semantic network graphs, and Minsky frame representations.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-indigo-400">3. Multi-Pass Forward Chaining</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Step-by-step evaluation traces with firing rules, asserted facts, and non-firing unmet premise logs.
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-amber-400">4. Backward Chaining &amp; XAI</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Goal hypothesis testing, recursive proof trees, and priority-weighted conflict resolution audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Non-Diagnostic Clinical Scope Disclaimer */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300">Intended Purpose &amp; Regulatory Notice:</strong>
            <p>
              GeneTrace is an educational and clinical decision-support tool designed to synthesize family medical history and highlight potential hereditary risks. It does not provide an autonomous medical diagnosis or genetic test replacement. Patients must review all guidance with a certified genetic counselor or qualified medical provider.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
