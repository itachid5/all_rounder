import { ChevronRight, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/templates/egg-tasta/components";

export default function SalesReturnPage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/sales/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Sales</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Sales Return</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sales Return</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Process returns and manage customer refunds.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12">
        <EmptyState 
          title="Return Module Not Fully Implemented" 
          description="Sales Return processing, inventory restoration, and complex customer ledger adjustments will be implemented in the full accounting phase. The basic table structure is ready."
          icon={ArrowRightLeft} 
        />
      </div>
    </div>
  );
}
