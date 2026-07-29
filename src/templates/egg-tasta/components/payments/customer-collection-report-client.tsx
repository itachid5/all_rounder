"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, FileDown, ArrowUpDown, Eye, Printer, Calendar } from "lucide-react";
import Link from "next/link";
import { listCustomerCollectionsAction } from "@/templates/egg-tasta/actions/customerCollections";
import { listCustomersAction } from "@/templates/egg-tasta/actions/customers";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, Badge } from "@/templates/egg-tasta/components";
import { Combobox } from "@/templates/egg-tasta/components/Combobox";
import { ReportExportButton } from "@/templates/egg-tasta/components/reports/report-export-button";
import { formatDate } from "@/shared/utils/date";

export function CustomerCollectionReportClient({ initialData, initialTotal, initialSummary }: { initialData: any[], initialTotal: number, initialSummary?: any }) {
  const [isPending, startTransition] = useTransition();
  
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [summary, setSummary] = useState(initialSummary || { totalAmount: 0, cashTotal: 0, bankTotal: 0, mobileTotal: 0, otherTotal: 0 });
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Table State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customerFilter, setCustomerFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  useEffect(() => {
    const fetchCustomers = async () => {
      const res = await listCustomersAction({ limit: 1000 });
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listCustomerCollectionsAction({ 
        search, 
        status: statusFilter,
        startDate,
        endDate,
        customerId: customerFilter,
        paymentMethod: paymentMethodFilter,
        sortBy, 
        sortDir, 
        page, 
        limit 
      });
      if (res.success && res.data) {
        setData(res.data);
        setTotal(res.total || 0);
        setSummary((res as any).summary);
      } else {
        setData([]);
        setTotal(0);
      }
    };
    
    const timer = setTimeout(() => fetch(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, startDate, endDate, customerFilter, paymentMethodFilter, sortBy, sortDir, page, limit]);

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
      {/* Top Bar Actions */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Receipt No, Customer, Mobile..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <ReportExportButton message="Excel export coming soon." label="Export Excel" />
            <ReportExportButton message="PDF export coming soon." label="Export PDF" />
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <Combobox 
            value={customerFilter}
            onChange={(val) => setCustomerFilter(val)}
            options={[
              { value: "", label: "All Customers" },
              ...customers.map((c: any) => ({
                value: c.id,
                label: c.mobile ? `${c.name} • ${c.mobile}` : c.name,
                searchTerms: [c.name, c.customerCode, c.mobile || ""]
              }))
            ]}
            placeholder="All Customers"
            className="w-full"
          />
          <select 
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="">All Payment Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
            <option value="MOBILE_BANKING">Mobile Banking</option>
          </select>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity w-full min-w-max' : 'transition-opacity w-full min-w-max'}>
          <Thead>
            <Tr className="bg-slate-50 dark:bg-slate-800/50">
              <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap" onClick={() => toggleSort('date')}>
                <div className="flex items-center gap-1">Collection Date {sortBy === 'date' && <ArrowUpDown className="h-3 w-3" />}</div>
              </Th>
              <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap" onClick={() => toggleSort('collectionNo')}>
                <div className="flex items-center gap-1">Receipt No {sortBy === 'collectionNo' && <ArrowUpDown className="h-3 w-3" />}</div>
              </Th>
              <Th className="whitespace-nowrap">Customer</Th>
              <Th className="whitespace-nowrap">Mobile</Th>
              <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right whitespace-nowrap" onClick={() => toggleSort('amount')}>
                <div className="flex items-center justify-end gap-1">Collected Amount {sortBy === 'amount' && <ArrowUpDown className="h-3 w-3" />}</div>
              </Th>
              <Th className="whitespace-nowrap">Payment Method</Th>
              <Th className="whitespace-nowrap">Reference No</Th>
              <Th className="whitespace-nowrap">Notes</Th>
              <Th className="whitespace-nowrap text-center">Status</Th>
              <Th className="text-right whitespace-nowrap">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.length === 0 ? (
              <Tr>
                <Td colSpan={10} className="py-8">
                  <EmptyState 
                    title="No collections found" 
                    description="Try adjusting your filters." 
                    icon={Search} 
                  />
                </Td>
              </Tr>
            ) : (
              data.map((row) => {
                const item = row.collection;

                return (
                  <Tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <Td className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(item.date)}
                    </Td>
                    <Td className="font-mono text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.collectionNo}
                    </Td>
                    <Td className="font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {row.customerName || "-"}
                    </Td>
                    <Td className="text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {row.customerMobile || "-"}
                    </Td>
                    <Td className="text-right font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ${item.amount.toFixed(2)}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600 dark:text-slate-400 text-sm">
                      {item.paymentMethod ? item.paymentMethod.replace('_', ' ') : "-"}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600 dark:text-slate-400 text-sm">
                      {item.referenceNo || "-"}
                    </Td>
                    <Td className="whitespace-nowrap text-slate-600 dark:text-slate-400 text-sm max-w-[150px] truncate" title={item.notes || ""}>
                      {item.notes || "-"}
                    </Td>
                    <Td className="whitespace-nowrap text-center">
                      <Badge variant={item.status === 'COMPLETED' ? 'success' : 'danger'}>{item.status}</Badge>
                    </Td>
                    <Td className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors" title="View Receipt">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors" title="Print Receipt">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors" title="Download PDF">
                          <FileDown className="h-4 w-4" />
                        </button>
                      </div>
                    </Td>
                  </Tr>
                );
              })
            )}
          </Tbody>
        </Table>

      {/* Footer Totals Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/30">
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Collections</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{total}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">${(summary?.totalAmount || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cash Total</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">${(summary?.cashTotal || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bank Total</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">${(summary?.bankTotal || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Mobile Banking</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">${(summary?.mobileTotal || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Other Total</p>
          <p className="text-lg font-bold text-slate-700 dark:text-slate-300">${(summary?.otherTotal || 0).toFixed(2)}</p>
        </div>
      </div>

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
