import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AddExpenseClient } from "@/components/business/expenses/add-expense-client";
import { getExpenseCategoriesAction } from "@/app/actions/expenses";
import { getAccountsAction } from "@/app/actions/accounts";

export default async function AddExpensePage() {
  const categoriesRes = await getExpenseCategoriesAction();
  const accountsRes = await getAccountsAction();
  const categories = categoriesRes.success ? (categoriesRes.data || []) : [];
  const accounts = accountsRes.success ? (accountsRes.data || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/expenses/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Expenses</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Add Expense</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Add Expense</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record a new expense for the business.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <AddExpenseClient categories={categories} accounts={accounts} />
      </div>
    </div>
  );
}
