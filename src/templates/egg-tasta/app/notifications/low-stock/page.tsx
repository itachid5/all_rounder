"use client";

import React from "react";
import { AlertTriangle, Package, ExternalLink, Archive, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function LowStockAlertsPage() {
  const products = [
    { id: 1, name: "Premium Brown Eggs", stock: 15, minStock: 50, status: "Low Stock" },
    { id: 2, name: "White Eggs (Small)", stock: 0, minStock: 30, status: "Out of Stock" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Low Stock Alerts</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Low Stock Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Automatically tracking inventory items that need reordering.</p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Product</Th>
            <Th className="text-right">Current Stock</Th>
            <Th className="text-right">Minimum Stock</Th>
            <Th>Status</Th>
            <Th className="text-right">Quick Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((item) => (
            <Tr key={item.id}>
              <Td className="font-medium text-slate-900 dark:text-slate-200">
                <div className="flex items-center">
                  <Package className="h-4 w-4 text-slate-400 mr-2" />
                  {item.name}
                </div>
              </Td>
              <Td className={`text-right font-bold ${item.stock === 0 ? 'text-rose-600' : 'text-yellow-600'}`}>
                {item.stock}
              </Td>
              <Td className="text-right text-slate-500">{item.minStock}</Td>
              <Td>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  item.stock === 0 ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300'
                }`}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {item.status}
                </span>
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href="/app/products/manage">
                    <button className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center">
                      <ExternalLink className="h-3 w-3 mr-1" /> View
                    </button>
                  </Link>
                  <Link href="/app/purchases/new">
                    <button className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center border border-indigo-200 dark:border-indigo-800 px-2 py-1 rounded">
                      <Archive className="h-3 w-3 mr-1" /> Purchase
                    </button>
                  </Link>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
