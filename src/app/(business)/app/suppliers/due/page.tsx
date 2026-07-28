import { SupplierDueClient } from "@/components/business/suppliers/supplier-due-client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SupplierDuePage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/suppliers/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Suppliers</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Supplier Due List</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Supplier Due List</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor outstanding supplier balances and payment schedules.</p>
      </div>

      <SupplierDueClient />
    </div>
  );
}
