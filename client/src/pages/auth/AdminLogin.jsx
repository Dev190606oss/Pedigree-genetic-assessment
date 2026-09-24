import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Cpu, Lock, Mail, ArrowRight, UserCheck, ShieldCheck } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const AdminLogin = () => {
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
      await login(email, password, 'ADMIN');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@pedigree.local');
    setPassword('Admin@123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-600/20">
            <Cpu className="w-6 h-6" />
          </div>
          <Badge variant="purple" size="md">System Administration Portal</Badge>
          <h2 className="text-2xl font-extrabold text-slate-900">Administrator Sign In</h2>
          <p className="text-xs text-slate-500">
            Govern AIES rule knowledge base, users, conditions, and system audit logs
          </p>
        </div>

        <Card className="p-8 shadow-lg border-purple-100">
          {error && <Alert type="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pedigree.local"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
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
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2 !bg-purple-600 hover:!bg-purple-700 focus:ring-purple-500"
              size="md"
            >
              Access Admin Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-purple-700 hover:text-purple-800 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Quick-Fill Demo Admin Account
            </button>
          </div>
        </Card>

        {/* Portal Switcher Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/login" className="hover:text-brand-600">Patient Portal</Link>
          <span>•</span>
          <Link to="/counselor/login" className="hover:text-sky-600">Counselor Portal</Link>
        </div>
      </div>
    </div>
  );
};
