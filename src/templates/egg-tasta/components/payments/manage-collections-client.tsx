"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Plus, FileDown, ArrowUpDown, Edit, Eye, Printer, XCircle } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, Badge } from "@/templates/egg-tasta/components";
import { listCustomerCollectionsAction } from "@/templates/egg-tasta/actions/customerCollections";

export function ManageCollectionsClient({ initialData, initialTotal }: { initialData: any[], initialTotal: number }) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listCustomerCollectionsAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
    };
    
    const timer = setTimeout(() => fetch(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sortBy, sortDir, page, limit]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search collections..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/app/customer-collection/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Receive Collection
            </Button>
          </Link>
        </div>
      </div>

      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('collectionNo')}>
              <div className="flex items-center gap-1">Receipt No {sortBy === 'collectionNo' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('date')}>
              <div className="flex items-center gap-1">Date {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Customer</Th>
            <Th>Account</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('amount')}>
              <div className="flex items-center justify-end gap-1">Amount {sortBy === 'amount' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Method</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No collections found" 
                  description="Create a new collection receipt to get started." 
                  icon={Search} 
                  action={
                    <Link href="/app/customer-collection/new">
                      <Button variant="outline" size="sm">Receive Collection</Button>
                    </Link>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((row) => {
              const item = row.collection;
              return (
                <Tr key={item.id}>
                  <Td className="font-mono text-xs font-medium text-slate-500">{item.collectionNo}</Td>
                  <Td className="text-slate-600 dark:text-slate-400">
                    {new Date(item.date).toLocaleDateString()}
                  </Td>
                  <Td className="font-medium">{row.customerName}</Td>
                  <Td className="text-slate-500">{row.accountName}</Td>
                  <Td className="text-right font-medium text-emerald-600 dark:text-emerald-400">${item.amount.toFixed(2)}</Td>
                  <Td>{item.paymentMethod}</Td>
                  <Td>
                    <Badge variant={item.status === 'COMPLETED' ? 'success' : 'danger'}>{item.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Print">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Cancel">
                        <XCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </Td>
                </Tr>
              );
            })
          )}
        </Tbody>
      </Table>
      
      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> results
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page * limit >= total}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
