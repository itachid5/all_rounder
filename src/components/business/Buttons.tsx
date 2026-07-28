import React from 'react';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = "", 
  ...props 
}: any) {
  const baseClasses = "inline-flex items-center justify-center gap-2 font-medium rounded-md focus:outline-none focus:ring-4 transition-colors disabled:opacity-70 disabled:cursor-not-allowed";
  
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5",
    lg: "px-6 py-3 text-lg"
  };

  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/20",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 focus:ring-slate-500/20 dark:bg-slate-700 dark:hover:bg-slate-600",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/20",
    outline: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500/10 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
  };

  return (
    <button className={`${baseClasses} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, variant = 'ghost', className = "", ...props }: any) {
  const variants: Record<string, string> = {
    ghost: "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
    outline: "border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
  };

  return (
    <button className={`p-2 rounded-md transition-colors flex items-center justify-center ${variants[variant]} ${className}`} {...props}>
      <Icon className="h-4 w-4" />
    </button>
  );
}
