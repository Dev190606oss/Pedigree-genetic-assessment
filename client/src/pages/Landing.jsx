import React from 'react';
import { Link } from 'react-router-dom';
import { Dna, GitMerge, Cpu, FileCheck2, ArrowRight, ShieldCheck, Stethoscope, User, Lock, Activity } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const Landing = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
            Dual Academic Project: SEM + AIES Preconception System
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Evidence-Based Preconception <br />
            <span className="bg-gradient-to-r from-brand-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
              Genetic Assessment & Guidance
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Record multi-generational family health histories, generate interactive dynamic pedigrees, and evaluate preconception transmission risks using a transparent, deterministic rule-based expert system.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="shadow-lg shadow-brand-600/20">
                Start Patient Assessment <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" size="lg">
                Explore SEM + AIES Architecture
              </Button>
            </Link>
          </div>

          {/* Key Metric Highlights */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl font-bold text-slate-900">3-Tier</p>
              <p className="text-xs text-slate-500 mt-1">Multi-role RBAC Architecture</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl font-bold text-brand-600">D3.js</p>
              <p className="text-xs text-slate-500 mt-1">Dynamic Pedigree Visualizer</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl font-bold text-indigo-600">100%</p>
              <p className="text-xs text-slate-500 mt-1">Deterministic Rule Inference</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm text-center">
              <p className="text-2xl font-bold text-slate-900">PDF</p>
              <p className="text-xs text-slate-500 mt-1">Clinical Summary Reports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Dedicated Portals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="brand" size="md">Role-Based Access Control</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            Three Dedicated Role Experiences
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Independent, authenticated workspaces tailored for patients, genetic counselors, and system administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Portal */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Patient / Family Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Build your family history step-by-step, visualize dynamic genealogical pedigrees, trigger expert system assessments, and download guidance reports.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li>• Multi-generational lineage builder</li>
                <li>• Interactive pedigree exploration</li>
                <li>• Transparent rule triggers & explanations</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link to="/login" className="w-full block">
                <Button variant="secondary" className="w-full">
                  User Login <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Counselor Portal */}
          <div className="bg-white rounded-2xl border border-sky-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Clinical
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Genetic Counselor Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review assigned patient pedigrees, inspect triggered expert system rules, attach formal clinical recommendations, and manage case workflow statuses.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li>• Case triage queue & assignments</li>
                <li>• Deep pedigree & clinical condition review</li>
                <li>• Clinical notes & recommendations</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link to="/counselor/login" className="w-full block">
                <Button variant="primary" className="w-full !bg-sky-600 hover:!bg-sky-700">
                  Counselor Portal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Admin Portal */}
          <div className="bg-white rounded-2xl border border-purple-200 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Governance
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Administrator Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Govern the live AIES knowledge base, manage rule definitions and operators, curate genetic conditions catalog, assign cases, and inspect audit logs.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li>• Live Rule Engine CRUD & versioning</li>
                <li>• User & Counselor administration</li>
                <li>• Platform analytics & audit trails</li>
              </ul>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6">
              <Link to="/admin/login" className="w-full block">
                <Button variant="dark" className="w-full">
                  Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flowchart */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl py-14 px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="brand" size="md">Core Flow</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold mt-2">
            The Preconception Assessment Pipeline
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            A seamless journey from patient history recording to explainable AI decision support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-brand-400">STEP 01</span>
            <h4 className="font-bold text-sm">Family Lineage Builder</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Record proband, biological parents, siblings, partners, and extended relatives with medical conditions.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-brand-400">STEP 02</span>
            <h4 className="font-bold text-sm">Interactive Pedigree</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore standard genealogical symbols rendered dynamically via D3 with pan, zoom, and member inspector cards.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-brand-400">STEP 03</span>
            <h4 className="font-bold text-sm">AIES Expert Evaluation</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Graph-derived facts are evaluated against deterministic genetic rules to categorize transmission risk.
            </p>
          </div>

          <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 space-y-3">
            <span className="text-xs font-bold text-brand-400">STEP 04</span>
            <h4 className="font-bold text-sm">Guidance & PDF Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent justifications, counselor clinical reviews, educational guidance, and downloadable PDF reports.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
