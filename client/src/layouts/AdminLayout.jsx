import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Navbar } from './Navbar';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  BookOpen,
  Cpu,
  UserCheck,
  ShieldAlert
} from 'lucide-react';

export const AdminLayout = () => {
  const navItems = [
    { to: '/admin/dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/counselors', label: 'Counselor Roster', icon: Stethoscope },
    { to: '/admin/conditions', label: 'Condition Catalog', icon: BookOpen },
    { to: '/admin/rules', label: 'Clinical Rules Engine', icon: Cpu },
    { to: '/admin/assignments', label: 'Case Assignments', icon: UserCheck },
    { to: '/admin/audit-logs', label: 'System Audit Logs', icon: ShieldAlert },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/80 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        {/* Admin Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm sticky top-24 space-y-6 transition-colors">
            <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-800/60 flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs font-bold text-purple-900 dark:text-purple-200">Admin Control Center</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">Knowledge Base & Governance</p>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2 block">
                System Governance
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
                            ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
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
