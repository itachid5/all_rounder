import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getExpenseReportSummaryAction } from "@/templates/egg-tasta/actions/expenses";
import { ExpenseReportClient } from "@/templates/egg-tasta/components/expenses/expense-report-client";

export default async function ExpenseReportPage() {
  const summaryRes = await getExpenseReportSummaryAction("this_month");

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/expenses/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Expenses</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Expense Report</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Expense Report</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">High-level insights, head breakdown, trends, and analytical reports.</p>
      </div>

      <ExpenseReportClient initialSummary={summaryRes.data || {}} />
    </div>
  );
}
