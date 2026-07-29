import React from 'react';

export function Table({ children, className = "" }: any) {
  // Always render the responsive wrapper to prevent hydration mismatches
  // The root element must be identical during SSR and hydration
  return (
    <div className="w-full max-w-full overflow-x-auto">
      <table className={`w-full min-w-max text-sm text-left border-collapse border-y border-slate-200 dark:border-slate-800 ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }: any) {
  return (
    <thead className="text-xs text-slate-500 bg-slate-50/80 dark:bg-slate-800/80 dark:text-slate-400 uppercase tracking-wider backdrop-blur-sm sticky top-0 z-10">
      {children}
    </thead>
  );
}

export function Tbody({ children }: any) {
  return (
    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 bg-white dark:bg-slate-900">
      {children}
    </tbody>
  );
}

export function Tr({ children, className = "", ...props }: any) {
  // Added zebra rows and better hover effects for ERP feel
  return (
    <tr className={`hover:bg-blue-50/50 dark:hover:bg-blue-900/20 even:bg-slate-50/30 dark:even:bg-slate-800/20 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function Th({ children, className = "", ...props }: any) {
  return (
    <th scope="col" className={`px-4 py-3.5 font-semibold whitespace-nowrap border-b border-slate-200 dark:border-slate-700 ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: any) {
  return (
    <td className={`px-4 py-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function EmptyState({ title, description, icon: Icon, action }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      {Icon && <Icon className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />}
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">{description}</p>}
      {action}
    </div>
  );
}
