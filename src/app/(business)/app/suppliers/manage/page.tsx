import { listSuppliersAction } from "@/app/actions/suppliers";
import { ManageSuppliersClient } from "@/components/business/suppliers/manage-suppliers-client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ManageSuppliersPage() {
  // Fetch initial data
  const res = await listSuppliersAction({ page: 1, limit: 10, sortBy: 'createdAt', sortDir: 'desc' });
  const initialData = res.success ? res.data : [];
  const initialTotal = res.success ? res.total : 0;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/suppliers" className="hover:text-blue-600 dark:hover:text-blue-400">Suppliers</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Suppliers</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Suppliers</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View, search, and manage your suppliers.</p>
      </div>

      <ManageSuppliersClient initialData={initialData} initialTotal={initialTotal} />
    </div>
  );
}
