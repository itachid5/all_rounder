"use client";

import React from "react";
import { ChevronRight, Search, Plus, Edit, Archive } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Button, StatusBadge } from "@/templates/egg-tasta/components";

export default function MobileBankingPage() {
  const data = [
    { id: "1", provider: "bKash", accName: "Shop Personal", accNo: "01712345678", opening: 1000.00, current: 3500.00, status: "ACTIVE" },
    { id: "2", provider: "Nagad", accName: "Shop Operations", accNo: "01987654321", opening: 500.00, current: 1200.00, status: "ACTIVE" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/accounts/cash" className="hover:text-blue-600 dark:hover:text-blue-400">Accounts</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Mobile Banking</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Mobile Banking</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage bKash, Nagad, Rocket and other wallets.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search wallets..." 
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <Button variant="primary" onClick={() => alert("Add Wallet feature coming soon.")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Wallet
        </Button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Provider</Th>
            <Th>Account Name</Th>
            <Th>Account Number</Th>
            <Th className="text-right">Opening Bal</Th>
            <Th className="text-right">Current Bal</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState title="No Mobile Wallets" description="Add your first mobile banking account." icon={Search} />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-200">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.provider === 'bKash' ? 'bg-pink-500' : 'bg-orange-500'}`}></span>
                  {item.provider}
                </Td>
                <Td>{item.accName}</Td>
                <Td className="font-mono text-sm">{item.accNo}</Td>
                <Td className="text-right">${item.opening.toFixed(2)}</Td>
                <Td className="text-right font-bold text-slate-900 dark:text-white">${item.current.toFixed(2)}</Td>
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
