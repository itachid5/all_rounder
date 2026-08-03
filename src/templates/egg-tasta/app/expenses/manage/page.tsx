import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getExpensesAction, getExpenseCategoriesAction } from "@/templates/egg-tasta/actions/expenses";
import { ManageExpensesClient } from "@/templates/egg-tasta/components/expenses/manage-expenses-client";

export default async function ManageExpensesPage() {
  const [expensesRes, categoriesRes] = await Promise.all([
    getExpensesAction({ page: 1, limit: 10 }),
    getExpenseCategoriesAction(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/expenses/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Expenses</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Expenses</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Expenses</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Search, filter, view, edit, and export business expense records.</p>
      </div>

      <ManageExpensesClient
        initialData={expensesRes.data || []}
        initialTotal={expensesRes.total || 0}
        categories={categoriesRes.data || []}
      />
    </div>
  );
}
