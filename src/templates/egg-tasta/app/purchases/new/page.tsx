import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { NewPurchaseClient } from "@/templates/egg-tasta/components/purchases/new-purchase-client";
import { listSuppliersAction } from "@/templates/egg-tasta/actions/suppliers";
import { listProductsAction } from "@/templates/egg-tasta/actions/products";

export default async function NewPurchasePage() {
  const suppliersRes = await listSuppliersAction({ limit: 1000 });
  const productsRes = await listProductsAction({ limit: 1000 });

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/purchases/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Purchases</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">New Purchase</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">New Purchase</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Create a new purchase invoice and update stock.</p>
      </div>

      <NewPurchaseClient 
        suppliers={suppliersRes.data || []} 
        products={productsRes.data || []} 
      />
    </div>
  );
}
