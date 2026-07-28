"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Plus, FileDown, ArrowUpDown, Eye, Printer, XCircle, ArrowRightLeft } from "lucide-react";
import Link from "next/link";
import { listSalesAction, cancelSaleAction } from "@/templates/egg-tasta/actions/sales";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, Badge } from "@/templates/egg-tasta/components";

export function ManageSalesClient({ initialData, initialTotal }: { initialData: any[], initialTotal: number }) {
  const [isPending, startTransition] = useTransition();
  
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  // Table State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listSalesAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
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

  const handleCancel = async (id: string, invoiceNo: string) => {
    if (!confirm(`Are you sure you want to cancel Invoice ${invoiceNo}? This action should ideally reverse stock and customer ledger.`)) return;
    
    await cancelSaleAction(id);
    const res = await listSalesAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by Invoice No..." 
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
          <Button variant="outline" className="hidden sm:flex" onClick={() => alert('Export feature coming soon.')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link href="/app/sales/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('invoiceNo')}>
              <div className="flex items-center gap-1">Invoice No {sortBy === 'invoiceNo' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('date')}>
              <div className="flex items-center gap-1">Date {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Customer</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('grandTotal')}>
              <div className="flex items-center justify-end gap-1">Total {sortBy === 'grandTotal' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="text-right">Paid</Th>
            <Th className="text-right">Due</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No sales found" 
                  description="Try adjusting your filters or create a new sale." 
                  icon={Search} 
                  action={
                    <Link href="/app/sales/new">
                      <Button variant="outline" size="sm">New Sale</Button>
                    </Link>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((row) => {
              const item = row.sale;
              return (
                <Tr key={item.id}>
                  <Td className="font-mono text-xs font-medium text-slate-500">{item.invoiceNo}</Td>
                  <Td className="text-slate-600 dark:text-slate-400">
                    {new Date(item.date).toLocaleDateString()}
                  </Td>
                  <Td className="font-medium">{row.customerName}</Td>
                  <Td className="text-right font-medium">${item.grandTotal.toFixed(2)}</Td>
                  <Td className="text-right text-emerald-600 dark:text-emerald-400 font-medium">${item.paidAmount.toFixed(2)}</Td>
                  <Td className="text-right text-red-600 dark:text-red-400 font-medium">${item.dueAmount.toFixed(2)}</Td>
                  <Td>
                    <Badge variant={item.status === 'COMPLETED' ? 'success' : 'danger'}>{item.status}</Badge>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors" title="Print">
                        <Printer className="h-4 w-4" />
                      </button>
                      <Link href="/app/sales/returns">
                        <button className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded dark:hover:text-purple-400 dark:hover:bg-purple-900/30 transition-colors" title="Return Sale">
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                      </Link>
                      {item.status !== 'CANCELLED' && (
                        <button onClick={() => handleCancel(item.id, item.invoiceNo)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors" title="Cancel">
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
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
