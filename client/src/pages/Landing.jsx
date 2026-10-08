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
  HeartHandshake,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Landing = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Preconception Health & Lineage Risk Assessment
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight max-w-4xl mx-auto leading-tight">
            Evidence-Based Preconception <br />
            <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 dark:from-brand-400 dark:via-teal-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Family Health Guidance
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Record multi-generational family health histories, visualize dynamic pedigrees, and explore transparent genetic risk evaluations designed to support informed conversations with your healthcare provider.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-brand-600/20">
                Start Health Assessment <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">
                How It Works
              </Button>
            </Link>
          </div>

          {/* 4 User-Centric Benefit Cards */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left">
            {/* Card 1: Family Health History */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Family Health History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Easily document multi-generational medical conditions, carrier statuses, and biological relationships in one secure place.
              </p>
            </div>

            {/* Card 2: Interactive Family Tree */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <GitMerge className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Interactive Family Tree</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clear visual diagrams generated using standardized pedigree notation with intuitive zoom, pan, and member inspection.
              </p>
            </div>

            {/* Card 3: Personalized Assessment */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Personalized Guidance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Evidence-based preconception risk guidance categorized by severity with transparent explanations of every triggered factor.
              </p>
            </div>

            {/* Card 4: Downloadable Reports */}
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Downloadable Reports</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Export clinical summary reports formatted for easy sharing with genetic counselors, obstetricians, or primary physicians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Dedicated Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="brand" size="md">Secure Workspaces</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
            Tailored Experiences for Every Role
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Specialized portals connecting patients, certified genetic counselors, and clinical administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Portal */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Patient & Family Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Build your family tree step-by-step, view clear lineage charts, generate health assessments, and download personalized reports.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Multi-generational lineage builder</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Interactive visual pedigree exploration</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Clear, plain-language risk explanations</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link to="/login" className="w-full block">
                <Button variant="secondary" className="w-full">
                  Sign In as Patient <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Counselor Portal */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-sky-200 dark:border-sky-900/60 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Clinical
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Genetic Counselor Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Review assigned patient pedigrees, inspect clinical rule evaluation results, add professional clinical recommendations, and manage case statuses.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Case queue & triage dashboard</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Comprehensive pedigree & health review</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" /> Counselor clinical notes & recommendations</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link to="/counselor/login" className="w-full block">
                <Button variant="primary" className="w-full !bg-sky-600 hover:!bg-sky-700">
                  Counselor Portal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Portal */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-900/60 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Governance
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Administrator Portal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Maintain clinical rules, manage hereditary condition catalogs, oversee counselor assignments, and review security audit logs.
              </p>
              <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Clinical rules management & versioning</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> User and counselor administration</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Platform audit trails & analytics</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6">
              <Link to="/admin/login" className="w-full block">
                <Button variant="dark" className="w-full">
                  Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-3xl py-14 px-8 border border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge variant="brand" size="md">How It Works</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
              The Assessment Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              A guided experience from family history recording to clear clinical decision support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-brand-400">STEP 01</span>
              <h4 className="font-bold text-sm">Family Lineage Builder</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add family members, biological parents, siblings, partners, and known health conditions.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-brand-400">STEP 02</span>
              <h4 className="font-bold text-sm">Interactive Pedigree</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                View dynamic family charts with standard symbols, interactive member cards, and clear relationship lines.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-brand-400">STEP 03</span>
              <h4 className="font-bold text-sm">Clinical Risk Evaluation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Family relationships and recorded conditions are evaluated against evidence-based genetic rules.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/80 space-y-3">
              <span className="text-xs font-bold text-brand-400">STEP 04</span>
              <h4 className="font-bold text-sm">Guidance & PDF Report</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Access transparent justifications, counselor notes, and downloadable PDF reports for your clinical visit.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
