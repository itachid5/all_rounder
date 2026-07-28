"use client";

import React from "react";
import { AlertCircle, ShoppingCart, Eye, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-tasta/components";

export default function LowStockPage() {
  const lowStockProducts = [
    { code: "PRD-001", name: "Premium Brown Eggs", current: 50, minimum: 100 },
    { code: "PRD-002", name: "White Eggs (Medium)", current: 0, minimum: 200 },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Inventory</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Low Stock</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Low Stock Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Products currently below their minimum required stock level.</p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Product Code</Th>
            <Th>Product Name</Th>
            <Th className="text-right">Current Stock</Th>
            <Th className="text-right">Minimum Stock</Th>
            <Th>Status</Th>
            <Th className="text-right">Quick Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {lowStockProducts.map((item) => (
            <Tr key={item.code}>
              <Td className="font-medium text-slate-900 dark:text-white">{item.code}</Td>
              <Td>{item.name}</Td>
              <Td className="text-right font-bold text-rose-600 dark:text-rose-400">{item.current}</Td>
              <Td className="text-right text-slate-500">{item.minimum}</Td>
              <Td>
                {item.current === 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Out of Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Low Stock
                  </span>
                )}
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/app/products/view/${item.code}`}>
                    <Button variant="outline" className="p-2 h-8 w-8" title="View Product">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/app/purchases/new">
                    <Button variant="primary" className="p-2 h-8" title="Purchase Product">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Purchase
                    </Button>
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
