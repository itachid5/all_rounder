"use client";

import React, { useState, useMemo } from "react";
import { Search, Plus, FileDown, ArrowUpDown, Edit, Eye, Printer, XCircle } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-shop/components";

export function ManagePaymentsClient({ initialData = [] }: { initialData?: any[] }) {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const matchSearch = item.payment?.paymentNo?.toLowerCase().includes(search.toLowerCase()) || 
                          item.supplierName?.toLowerCase().includes(search.toLowerCase());
      const matchMethod = methodFilter ? item.payment?.paymentMethod === methodFilter : true;
      return matchSearch && matchMethod;
    });
  }, [initialData, search, methodFilter]);

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Payment No or Supplier..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MOBILE_BANKING">Mobile Banking</option>
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex" onClick={() => alert('Export feature coming soon.')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/app/supplier-payments/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="flex items-center gap-1">Payment No <ArrowUpDown className="h-3 w-3" /></div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="flex items-center gap-1">Date <ArrowUpDown className="h-3 w-3" /></div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              <div className="flex items-center gap-1">Supplier <ArrowUpDown className="h-3 w-3" /></div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right">
              <div className="flex items-center justify-end gap-1">Amount <ArrowUpDown className="h-3 w-3" /></div>
            </Th>
            <Th>Payment Method</Th>
            <Th>Status</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right">
              <div className="flex items-center justify-end gap-1">Created Date <ArrowUpDown className="h-3 w-3" /></div>
            </Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredData.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No Payments Found" 
                  description="You haven't recorded any supplier payments yet or no match found." 
                  icon={Search} 
                  action={
                    <Link href="/app/supplier-payments/new">
                      <Button variant="outline" size="sm">Record Payment</Button>
                    </Link>
                  }
                />
              </Td>
            </Tr>
          ) : (
            filteredData.map((row: any) => (
              <Tr key={row.payment.id}>
                <Td className="font-medium text-slate-900 dark:text-white">
                  {row.payment.paymentNo}
                </Td>
                <Td>
                  {new Date(row.payment.date).toLocaleDateString()}
                </Td>
                <Td>
                  {row.supplierName}
                </Td>
                <Td className="text-right font-medium">
                  ${row.payment.amount.toFixed(2)}
                </Td>
                <Td>
                  {row.payment.paymentMethod}
                </Td>
                <Td>
                  <StatusBadge status={row.payment.status} />
                </Td>
                <Td className="text-right text-slate-500">
                  {new Date(row.payment.createdAt).toLocaleDateString()}
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button title="View"><Eye className="h-4 w-4 text-slate-400 hover:text-blue-500" /></button>
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
