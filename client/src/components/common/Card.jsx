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
      className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 text-slate-800 dark:text-slate-100 transition-colors duration-150 ${
        hover ? 'duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
