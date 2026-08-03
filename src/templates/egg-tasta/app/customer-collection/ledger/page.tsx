import { listCustomerCollectionsAction } from "@/templates/egg-tasta/actions/customerCollections";
import { CollectionLedgerClient } from "@/templates/egg-tasta/components/payments/collection-ledger-client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function CollectionLedgerPage() {
  const result = await listCustomerCollectionsAction({ page: 1, limit: 20 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/customer-collection/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customer Collection</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Collection Ledger</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Collection Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete ledger history of all customer collections and payment transactions.</p>
      </div>

      <CollectionLedgerClient initialData={result.data || []} initialTotal={result.total || 0} />
    </div>
  );
}
