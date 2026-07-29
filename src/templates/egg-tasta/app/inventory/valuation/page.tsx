
import React from "react";
import { Calculator, FileDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-tasta/components";
import { getStockValuationAction } from "@/templates/egg-tasta/actions/inventory";

export default async function StockValuationPage() {
  const res = await getStockValuationAction();
  const valuations = res.success ? (res.data || []) : [];

  const totalQuantity = valuations.reduce((acc: number, curr: any) => acc + curr.quantity, 0);
  const totalValue = valuations.reduce((acc: number, curr: any) => acc + curr.totalValue, 0);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Inventory</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Stock Valuation</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Stock Valuation</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Financial value of current inventory.</p>
          </div>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Stock Quantity</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{totalQuantity.toLocaleString()} Units</h3>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">৳</span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Inventory Value</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">৳ {totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <Thead>
            <Tr>
              <Th>Product</Th>
              <Th className="text-right">Current Quantity</Th>
              <Th className="text-right">Purchase Price (Avg/Unit)</Th>
              <Th className="text-right">Inventory Value</Th>
            </Tr>
          </Thead>
          <Tbody>
            {valuations.map((item: any) => (
              <Tr key={item.id}>
                <Td className="font-medium text-slate-900 dark:text-white">{item.product}</Td>
                <Td className="text-right font-medium">{item.quantity}</Td>
                <Td className="text-right text-slate-500">৳ {item.price.toFixed(2)}</Td>
                <Td className="text-right font-bold text-slate-900 dark:text-white">৳ {item.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
