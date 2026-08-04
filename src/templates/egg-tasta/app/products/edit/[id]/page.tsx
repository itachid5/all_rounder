import { getProductAction, getCategoriesAndUnits } from "@/templates/egg-tasta/actions/products";
import { EditProductForm } from "@/templates/egg-tasta/components/products/edit-product-form";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [productRes, catUnitRes] = await Promise.all([
    getProductAction(id),
    getCategoriesAndUnits()
  ]);

  if (!productRes.success || !productRes.product) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-full">
      {/* Breadcrumb Header */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/products/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Products</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Edit Product ({id})</span>
        </nav>
        
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Product</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update product details, pricing, and variants.</p>
      </div>

      <EditProductForm 
        product={productRes.product} 
        categories={catUnitRes.categories || []} 
        units={catUnitRes.units || []} 
      />
    </div>
  );
}
