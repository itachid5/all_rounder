import { AddSupplierForm } from "@/components/business/suppliers/add-supplier-form";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function AddSupplierPage() {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/suppliers" className="hover:text-blue-600 dark:hover:text-blue-400">Suppliers</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Add Supplier</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Add Supplier</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Create a new supplier profile for your business.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <AddSupplierForm />
      </div>
    </div>
  );
}
