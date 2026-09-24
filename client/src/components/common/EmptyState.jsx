import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
        <Icon className="w-7 h-7 text-brand-600" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mx-auto mb-5">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
