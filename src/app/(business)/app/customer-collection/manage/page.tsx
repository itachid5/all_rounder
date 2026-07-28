import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ManageCollectionsClient } from "@/components/business/payments/manage-collections-client";
import { listCustomerCollectionsAction } from "@/app/actions/customerCollections";

export default async function ManageCollectionsPage() {
  const result = await listCustomerCollectionsAction({ page: 1, limit: 10 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/customer-collection/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customer Collection</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Collections</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Collections</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all customer collections.</p>
      </div>

      <ManageCollectionsClient initialData={result.data || []} initialTotal={result.total || 0} />
    </div>
  );
}
