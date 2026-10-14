import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-700 hover:bg-brand-800 text-white shadow-xs active:bg-brand-900 dark:bg-brand-600 dark:hover:bg-brand-500',
    secondary: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
    outline: 'bg-transparent border border-brand-700 text-brand-700 hover:bg-brand-50 dark:border-brand-500 dark:text-brand-300 dark:hover:bg-brand-950/40',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs dark:bg-rose-600 dark:hover:bg-rose-500',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 dark:hover:bg-slate-800 dark:text-slate-300',
    dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
    lg: 'text-sm sm:text-base px-4.5 py-2.5 gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
