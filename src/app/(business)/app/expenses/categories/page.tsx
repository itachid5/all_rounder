import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ExpenseCategoriesClient } from "@/components/business/expenses/expense-categories-client";

export default function ExpenseCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/expenses/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Expenses</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Expense Categories</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Expense Categories</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage categories for tracking various business expenses.</p>
      </div>

      <ExpenseCategoriesClient />
    </div>
  );
}
