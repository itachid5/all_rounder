"use client";

import React, { useState, useTransition } from "react";
import { Search, ArrowUpDown, Eye, Printer, FileText } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Badge, ActionMenu, Button } from "@/templates/egg-tasta/components";
import { formatDate } from "@/shared/utils/date";
import { useCurrency } from "@/shared/components/regional-context";

export function PaymentLedgerClient({ initialData }: { initialData: any[] }) {
  const { symbol } = useCurrency();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 15;

  let filtered = initialData.filter((row) => {
    const p = row.payment || row;
    const sName = row.supplierName || p.supplierName || "";
    const pNo = p.paymentNo || p.voucherNo || "";
    const matchesSearch = !search || sName.toLowerCase().includes(search.toLowerCase()) || pNo.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = !methodFilter || (p.paymentMethod || p.method) === methodFilter;
    return matchesSearch && matchesMethod;
  });

  filtered.sort((a, b) => {
    const itemA = a.payment || a;
    const itemB = b.payment || b;
    let valA = itemA[sortBy] || "";
    let valB = itemB[sortBy] || "";
    if (sortDir === 'asc') {
      return valA > valB ? 1 : -1;
    }
    return valA < valB ? 1 : -1;
  });

  const totalAmount = filtered.reduce((acc, row) => acc + ((row.payment?.amount || row.amount) || 0), 0);
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

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
      {/* Top Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search payment voucher, supplier..." 
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
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Total Page Payments:</span>
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400">{symbol}{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment Ledger Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('date')}>
              <div className="flex items-center gap-1">Date {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('paymentNo')}>
              <div className="flex items-center gap-1">Voucher No {sortBy === 'paymentNo' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Supplier</Th>
            <Th>Account</Th>
            <Th>Method</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('amount')}>
              <div className="flex items-center justify-end gap-1">Paid Amount {sortBy === 'amount' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginated.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No payment ledger records found" 
                  description="Supplier payment transactions will appear here once recorded." 
                  icon={Search} 
                />
              </Td>
            </Tr>
          ) : (
            paginated.map((row, idx) => {
              const item = row.payment || row;
              return (
                <Tr key={item.id || idx}>
                  <Td className="text-slate-600 dark:text-slate-400">{formatDate(item.date)}</Td>
                  <Td className="font-mono text-xs font-medium text-slate-600">{item.paymentNo || item.voucherNo}</Td>
                  <Td className="font-medium">{row.supplierName || item.supplierName}</Td>
                  <Td className="text-slate-500">{row.accountName || item.accountName || "Default Cash"}</Td>
                  <Td>{item.paymentMethod || item.method}</Td>
                  <Td className="text-right font-semibold text-blue-600 dark:text-blue-400">{symbol}{(item.amount || 0).toFixed(2)}</Td>
                  <Td>
                    <Badge variant={item.status === 'COMPLETED' ? 'success' : 'danger'}>{item.status || 'COMPLETED'}</Badge>
                  </Td>
                  <Td className="text-right">
                    <ActionMenu 
                      items={[
                        { label: 'View Voucher', icon: <Eye />, href: `/app/supplier-payments/manage`, requiredPermission: 'view:supplier_payments' },
                        { label: 'Print Voucher', icon: <Printer />, onClick: () => window.print(), requiredPermission: 'print:supplier_payments' },
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
