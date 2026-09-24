import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-sky-50 text-sky-700 border border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
    // Assessment category specific
    INFORMATIONAL: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold',
    REVIEW_RECOMMENDED: 'bg-amber-50 text-amber-800 border border-amber-300 font-semibold',
    COUNSELOR_REVIEW: 'bg-rose-50 text-rose-700 border border-rose-300 font-semibold',
    INSUFFICIENT_INFORMATION: 'bg-slate-100 text-slate-700 border border-slate-300 font-semibold'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md',
    md: 'text-xs px-2.5 py-1 rounded-lg',
    lg: 'text-sm px-3 py-1.5 rounded-lg'
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}>
      {children}
    </span>
  );
};
