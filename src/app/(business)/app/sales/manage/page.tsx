import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ManageSalesClient } from "@/components/business/sales/manage-sales-client";
import { listSalesAction } from "@/app/actions/sales";

export default async function ManageSalesPage() {
  const result = await listSalesAction({ page: 1, limit: 10 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/sales/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Sales</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Sales</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Sales</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage sales invoices.</p>
      </div>

      <ManageSalesClient initialData={result.data || []} initialTotal={result.total || 0} />
    </div>
  );
}
