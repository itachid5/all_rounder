import React from 'react';

export function Table({ children, className = "" }: any) {
  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 ${className}`}>
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  );
}

export function Thead({ children }: any) {
  return (
    <thead className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 uppercase">
      {children}
    </thead>
  );
}

export function Tbody({ children }: any) {
  return (
    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
      {children}
    </tbody>
  );
}

export function Tr({ children, className = "", ...props }: any) {
  return (
    <tr className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function Th({ children, className = "", ...props }: any) {
  return (
    <th scope="col" className={`px-4 py-3 font-medium whitespace-nowrap ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...props }: any) {
  return (
    <td className={`px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300 ${className}`} {...props}>
      {children}
    </td>
  );
}

export function EmptyState({ title, description, icon: Icon, action }: any) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
      {Icon && <Icon className="h-10 w-10 text-slate-400 mb-3" />}
      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">{description}</p>}
      {action}
    </div>
  );
}
