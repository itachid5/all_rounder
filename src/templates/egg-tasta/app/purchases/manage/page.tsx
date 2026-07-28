import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ManagePurchasesClient } from "@/templates/egg-tasta/components/purchases/manage-purchases-client";
import { listPurchasesAction } from "@/templates/egg-tasta/actions/purchases";

export default async function ManagePurchasesPage() {
  const result = await listPurchasesAction({ page: 1, limit: 10 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/purchases/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Purchases</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Purchases</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Purchases</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage purchase invoices.</p>
      </div>

      <ManagePurchasesClient initialData={result.data || []} initialTotal={result.total || 0} />
    </div>
  );
}
