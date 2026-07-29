"use client";

import React, { useState, useEffect, Suspense } from "react";
import { ChevronRight, FileText, Download, Printer, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCustomerLedgerAction } from "@/templates/egg-tasta/actions/customers";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";
import { Combobox } from "@/templates/egg-tasta/components/Combobox";
import { formatDate } from "@/shared/utils/date";

function LedgerContent({ initialCustomers }: { initialCustomers: any[] }) {
  const searchParams = useSearchParams();
  const customerCode = searchParams.get("customer");
  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");
  
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local state for the filter bar
  const [selectedCustomer, setSelectedCustomer] = useState(customerCode || "");
  const [fromDate, setFromDate] = useState(urlFrom || "");
  const [toDate, setToDate] = useState(urlTo || "");

  useEffect(() => {
    if (!customerCode) {
      setData(null);
      setError(null);
      return;
    }
    const fetchLedger = async () => {
      try {
        setLoading(true);
        // We pass urlFrom and urlTo to the action
        const res = await getCustomerLedgerAction(customerCode, urlFrom || undefined, urlTo || undefined);
        if (res.success) {
          setData(res.data);
          setError(null);
        } else {
          setError(res.error || "Failed to load ledger.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, [customerCode, urlFrom, urlTo]);

  const handleGo = () => {
    if (selectedCustomer) {
      const params = new URLSearchParams();
      params.set("customer", selectedCustomer);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      router.push(`/app/customers/ledger?${params.toString()}`);
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'OPENING': return <span className="text-slate-500 font-medium">Opening Balance</span>;
      case 'SALE': return <span className="text-blue-600 dark:text-blue-400 font-medium">Sale Invoice</span>;
      case 'PAYMENT_RECEIVED': return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Payment Received</span>;
      case 'COLLECTION': return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Customer Collection</span>;
      case 'RETURN': return <span className="text-orange-600 dark:text-orange-400 font-medium">Sales Return</span>;
      case 'ADJUSTMENT': return <span className="text-purple-600 dark:text-purple-400 font-medium">Due Adjustment</span>;
      default: return <span>{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
            <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <Link href="/app/customers/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customers</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Customer Ledger</span>
          </nav>
          
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Ledger</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View transaction history and running balance.</p>
        </div>
        {customerCode && data && !error && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="primary">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer</label>
            <Combobox 
              options={initialCustomers}
              value={selectedCustomer}
              onChange={setSelectedCustomer}
              placeholder="Search by name, mobile, or code..."
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To Date</label>
            <input 
              type="date" 
              className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto">
            <Button 
              variant="primary" 
              className="w-full md:w-auto flex items-center justify-center py-2 px-6" 
              disabled={!selectedCustomer}
              onClick={handleGo}
            >
              <Search className="h-4 w-4 mr-2" />
              View Ledger
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {!customerCode ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">No Customer Selected</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
            Please search and select a customer from the bar above, choose an optional date range, and click View Ledger.
          </p>
        </div>
      ) : loading ? (
        <div className="p-12 text-center text-slate-500">Loading ledger data...</div>
      ) : error || !data ? (
        <div className="p-12 text-center">
          <p className="text-red-500 mb-4">{error || "Customer not found."}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Opening Balance</div>
              <div className="text-xl font-bold text-slate-700 dark:text-slate-200">${data.openingBalance.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Sales</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">${data.totalSales.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Collections</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">${data.totalCollection.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sales Returns</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">${data.totalSalesReturn.toFixed(2)}</div>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 rounded-xl p-5 shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-300 uppercase tracking-wider mb-1">Current Balance</div>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">${data.currentDue.toFixed(2)}</div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-semibold text-slate-800 dark:text-slate-200">
                Ledger: {data.customer.name} ({data.customer.customerCode})
              </h2>
            </div>
            <div>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Voucher No</Th>
                    <Th>Transaction Type</Th>
                    <Th>Description</Th>
                    <Th className="text-right text-red-600 dark:text-red-400">Debit (+)</Th>
                    <Th className="text-right text-emerald-600 dark:text-emerald-400">Credit (-)</Th>
                    <Th className="text-right">Running Balance</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.ledger.length === 0 ? (
                    <Tr>
                      <Td colSpan={7}>
                        <EmptyState 
                          title="No transactions found" 
                          description="No transactions match the selected date range."
                          icon={FileText} 
                        />
                      </Td>
                    </Tr>
                  ) : (
                    data.ledger.map((entry: any, index: number) => (
                      <Tr key={entry.id || index} className={entry.type === 'OPENING' ? 'bg-slate-50 dark:bg-slate-800/50' : ''}>
                        <Td className="whitespace-nowrap">
                          {formatDate(entry.date)}
                          <div className="text-xs text-slate-400">{new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </Td>
                        <Td className="font-mono text-sm">{entry.referenceNo || '-'}</Td>
                        <Td>{getTransactionTypeLabel(entry.type)}</Td>
                        <Td>
                          <div className="max-w-[200px] sm:max-w-[300px] truncate" title={entry.description || "-"}>
                            {entry.description || "-"}
                          </div>
                        </Td>
                        <Td className="text-right font-medium text-red-600 dark:text-red-400">
                          {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : '-'}
                        </Td>
                        <Td className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : '-'}
                        </Td>
                        <Td className="text-right font-bold text-slate-700 dark:text-slate-200">
                          ${entry.runningBalance.toFixed(2)}
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function CustomerLedgerClient({ initialCustomers }: { initialCustomers: any[] }) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading ledger interface...</div>}>
      <LedgerContent initialCustomers={initialCustomers} />
    </Suspense>
  );
}
