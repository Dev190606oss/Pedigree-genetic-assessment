import React from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Code2, Cpu, CheckCircle2, ShieldCheck, Database, GitBranch, Binary, FileSpreadsheet } from 'lucide-react';

export const About = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <Badge variant="brand" size="md">Academic Project Overview</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          The PEDIGREE System Architecture
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
          One integrated preconception genetic assessment platform combining rigorous Software Engineering (SEM) with a genuine Deterministic Rule-Based Expert System (AIES).
        </p>
      </div>

      {/* SEM vs AIES Dual Integration Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* SEM Column */}
        <Card className="border-t-4 border-t-brand-600 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Software Engineering (SEM)</h3>
              <p className="text-xs text-slate-500">Robust Architecture, Roles, & Data Integrity</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The SEM core provides the full lifecycle of a multi-user clinical platform, with formal requirements tracking, database normalization, backend role-based access control, and dynamic client rendering.
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>13 Normalized Models:</strong> Relational schemas for Users, Families, Members, Relationships, Conditions, Notes, Reports, and Auditing.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Strict 3-Portal RBAC:</strong> Dedicated login workflows (`/login`, `/counselor/login`, `/admin/login`) with backend token verification.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Graph Relationship Integrity:</strong> Prevents self-relationships, cyclic parentage errors, and cross-family links.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>D3.js Visualization:</strong> Interactive vector rendering of standardized genealogical pedigree charts.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <span><strong>Automated Testing:</strong> Vitest API test suite verifying RBAC guards, data mutations, and route authorization.</span>
            </div>
          </div>
        </Card>

        {/* AIES Column */}
        <Card className="border-t-4 border-t-indigo-600 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Expert Systems (AIES)</h3>
              <p className="text-xs text-slate-500">Knowledge Representation, Facts, & Inference</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            The AIES core is a deterministic, explainable rule-based expert system. It rejects black-box neural ambiguity in favor of verifiable facts, Mendelian logic, and priority-based conflict resolution.
          </p>

          <div className="space-y-2.5 text-xs text-slate-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong>Fact Builder:</strong> Extracts topological distance (1st/2nd degree), maternal/paternal transmission, consanguinity, and age-of-onset thresholds.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong>Rule Evaluation:</strong> Evaluates active genetic rules using deterministic operators (`EQUALS`, `EXISTS`, `GREATER_THAN`, `IN`, etc.).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong>Conflict Resolution:</strong> Prioritizes rules by clinical severity (`COUNSELOR_REVIEW` &gt; `REVIEW_RECOMMENDED` &gt; `INFORMATIONAL`).</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong>Explainability Engine:</strong> Provides explicit justification recording exactly which facts triggered each rule.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span><strong>Versioned Governance:</strong> Complete rule versioning and dynamic administrator rule customization.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* The Core Pipeline Flowchart */}
      <Card className="p-8">
        <h3 className="text-base font-bold text-slate-900 mb-6 text-center">
          Integrated SEM + AIES Preconception Assessment Pipeline
        </h3>

        <div className="bg-slate-900 rounded-2xl p-6 text-white font-mono text-xs overflow-x-auto">
          <div className="text-slate-400 mb-2">// Pipeline Execution Sequence</div>
          <div className="text-brand-400 font-bold">Family Graph & Condition Records (MongoDB)</div>
          <div className="text-slate-500 pl-4">│  (Proband, relatives, generational links, carrier/affected status)</div>
          <div className="text-slate-500 pl-4">▼</div>
          <div className="text-sky-400 font-bold">AIES Fact Builder (Normalized Facts Extraction)</div>
          <div className="text-slate-500 pl-4">│  [consanguinity_detected, couple_carrier_match, first_degree_affected, ...]</div>
          <div className="text-slate-500 pl-4">▼</div>
          <div className="text-purple-400 font-bold">Deterministic Rule Matcher & Evaluator (Rule Database)</div>
          <div className="text-slate-500 pl-4">│  IF conditions MATCH facts THEN trigger rule + evaluate severity weight</div>
          <div className="text-slate-500 pl-4">▼</div>
          <div className="text-amber-400 font-bold">Priority Aggregator & Classification</div>
          <div className="text-slate-500 pl-4">│  Categorizes as: INFORMATIONAL | REVIEW_RECOMMENDED | COUNSELOR_REVIEW</div>
          <div className="text-slate-500 pl-4">▼</div>
          <div className="text-emerald-400 font-bold">Explainability & Educational Guidance Engine</div>
          <div className="text-slate-500 pl-4">│  Generates matched fact justifications, personalized steps, and disclaimer</div>
          <div className="text-slate-500 pl-4">▼</div>
          <div className="text-teal-400 font-bold">Clinical Counselor Review & Official PDF Report</div>
        </div>
      </Card>
    </div>
  );
};
