import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import { LayoutDashboard, ClipboardList, Stethoscope, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const CounselorLayout = () => {
  const navItems = [
    { to: '/counselor/dashboard', label: 'Counselor Dashboard', icon: LayoutDashboard },
    { to: '/counselor/cases', label: 'Assigned Cases Queue', icon: ClipboardList }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        {/* Counselor Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm sticky top-24 space-y-6">
            <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center gap-2.5">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <div>
                <p className="text-xs font-bold text-sky-900">Clinical Portal</p>
                <p className="text-[10px] text-sky-600">Genetic Counselor Review</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">
                Clinical Workflow
              </span>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-sky-50 text-sky-800 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-sky-600" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
