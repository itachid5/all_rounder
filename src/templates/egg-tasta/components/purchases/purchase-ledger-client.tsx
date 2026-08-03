"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, ArrowUpDown, Eye, Printer, FileDown, ShoppingCart } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Badge, ActionMenu, Button } from "@/templates/egg-tasta/components";
import { listPurchasesAction } from "@/templates/egg-tasta/actions/purchases";
import { formatDate } from "@/shared/utils/date";

export function PurchaseLedgerClient({ initialData, initialTotal }: { initialData: any[], initialTotal: number }) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 15;

  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listPurchasesAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
      if (res.success && res.data) {
        setData(res.data);
        setTotal(res.total || 0);
      } else {
        setData([]);
        setTotal(0);
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

  const totalPageAmount = data.reduce((acc, row) => acc + (row.purchase?.totalAmount || 0), 0);

  const handleExport = () => {
    const csvHeader = "Invoice No,Date,Supplier,Total Amount,Paid Amount,Due Amount,Status\n";
    const csvRows = data.map(row => {
      const p = row.purchase;
      return `"${p.invoiceNo}","${formatDate(p.date)}","${row.supplierName}",${p.totalAmount},${p.paidAmount},${p.dueAmount},"${p.status}"`;
    }).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase_ledger_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search invoice, supplier..." 
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
            <option value="">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/40 px-3 py-1.5 rounded-lg">
            <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Page Purchases:</span>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-400">৳{totalPageAmount.toFixed(2)}</span>
          </div>

          <Button variant="outline" size="sm" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('date')}>
              <div className="flex items-center gap-1">Date {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('invoiceNo')}>
              <div className="flex items-center gap-1">Invoice No {sortBy === 'invoiceNo' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Supplier</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('totalAmount')}>
              <div className="flex items-center justify-end gap-1">Total {sortBy === 'totalAmount' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="text-right">Paid</Th>
            <Th className="text-right">Due</Th>
            <Th>Payment Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No purchase ledger transactions found" 
                  description="Purchase invoice entries will appear here automatically." 
                  icon={Search} 
                />
              </Td>
            </Tr>
          ) : (
            data.map((row) => {
              const item = row.purchase;
              return (
                <Tr key={item.id}>
                  <Td className="text-slate-600 dark:text-slate-400">{formatDate(item.date)}</Td>
                  <Td className="font-mono text-xs font-medium text-slate-600">{item.invoiceNo}</Td>
                  <Td className="font-medium">{row.supplierName}</Td>
                  <Td className="text-right font-semibold">৳{item.totalAmount.toFixed(2)}</Td>
                  <Td className="text-right text-emerald-600 dark:text-emerald-400">৳{item.paidAmount.toFixed(2)}</Td>
                  <Td className="text-right text-rose-600 dark:text-rose-400">৳{item.dueAmount.toFixed(2)}</Td>
                  <Td>
                    <Badge variant={item.status === 'PAID' ? 'success' : item.status === 'PARTIAL' ? 'warning' : 'danger'}>
                      {item.status}
                    </Badge>
                  </Td>
                  <Td className="text-right">
                    <ActionMenu 
                      items={[
                        { label: 'View Invoice', icon: <Eye />, href: `/app/purchases/manage`, requiredPermission: 'view:purchases' },
                        { label: 'Print Invoice', icon: <Printer />, onClick: () => window.print(), requiredPermission: 'print:purchases' },
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
