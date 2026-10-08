import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export const PasswordInput = ({
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  className = '',
  id,
  name,
  disabled = false,
  showLockIcon = true,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      {showLockIcon && (
        <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      )}
      <input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        id={id}
        name={name}
        className={`w-full ${showLockIcon ? 'pl-9' : 'pl-3'} pr-10 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 focus:border-brand-500 dark:focus:border-brand-400 transition-colors ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex="-1"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 focus:outline-none rounded transition-colors"
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        title={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? (
          <EyeOff className="w-4 h-4" />
        ) : (
          <Eye className="w-4 h-4" />
        )}
      </button>
    </div>
  );
};
