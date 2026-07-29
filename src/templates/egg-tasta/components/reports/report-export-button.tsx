"use client";

import React from "react";

export function ReportExportButton({ 
  message = "Export feature coming soon.",
  label = "Export PDF"
}: { 
  message?: string;
  label?: string;
}) {
  return (
    <button 
      className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" 
      onClick={() => alert(message)}
    >
      {label}
    </button>
  );
}
