import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ManagePaymentsClient } from "@/templates/egg-tasta/components/payments/manage-payments-client";
import { listSupplierPaymentsAction } from "@/templates/egg-tasta/actions/supplierPayments";

export default async function ManagePaymentsPage() {
  const result = await listSupplierPaymentsAction();
  const initialData = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/supplier-payments/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Supplier Payments</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Payments</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Payments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage all supplier payments.</p>
      </div>

      <ManagePaymentsClient initialData={initialData} />
    </div>
  );
}
