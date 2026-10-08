import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const UserProfile = () => {
  const { user, role } = useAuth();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Account Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Manage your account credentials and role settings</p>
      </div>

      <Card className="p-6 space-y-6 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white text-2xl font-bold flex items-center justify-center">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{user?.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-2">
              <Badge variant="brand" size="sm">Role: {role}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider mb-1">User Identifier</span>
            <p className="font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
              {user?._id}
            </p>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 font-semibold block uppercase tracking-wider mb-1">Account Role & Permissions</span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
              Your account is authorized as a standard <strong>{role}</strong>. You have permissions to record family cases, build visual pedigrees, run health assessments, and review clinical guidance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
