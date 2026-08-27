import React from 'react';

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="saas-card animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/3" />
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 4 }) => {
  return (
    <div className="saas-table-container animate-pulse p-4 space-y-4">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800 rounded w-full" />
      ))}
    </div>
  );
};

export default { CardSkeleton, TableSkeleton };
