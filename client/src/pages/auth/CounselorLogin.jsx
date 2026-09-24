import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Stethoscope, Lock, Mail, ArrowRight, UserCheck, ShieldAlert } from 'lucide-react';
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
      setError(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('counselor@pedigree.local');
    setPassword('Counselor@123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <Badge variant="info" size="md">Clinical Provider Portal</Badge>
          <h2 className="text-2xl font-extrabold text-slate-900">Genetic Counselor Sign In</h2>
          <p className="text-xs text-slate-500">
            Review assigned patient pedigrees, expert rule evaluations, and clinical notes
          </p>
        </div>

        <Card className="p-8 shadow-lg border-sky-100">
          {error && <Alert type="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="counselor@pedigree.local"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 !bg-sky-600 hover:!bg-sky-700 focus:ring-sky-500"
              size="md"
            >
              Access Clinical Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-sky-700 hover:text-sky-800 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Quick-Fill Demo Counselor (Dr. Sarah Chen)
            </button>
          </div>
        </Card>

        {/* Portal Switcher Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/login" className="hover:text-brand-600">Patient Portal</Link>
          <span>•</span>
          <Link to="/admin/login" className="hover:text-purple-600">Admin Portal</Link>
        </div>
      </div>
    </div>
  );
};
