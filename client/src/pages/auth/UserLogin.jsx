import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import { Dna, Lock, Mail, ArrowRight, UserCheck, Stethoscope, ShieldCheck } from 'lucide-react';

export const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/user/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password, 'USER');
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail('user@pedigree.local');
    setPassword('User@123');
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-600/20">
            <Dna className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Patient Portal Sign In</h2>
          <p className="text-xs text-slate-500">
            Enter your credentials to access your family cases & assessments
          </p>
        </div>

        <Card className="p-8 shadow-lg border-slate-200">
          {error && <Alert type="danger" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
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
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" size="md">
              Sign In to Patient Portal <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick Demo Fill Button */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Quick-Fill Demo Patient Account
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
              Create an account
            </Link>
          </div>
        </Card>

        {/* Portal Switcher Links */}
        <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
          <Link to="/counselor/login" className="flex items-center gap-1 hover:text-sky-600">
            <Stethoscope className="w-3.5 h-3.5" /> Counselor Portal
          </Link>
          <span>•</span>
          <Link to="/admin/login" className="flex items-center gap-1 hover:text-purple-600">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
