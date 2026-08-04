import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NewSaleClient } from "@/templates/egg-tasta/components/sales/new-sale-client";
import { listCustomersAction } from "@/templates/egg-tasta/actions/customers";
import { listProductsAction } from "@/templates/egg-tasta/actions/products";

export default async function AddSalePage() {
  const customersRes = await listCustomersAction({ limit: 1000 });
  const productsRes = await listProductsAction({ limit: 1000 });

  return (
    <div className="space-y-4 max-w-full">
      {/* Header and Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <nav className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <Link href="/app/sales/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Sales</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Add Sale</span>
          </nav>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">New Sale / Invoice</h1>
        </div>
      </div>

      <NewSaleClient 
        customers={customersRes.data || []} 
        products={productsRes.data || []} 
      />
    </div>
  );
}
