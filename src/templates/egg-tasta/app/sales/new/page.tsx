import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NewSaleClient } from "@/templates/egg-tasta/components/sales/new-sale-client";
import { listCustomersAction } from "@/templates/egg-tasta/actions/customers";
import { listProductsAction } from "@/templates/egg-tasta/actions/products";

export default async function NewSalePage() {
  const customersRes = await listCustomersAction({ limit: 1000 });
  const productsRes = await listProductsAction({ limit: 1000 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/sales/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Sales</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">New Sale</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">New Sale</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Create a new sales invoice and deduct stock.</p>
      </div>

      <NewSaleClient 
        customers={customersRes.data || []} 
        products={productsRes.data || []} 
      />
    </div>
  );
}
