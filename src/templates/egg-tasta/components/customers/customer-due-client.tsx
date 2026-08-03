"use client";

import React, { useState, useTransition } from "react";
import { Search, FileDown, Printer, Clock, RefreshCw, Building2 } from "lucide-react";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";
import { useCurrency } from "@/shared/components/regional-context";
import { getCustomerDueListAction } from "@/templates/egg-tasta/actions/customers";

export interface CustomerDueClientProps {
  initialData: any[];
  initialSummary: {
    totalCustomers: number;
    totalSales: number;
    totalCollection: number;
    totalOutstandingDue: number;
  };
  headerData?: {
    businessName: string;
    logoUrl?: string | null;
    address: string;
    phone: string;
    printedBy: string;
    generatedAt: string;
  };
}

export function CustomerDueClient({
  initialData,
  initialSummary,
  headerData = {
    businessName: "Egg Tasta ERP",
    logoUrl: null,
    address: "Main Outlet Road, Dhaka, Bangladesh",
    phone: "+880 1700-000000",
    printedBy: "Business Admin",
    generatedAt: new Date().toLocaleString(),
  },
}: CustomerDueClientProps) {
  const { formatCurrency } = useCurrency();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<any[]>(initialData);
  const [summary, setSummary] = useState(initialSummary);
  const [search, setSearch] = useState("");
  const [dueFilter, setDueFilter] = useState("ALL");

  function fetchDues(newSearch = search, newFilter = dueFilter) {
    startTransition(async () => {
      const res = await getCustomerDueListAction({
        search: newSearch,
        filter: newFilter,
      });

      if (res.success) {
        setData(res.data || []);
        if (res.summary) setSummary(res.summary);
      }
    });
  }

  function handlePrint() {
    window.print();
  }

  function exportCSV() {
    if (data.length === 0) return;

    const headers = ["Customer Code", "Customer Name", "Phone", "Total Sales", "Total Collection", "Current Due", "Last Transaction Date"];
    const rows = data.map((item) => [
      item.customerCode || "",
      `"${(item.name || "").replace(/"/g, '""')}"`,
      `"${(item.phone || "").replace(/"/g, '""')}"`,
      item.totalSales || 0,
      item.totalCollection || 0,
      item.currentDue || 0,
      item.lastTransactionDate ? new Date(item.lastTransactionDate).toLocaleDateString() : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Customer_Due_List_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print, nav, aside, button, select, input, .no-print * {
            display: none !important;
          }
          #due-list-print-section {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 15px !important;
          }
          thead {
            display: table-header-group !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th {
            background-color: #f1f5f9 !important;
            color: #0f172a !important;
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
            font-weight: bold !important;
            font-size: 9pt !important;
          }
          td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 8px !important;
            font-size: 9pt !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Top Cards (Screen) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Customers
          </div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {summary.totalCustomers}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Sales
          </div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {formatCurrency(summary.totalSales)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Collection
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.totalCollection)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Outstanding Due
          </div>
          <div className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
            {formatCurrency(summary.totalOutstandingDue)}
          </div>
        </div>
      </div>

      {/* Top Bar Actions & Filters */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code, name, phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchDues(e.target.value, dueFilter);
              }}
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={dueFilter}
            onChange={(e) => {
              setDueFilter(e.target.value);
              fetchDues(search, e.target.value);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto text-slate-900 dark:text-white"
          >
            <option value="ALL">All Customers</option>
            <option value="DUE_ONLY">Outstanding Dues Only</option>
            <option value="ZERO">Zero / Clear Balance</option>
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={exportCSV}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <FileDown className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Report Section */}
      <div id="due-list-print-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {/* PRINT HEADER (Always visible on print) */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex items-center gap-4">
            {headerData.logoUrl ? (
              <img src={headerData.logoUrl} alt="Business Logo" className="h-12 max-w-[150px] object-contain shrink-0" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {headerData.businessName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{headerData.address}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Phone: {headerData.phone}</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Customer Due List
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Generated: <strong>{headerData.generatedAt}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Printed By: <strong>{headerData.printedBy}</strong>
            </p>
          </div>
        </div>

        {isPending && (
          <div className="no-print bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2 text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Updating due list...
          </div>
        )}

        {/* Table */}
        {data.length === 0 ? (
          <EmptyState
            title="No Customers Found"
            description="No customer records match your filter parameters."
            icon={Clock}
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Customer Code</Th>
                <Th>Customer Name</Th>
                <Th>Phone</Th>
                <Th className="text-right">Total Sales</Th>
                <Th className="text-right">Total Collection</Th>
                <Th className="text-right">Current Due</Th>
                <Th className="text-right">Last Transaction Date</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                    {c.customerCode}
                  </Td>
                  <Td className="font-medium text-slate-900 dark:text-slate-100">{c.name}</Td>
                  <Td className="text-slate-600 dark:text-slate-400">{c.phone}</Td>
                  <Td className="text-right font-medium">{formatCurrency(c.totalSales)}</Td>
                  <Td className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(c.totalCollection)}
                  </Td>
                  <Td className={`text-right font-bold ${c.currentDue > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"}`}>
                    {formatCurrency(c.currentDue)}
                  </Td>
                  <Td className="text-right text-xs text-slate-500">
                    {c.lastTransactionDate ? new Date(c.lastTransactionDate).toLocaleDateString() : "-"}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}

        {/* PRINT & SCREEN SUMMARY SECTION */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="max-w-md ml-auto p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Customers :</span>
              <span className="font-bold text-slate-900 dark:text-white">{summary.totalCustomers}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Sales :</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(summary.totalSales)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Collection :</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(summary.totalCollection)}</span>
            </div>
            <div className="flex justify-between text-base border-t border-slate-200 dark:border-slate-800 pt-2 font-bold text-rose-600 dark:text-rose-400">
              <span>Total Outstanding Due :</span>
              <span>{formatCurrency(summary.totalOutstandingDue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
