import { AddProductForm } from "@/components/business/products/add-product-form";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/products" className="hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Add Product</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Add Product</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Create a new product in your catalog.</p>
      </div>

      <AddProductForm />
    </div>
  );
}
