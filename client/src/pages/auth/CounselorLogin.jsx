import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { PasswordInput } from '../../components/common/PasswordInput';
import { getFriendlyErrorMessage } from '../../utils/errorHandler';
import { Stethoscope, Mail, ArrowRight, UserCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const CounselorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'COUNSELOR');
      navigate('/counselor/dashboard');
    } catch (err) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('counselor@genetrace.local');
    setPassword('Counselor@123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-xl bg-slate-900 dark:bg-slate-800 text-sky-400 flex items-center justify-center mx-auto border border-slate-700/50 shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            Clinical Provider Portal
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Genetic Counselor Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Review assigned patient pedigrees, clinical rule evaluations, and clinical notes
          </p>
        </div>

        <Card className="p-8 shadow-xs border-slate-200 dark:border-slate-800">
          {error && <Alert type="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Clinical Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counselor@genetrace.local"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 !bg-sky-700 hover:!bg-sky-800 focus:ring-sky-500 text-white"
              size="md"
            >
              Access Clinical Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-sky-700 dark:text-sky-300 hover:text-sky-800 dark:hover:text-sky-200 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/50 rounded-md border border-sky-200/60 dark:border-sky-800/60 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Quick-Fill Demo Counselor (Dr. Sarah Chen)
            </button>
          </div>
        </Card>

        {/* Portal Switcher Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Patient Portal</Link>
          <span>•</span>
          <Link to="/admin/login" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Admin Portal</Link>
        </div>
      </div>
    </div>
  );
};
