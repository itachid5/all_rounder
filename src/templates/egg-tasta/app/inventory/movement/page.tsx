"use client";

import React from "react";
import { Search, FileDown, ArrowUpDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function StockMovementPage() {
  const movements = [
    { id: 1, date: "2024-03-18", ref: "PUR-00001", product: "Premium Brown Eggs", type: "Purchase", in: 500, out: 0, balance: 500, source: "Purchases" },
    { id: 2, date: "2024-03-18", ref: "SAL-00001", product: "Premium Brown Eggs", type: "Sale", in: 0, out: 50, balance: 450, source: "Sales" },
    { id: 3, date: "2024-03-19", ref: "ADJ-00001", product: "Premium Brown Eggs", type: "Stock Adjustment", in: 0, out: 5, balance: 445, source: "Inventory" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Inventory</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Stock Movement</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Stock Movement</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete history of all inventory transactions.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search reference or product..." 
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Movement Types</option>
            <option value="Purchase">Purchase</option>
            <option value="Sale">Sale</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Return">Return</option>
          </select>
          <input type="date" className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <Button variant="outline" className="shrink-0 w-full sm:w-auto">
          <FileDown className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th><div className="flex items-center gap-1 cursor-pointer">Date <ArrowUpDown className="h-3 w-3" /></div></Th>
            <Th>Reference No</Th>
            <Th>Product</Th>
            <Th>Movement Type</Th>
            <Th className="text-right">Stock In</Th>
            <Th className="text-right">Stock Out</Th>
            <Th className="text-right font-bold text-slate-900 dark:text-white">Balance</Th>
            <Th>Source Module</Th>
          </Tr>
        </Thead>
        <Tbody>
          {movements.map((item) => (
            <Tr key={item.id}>
              <Td className="whitespace-nowrap">{item.date}</Td>
              <Td className="font-medium text-blue-600 dark:text-blue-400">{item.ref}</Td>
              <Td>{item.product}</Td>
              <Td>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  item.type === 'Purchase' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300' :
                  item.type === 'Sale' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' :
                  'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300'
                }`}>
                  {item.type}
                </span>
              </Td>
              <Td className="text-right text-emerald-600 dark:text-emerald-400 font-medium">{item.in > 0 ? `+${item.in}` : '-'}</Td>
              <Td className="text-right text-rose-600 dark:text-rose-400 font-medium">{item.out > 0 ? `-${item.out}` : '-'}</Td>
              <Td className="text-right font-bold text-slate-900 dark:text-white">{item.balance}</Td>
              <Td className="text-slate-500">{item.source}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
