import { ChevronRight, FileText, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/templates/egg-shop/components";

export default function CustomerLedgerPage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/customers/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customers</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Customer Ledger</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete transaction history for your customers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Opening Due</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">---</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Sales</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">---</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Running Balance</div>
          <div className="text-2xl font-bold mt-1 text-slate-400">---</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12">
        <EmptyState 
          title="Ledger System Not Initialized" 
          description="The complete ledger transaction engine including Sales, Payments Received, Sales Returns, and Due Adjustments will be available once the Sales Module is completed."
          icon={ArrowRightLeft} 
        />
      </div>
    </div>
  );
}
