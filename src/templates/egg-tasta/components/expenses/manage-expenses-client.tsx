"use client";

import React, { useState } from "react";
import { Search, Plus, Printer, XCircle } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";

export function ManageExpensesClient({ initialData }: { initialData: any[] }) {
  const [search, setSearch] = useState("");
  const data = initialData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/app/expenses/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Expense No</Th>
            <Th>Date</Th>
            <Th>Category</Th>
            <Th className="text-right">Amount</Th>
            <Th>Payment Method</Th>
            <Th>Paid To</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No expenses found" 
                  description="Record a new expense to track your business outgoing." 
                  icon={Search} 
                  action={
                    <Link href="/app/expenses/new">
                      <Button variant="outline" size="sm">Add Expense</Button>
                    </Link>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((item: any) => (
              <Tr key={item.expense.id}>
                <Td className="font-mono text-xs font-medium text-slate-500">{item.expense.expenseNo}</Td>
                <Td className="text-slate-600 dark:text-slate-400">{new Date(item.expense.expenseDate).toLocaleDateString()}</Td>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.categoryName || '-'}</Td>
                <Td className="text-right font-medium">${item.expense.amount.toFixed(2)}</Td>
                <Td>{item.expense.paymentMethod}</Td>
                <Td>{item.expense.paidTo || '-'}</Td>
                <Td>
                  <StatusBadge status={item.expense.status === 'COMPLETED' ? 'ACTIVE' : 'INACTIVE'} />
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Print">
                      <Printer className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Cancel Expense">
                      <XCircle className="h-4 w-4" />
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
