import { ChevronRight, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/templates/egg-shop/components";

export default function ProfitAndLossPage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/reports/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Reports</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Profit & Loss</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profit & Loss</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">View your income, expenses, and net profit statement.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Export PDF</button>
            <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">Print Report</button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Date Range</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all_time">All Time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-emerald-800 dark:text-emerald-400">Total Revenue</h3>
            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">$0.00</p>
          <p className="text-sm text-emerald-600/80 dark:text-emerald-500/80 mt-1">Gross Sales Income</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-red-800 dark:text-red-400">Total Deductions</h3>
            <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-700 dark:text-red-300">$0.00</p>
          <p className="text-sm text-red-600/80 dark:text-red-500/80 mt-1">Purchases + Expenses</p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-400">Net Profit</h3>
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">$0.00</p>
          <p className="text-sm text-blue-600/80 dark:text-blue-500/80 mt-1">Revenue - Deductions</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm mt-6">
        <div className="p-12 flex items-center justify-center">
           <EmptyState 
             title="Accounting Logic Pending" 
             description="The comprehensive Profit & Loss calculations will be implemented in the accounting phase." 
             icon={DollarSign} 
           />
        </div>
      </div>
    </div>
  );
}
