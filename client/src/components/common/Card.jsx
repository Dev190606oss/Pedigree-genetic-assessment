import React from 'react';

export const Card = ({
  children,
  className = '',
  hover = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs p-5 sm:p-6 text-slate-800 dark:text-slate-100 transition-colors duration-150 ${
        hover ? 'transition-all duration-150 hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
