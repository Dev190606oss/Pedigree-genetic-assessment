import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-medium text-slate-600">Verifying session credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine proper login page based on target URL
    let redirectPath = '/login';
    if (location.pathname.startsWith('/counselor')) {
      redirectPath = '/counselor/login';
    } else if (location.pathname.startsWith('/admin')) {
      redirectPath = '/admin/login';
    }
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-rose-100 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied (403)</h2>
          <p className="text-sm text-slate-600 mb-6">
            Your current role (<span className="font-semibold text-slate-800">{role}</span>) does not have authorization to view this area.
          </p>
          <div className="space-y-3">
            {role === 'USER' && (
              <Link
                to="/user/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Patient Dashboard
              </Link>
            )}
            {role === 'COUNSELOR' && (
              <Link
                to="/counselor/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Counselor Dashboard
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Admin Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};
