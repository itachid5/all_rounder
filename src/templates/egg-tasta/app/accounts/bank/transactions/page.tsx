import React from "react";
import { ChevronRight, Search, Plus, Printer } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Button } from "@/templates/egg-tasta/components";
import { getTransactionsAction } from "@/templates/egg-tasta/actions/accounts";
import { formatDate } from "@/shared/utils/date";

export default async function BankTransactionsPage() {
  const result = await getTransactionsAction({ accountType: "BANK" });
  const data = result.success ? (result.data || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/accounts/bank" className="hover:text-blue-600 dark:hover:text-blue-400">Bank Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Bank Transactions</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bank Transactions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record and view deposits, withdrawals, and bank charges.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..." 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <select className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Accounts</option>
            {/* Dynamic account options can be rendered here */}
          </select>
        </div>

        <Link href="/app/accounts/bank/transactions/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </Link>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Transaction No</Th>
            <Th>Bank Account</Th>
            <Th>Type</Th>
            <Th>Reference</Th>
            <Th className="text-right">Amount</Th>
            <Th className="text-right">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState title="No Bank Transactions" description="Record your first bank transaction." icon={Search} />
              </Td>
            </Tr>
          ) : (
            data.map((item: any) => (
              <Tr key={item.transaction.id}>
                <Td>{formatDate(item.transaction.date)}</Td>
                <Td className="font-mono text-xs">{item.transaction.referenceNo}</Td>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.accountName}</Td>
                <Td>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.transaction.type === 'IN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                    {item.transaction.type}
                  </span>
                </Td>
                <Td>{item.transaction.referenceNo}</Td>
                <Td className={`text-right font-bold ${item.transaction.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {item.transaction.type === 'IN' ? '+' : '-'}${item.transaction.amount.toFixed(2)}
                </Td>
                <Td className="text-right">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Print">
                    <Printer className="h-4 w-4" />
                  </button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
