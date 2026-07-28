import { ChevronRight, Search, Printer, FileDown, Plus } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Button } from "@/templates/egg-shop/components";
import { getTransactionsAction } from "@/templates/egg-tasta/actions/accounts";

export default async function CashBookPage() {
  const result = await getTransactionsAction({ accountType: "CASH" });
  const data = result.success ? (result.data || []) : [];

  let balance = 0;

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/accounts/cash" className="hover:text-blue-600 dark:hover:text-blue-400">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Cash Book</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Cash Book</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track daily cash-in-hand transactions.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Date Filter</label>
            <input type="date" className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="relative flex items-end">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search description or TRN..." 
                 className="pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
               />
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 items-end">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition-colors flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Transaction No</Th>
            <Th>Type</Th>
            <Th>Description</Th>
            <Th className="text-right text-emerald-600">Cash In (+)</Th>
            <Th className="text-right text-red-600">Cash Out (-)</Th>
            <Th className="text-right text-blue-600">Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState title="No Cash Transactions" description="Your cash book is empty." icon={Search} />
              </Td>
            </Tr>
          ) : (
            data.reverse().map((item: any) => {
              if (item.transaction.type === 'IN') balance += item.transaction.amount;
              else balance -= item.transaction.amount;

              return (
                <Tr key={item.transaction.id}>
                  <Td>{new Date(item.transaction.date).toLocaleDateString()}</Td>
                  <Td className="font-mono text-xs">{item.transaction.referenceNo}</Td>
                  <Td>{item.transaction.referenceType}</Td>
                  <Td>{item.transaction.description}</Td>
                  <Td className="text-right font-medium text-emerald-600">{item.transaction.type === 'IN' ? `$${item.transaction.amount.toFixed(2)}` : '-'}</Td>
                  <Td className="text-right font-medium text-red-600">{item.transaction.type === 'OUT' ? `$${item.transaction.amount.toFixed(2)}` : '-'}</Td>
                  <Td className="text-right font-bold text-slate-900 dark:text-white">${balance.toFixed(2)}</Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
    </div>
  );
}
