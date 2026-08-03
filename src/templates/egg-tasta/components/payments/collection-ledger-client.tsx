"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, ArrowUpDown, Eye, Printer, FileText } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Badge, ActionMenu, Button } from "@/templates/egg-tasta/components";
import { listCustomerCollectionsAction } from "@/templates/egg-tasta/actions/customerCollections";
import { formatDate } from "@/shared/utils/date";

export function CollectionLedgerClient({ initialData, initialTotal }: { initialData: any[], initialTotal: number }) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listCustomerCollectionsAction({ search, sortBy, sortDir, page, limit });
      if (res.success && res.data) {
        let filtered = res.data;
        if (methodFilter) {
          filtered = filtered.filter((row: any) => row.collection.paymentMethod === methodFilter);
        }
        setData(filtered);
        setTotal(res.total || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    };
    
    const timer = setTimeout(() => fetch(), 300);
    return () => clearTimeout(timer);
  }, [search, methodFilter, sortBy, sortDir, page, limit]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const totalAmount = data.reduce((acc, row) => acc + (row.collection.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ledger by receipt, customer..." 
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
            <option value="">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
            <option value="MOBILE_BANKING">Mobile Banking</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>

        <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 px-4 py-2 rounded-lg">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total Page Collections:</span>
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">৳{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Ledger Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('date')}>
              <div className="flex items-center gap-1">Date {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('collectionNo')}>
              <div className="flex items-center gap-1">Receipt No {sortBy === 'collectionNo' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Customer</Th>
            <Th>Deposit Account</Th>
            <Th>Method</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('amount')}>
              <div className="flex items-center justify-end gap-1">Collection Amount {sortBy === 'amount' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No ledger records found" 
                  description="Customer collection transactions will be recorded here automatically." 
                  icon={Search} 
                />
              </Td>
            </Tr>
          ) : (
            data.map((row) => {
              const item = row.collection;
              return (
                <Tr key={item.id}>
                  <Td className="text-slate-600 dark:text-slate-400">{formatDate(item.date)}</Td>
                  <Td className="font-mono text-xs font-medium text-slate-600">{item.collectionNo}</Td>
                  <Td className="font-medium">{row.customerName}</Td>
                  <Td className="text-slate-500">{row.accountName}</Td>
                  <Td>{item.paymentMethod}</Td>
                  <Td className="text-right font-semibold text-emerald-600 dark:text-emerald-400">৳{item.amount.toFixed(2)}</Td>
                  <Td>
                    <Badge variant={item.status === 'COMPLETED' ? 'success' : 'danger'}>{item.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    <ActionMenu 
                      items={[
                        { label: 'View Receipt', icon: <Eye />, href: `/app/customer-collection/view/${item.id}`, requiredPermission: 'view:customer_collections' },
                        { label: 'Print Receipt', icon: <Printer />, onClick: () => window.print(), requiredPermission: 'print:customer_collections' },
                      ]}
                    />
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
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span> records
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
