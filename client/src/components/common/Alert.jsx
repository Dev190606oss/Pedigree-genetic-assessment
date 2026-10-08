import React from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export const Alert = ({
  type = 'info',
  title,
  children,
  className = ''
}) => {
  const styles = {
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-200',
      icon: <Info className="w-5 h-5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200',
      icon: <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
    },
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
    }
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 ${current.bg} ${className}`}>
      {current.icon}
      <div className="text-sm">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div>{children}</div>
      </div>
    </div>
  );
};
