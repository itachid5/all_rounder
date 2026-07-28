import React from "react";
import { ChevronRight, Search, Plus, Edit, Archive } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Button, StatusBadge } from "@/templates/egg-tasta/components";
import { getAccountsAction } from "@/templates/egg-tasta/actions/accounts";

export default async function BankAccountsPage() {
  const result = await getAccountsAction({ type: "BANK" });
  const data = result.success ? (result.data || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/accounts/cash" className="hover:text-blue-600 dark:hover:text-blue-400">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Bank Accounts</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Bank Accounts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage all business bank accounts.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search accounts..." 
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <Link href="/app/accounts/bank/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </Link>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Bank Name</Th>
            <Th>Account Name</Th>
            <Th>Account Number</Th>
            <Th>Branch</Th>
            <Th className="text-right">Opening Bal</Th>
            <Th className="text-right">Current Bal</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState title="No Bank Accounts" description="Add your first bank account." icon={Search} />
              </Td>
            </Tr>
          ) : (
            data.map((item: any) => (
              <Tr key={item.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.bankName}</Td>
                <Td>{item.name}</Td>
                <Td className="font-mono text-sm">{item.accountNumber}</Td>
                <Td>{item.branch}</Td>
                <Td className="text-right">${item.openingBalance.toFixed(2)}</Td>
                <Td className="text-right font-bold text-slate-900 dark:text-white">${item.currentBalance.toFixed(2)}</Td>
                <Td>
                  <StatusBadge status={item.status as any} />
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Archive">
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
