"use client";

import React, { useState } from "react";
import { Search, FileDown, ArrowUpDown, Clock } from "lucide-react";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";

export function SupplierDueClient() {
  const [search, setSearch] = useState("");
  const [dueFilter, setDueFilter] = useState("ALL");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Outstanding Due</div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">$0.00</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="text-sm font-medium text-slate-500">Total Suppliers with Due</div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">0</div>
        </div>
      </div>

      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or code..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <select 
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="ALL">All Due</option>
            <option value="OVERDUE">Overdue</option>
            <option value="ZERO">Zero Due</option>
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex" onClick={() => alert('Export feature coming soon.')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table>
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Supplier Name</Th>
            <Th className="text-right">Total Purchase</Th>
            <Th className="text-right">Total Paid</Th>
            <Th className="text-right">
              <div className="flex items-center justify-end gap-1">Current Due <ArrowUpDown className="h-3 w-3" /></div>
            </Th>
            <Th className="text-right">Last Payment Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={6}>
              <EmptyState 
                title="Due List Not Initialized" 
                description="The due calculation engine will be available once the Purchase Module is completed. Showing structural preview only." 
                icon={Clock} 
              />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
}
