import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Dna, ShieldCheck, HeartHandshake, AlertCircle } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Academic Healthcare Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20 text-slate-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                  <Dna className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 text-sm">PEDIGREE</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-xs">
                Preconception Genetic Assessment & Guidance Platform integrating Software Engineering (SEM) and Artificial Intelligence Expert Systems (AIES).
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Portals</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-brand-600">Patient / User Login</Link></li>
                <li><Link to="/counselor/login" className="hover:text-brand-600">Genetic Counselor Portal</Link></li>
                <li><Link to="/admin/login" className="hover:text-brand-600">Administrator Portal</Link></li>
                <li><Link to="/register" className="hover:text-brand-600">Create Account</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Academic Integration</h4>
              <ul className="space-y-2 text-slate-500">
                <li>Software Engineering & Modelling (SEM)</li>
                <li>Rule-Based Expert System (AIES)</li>
                <li>Deterministic Graph Inference</li>
                <li>D3 Interactive Pedigrees</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 uppercase tracking-wider text-[11px]">Academic Disclaimer</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                This platform is an educational clinical decision-support system developed for academic demonstration. It does not replace certified professional clinical diagnosis.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px]">
            <p>© {new Date().getFullYear()} PEDIGREE Platform. Dual SEM + AIES College Capstone Project.</p>
            <p className="mt-2 sm:mt-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Deterministic & Explainable AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
