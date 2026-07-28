import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { listCustomersAction } from "@/app/actions/customers";
import { NewCollectionClient } from "@/components/business/customer-collection/new-collection-client";

export default async function ReceiveCollectionPage() {
  const customersRes = await listCustomersAction({ limit: 1000 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/customer-collection/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customer Collection</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Receive Collection</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Receive Collection</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record a new collection from a customer.</p>
      </div>

      <NewCollectionClient customers={customersRes.data || []} />
    </div>
  );
}
