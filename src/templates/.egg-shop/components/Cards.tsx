import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, iconColorClass = "text-slate-500 dark:text-slate-400" }: any) {
  return (
    <div className="rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 shadow-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-sm font-medium">{title}</h3>
        {Icon && <Icon className={`h-4 w-4 ${iconColorClass}`} />}
      </div>
      <div className="p-6 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

export function SummaryCard({ title, icon: Icon, children, colSpan = 1, iconColorClass = "text-blue-500", className = "" }: any) {
  return (
    <div className={`rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 shadow-sm lg:col-span-${colSpan} ${className}`}>
      <div className="p-6 flex flex-row items-center space-x-2 border-b border-slate-200 dark:border-slate-800">
        {Icon && <Icon className={`h-5 w-5 ${iconColorClass}`} />}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export function InfoCard({ children, className = "" }: any) {
  return (
    <div className={`rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}
