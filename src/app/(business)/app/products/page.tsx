import { listProductsAction } from "@/app/actions/products";
import { ProductListClient } from "@/components/business/products/product-list-client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function ProductListPage() {
  // Fetch initial data
  const res = await listProductsAction({ page: 1, limit: 10, sortBy: 'createdAt', sortDir: 'desc' });
  const initialData = res.success ? res.data : [];
  const initialTotal = res.success ? res.total : 0;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Product List</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Products</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage your catalog of products.</p>
      </div>

      <ProductListClient initialData={initialData} initialTotal={initialTotal} />
    </div>
  );
}
