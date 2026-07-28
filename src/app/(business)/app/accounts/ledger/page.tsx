"use client";

import React from "react";
import { ChevronRight, Search, Printer, FileDown, BookOpen } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-shop/components";

export default function AccountLedgerPage() {
  const data = [
    { id: "1", date: "2024-03-15", ref: "TRN-001", type: "Sales Receipt", debit: 1200.00, credit: 0, balance: 1200.00 },
    { id: "2", date: "2024-03-15", ref: "TRN-002", type: "Expense", debit: 0, credit: 500.00, balance: 700.00 },
    { id: "3", date: "2024-03-16", ref: "TRN-003", type: "Bank Deposit", debit: 0, credit: 600.00, balance: 100.00 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/accounts/cash" className="hover:text-blue-600 dark:hover:text-blue-400">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Account Ledger</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Account Ledger</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View the unified financial ledger for any account.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Select Account</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]">
              <option value="cash">Cash In Hand</option>
              <option value="bank1">City Bank (0012)</option>
              <option value="bank2">Brac Bank (1198)</option>
              <option value="bkash">bKash (Shop)</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Date Range</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="custom">Custom...</option>
            </select>
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
            <Th>Reference</Th>
            <Th>Transaction Type</Th>
            <Th className="text-right text-emerald-600">Debit (+)</Th>
            <Th className="text-right text-red-600">Credit (-)</Th>
            <Th className="text-right text-blue-600">Running Balance</Th>
          </Tr>
        </Thead>
        <Tbody>
          {/* Opening Balance Row */}
          <Tr className="bg-slate-50 dark:bg-slate-900/50">
            <Td colSpan={5} className="text-right font-medium">Opening Balance:</Td>
            <Td className="text-right font-bold">$0.00</Td>
          </Tr>
          
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={6}>
                <EmptyState title="No Ledger Entries" description="No transactions found for this account in the selected period." icon={BookOpen} />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td>{item.date}</Td>
                <Td className="font-mono text-xs">{item.ref}</Td>
                <Td>{item.type}</Td>
                <Td className="text-right font-medium text-emerald-600">{item.debit > 0 ? `$${item.debit.toFixed(2)}` : '-'}</Td>
                <Td className="text-right font-medium text-red-600">{item.credit > 0 ? `$${item.credit.toFixed(2)}` : '-'}</Td>
                <Td className="text-right font-bold text-slate-900 dark:text-white">${item.balance.toFixed(2)}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
