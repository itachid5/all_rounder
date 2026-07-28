import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { StockAdjustmentClient } from "@/templates/egg-tasta/components/inventory/stock-adjustment-client";
import { listProductsAction } from "@/templates/egg-tasta/actions/products";

export default async function StockAdjustmentPage() {
  const result = await listProductsAction();
  const products = result.success ? result.data : [];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Inventory</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Stock Adjustment</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Stock Adjustment</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Correct inventory when physical stock differs from system stock.</p>
      </div>

      <StockAdjustmentClient products={products.map((p: any) => p.product)} />
    </div>
  );
}
