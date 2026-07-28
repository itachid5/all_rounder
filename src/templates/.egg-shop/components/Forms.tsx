"use client";

import React, { forwardRef } from 'react';
export const TextField = forwardRef(function TextField({ label, error, required, ...props }: any, ref: any) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>}
      <input 
        ref={ref}
        className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white disabled:bg-slate-100 disabled:text-slate-500 dark:disabled:bg-slate-800 dark:disabled:text-slate-400" 
        {...props} 
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export const NumberField = forwardRef(function NumberField({ label, error, required, icon, ...props }: any, ref: any) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-slate-500">{icon}</span>}
        <input 
          ref={ref}
          type="number"
          className={`w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white ${icon ? 'pl-8' : ''}`} 
          {...props} 
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export const SelectField = forwardRef(function SelectField({ label, options, error, required, ...props }: any, ref: any) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>}
      <select 
        ref={ref}
        className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white"
        {...props}
      >
        <option value="">Select option</option>
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export function FormLayout({ children, className = "" }: any) {
  return (
    <div className={`space-y-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function FormGrid({ children, cols = 2 }: any) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-6`}>
      {children}
    </div>
  );
}

export function FormSection({ title, description, icon: Icon, children }: any) {
  return (
    <div className="space-y-4">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-slate-500" />}
          {title}
        </h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
}

export const Textarea = forwardRef(function Textarea({ label, error, required, ...props }: any, ref: any) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label} {required && <span className="text-red-500">*</span>}</label>}
      <textarea 
        ref={ref}
        className="w-full p-2.5 rounded-md border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-slate-700 dark:bg-slate-950 dark:text-white" 
        {...props} 
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});
