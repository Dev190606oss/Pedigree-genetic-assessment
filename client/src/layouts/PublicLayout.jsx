import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Dna, ShieldCheck, HeartHandshake, FileText, Users, Sparkles } from 'lucide-react';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modern Product Healthcare Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20 text-slate-600 dark:text-slate-400 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
                  <Dna className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">PEDIGREE</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
                A modern family health history and preconception genetic assessment platform empowering families and clinical genetic counselors with transparent, evidence-based guidance.
              </p>
            </div>

            {/* Portals */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Portals</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Patient Portal</Link></li>
                <li><Link to="/counselor/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Genetic Counselor Portal</Link></li>
                <li><Link to="/admin/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Clinical Administrator</Link></li>
                <li><Link to="/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Create Account</Link></li>
              </ul>
            </div>

            {/* Product Capabilities */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Platform</h4>
              <ul className="space-y-2 text-slate-500 dark:text-slate-400">
                <li><Link to="/about" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">About the Platform</Link></li>
                <li>Interactive Pedigree Builder</li>
                <li>Evidence-Based Clinical Rules</li>
                <li>Downloadable Health Summaries</li>
              </ul>
            </div>

            {/* Health Notice */}
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Health Notice</h4>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                PEDIGREE provides structured risk assessments and educational guidance based on documented family history. It is designed to assist informed discussions with certified genetic counselors and healthcare providers, and does not provide an autonomous clinical diagnosis.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-slate-400 dark:text-slate-500 text-[11px]">
            <p>© {new Date().getFullYear()} PEDIGREE Health Technologies. All rights reserved.</p>
            <p className="mt-2 sm:mt-0 flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" /> Evidence-Based Decision Support
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
