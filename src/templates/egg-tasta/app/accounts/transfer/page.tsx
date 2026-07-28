"use client";

import React from "react";
import { ChevronRight, Search, Plus, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Button } from "@/templates/egg-tasta/components";

export default function FundTransferPage() {
  const data = [
    { id: "1", transferNo: "TRF-001", date: "2024-03-15", from: "Cash", to: "City Bank (0012)", amount: 5000.00, notes: "Daily deposit" },
    { id: "2", transferNo: "TRF-002", date: "2024-03-16", from: "bKash (Shop)", to: "Cash", amount: 1500.00, notes: "Cash out" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/accounts/cash" className="hover:text-blue-600 dark:hover:text-blue-400">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Fund Transfer</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Fund Transfer</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Move money securely between Cash, Bank, and Mobile Wallets.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transfers..." 
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <Button variant="primary" onClick={() => alert("Transfer Fund feature coming soon.")}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Transfer No</Th>
            <Th>From Account</Th>
            <Th></Th>
            <Th>To Account</Th>
            <Th className="text-right">Amount</Th>
            <Th>Notes</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState title="No Transfers" description="Create a new fund transfer." icon={ArrowRightLeft} />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td>{item.date}</Td>
                <Td className="font-mono text-xs">{item.transferNo}</Td>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.from}</Td>
                <Td>
                  <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                </Td>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.to}</Td>
                <Td className="text-right font-bold text-blue-600">${item.amount.toFixed(2)}</Td>
                <Td className="text-sm text-slate-500">{item.notes}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
