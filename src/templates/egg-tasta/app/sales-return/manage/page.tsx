import { ChevronRight, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/templates/egg-tasta/components";

export default function ManageSalesReturnsPage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Sales Return</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Sales Returns</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Sales Returns</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and view history of sales returns.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-12">
        <EmptyState 
          title="Module Not Fully Implemented" 
          description="Sales Return processing is coming soon."
          icon={ArrowRightLeft} 
        />
      </div>
    </div>
  );
}
