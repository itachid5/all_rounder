"use client";

import React, { useState, useTransition } from "react";
import {
  WalletCards,
  Calendar,
  Search,
  Printer,
  FileSpreadsheet,
  FileDown,
  ChevronRight,
  RefreshCw,
  Building2,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  ShoppingCart,
  Receipt,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale
} from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";
import { useCurrency } from "@/shared/components/regional-context";
import { usePermission } from "@/shared/components/permission-context";
import { getCashbookDataAction } from "@/templates/egg-tasta/actions/cashbook";

export interface CashbookClientProps {
  initialData: any;
  headerData?: {
    businessName: string;
    logoUrl?: string | null;
    address: string;
    phone: string;
    printedBy: string;
    generatedAt: string;
  };
}

export function CashbookClientComponent({
  initialData,
  headerData = {
    businessName: "Egg Tasta ERP",
    logoUrl: null,
    address: "Main Outlet Road, Dhaka, Bangladesh",
    phone: "+880 1700-000000",
    printedBy: "Business Admin",
    generatedAt: new Date().toLocaleString(),
  },
}: CashbookClientProps) {
  const { formatCurrency } = useCurrency();
  const { hasAnyPermission, isOwner } = usePermission();

  const canView = isOwner || hasAnyPermission(["cashbook.view", "view:cashbook", "view:reports"]);
  const canExport = isOwner || hasAnyPermission(["cashbook.export", "export:cashbook"]);
  const canPrint = isOwner || hasAnyPermission(["cashbook.print", "print:cashbook"]);

  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<any>(initialData);

  // Filters
  const [preset, setPreset] = useState<"TODAY" | "YESTERDAY" | "CUSTOM" | "RANGE">(initialData.preset || "TODAY");
  const [startDate, setStartDate] = useState(initialData.startDate || "");
  const [endDate, setEndDate] = useState(initialData.endDate || "");

  function fetchCashbook(
    newPreset = preset,
    newStart = startDate,
    newEnd = endDate
  ) {
    startTransition(async () => {
      const res = await getCashbookDataAction({
        preset: newPreset,
        startDate: newStart,
        endDate: newEnd,
      });

      if (res.success && res.data) {
        setData(res.data);
      }
    });
  }

  function handlePresetChange(p: "TODAY" | "YESTERDAY" | "CUSTOM" | "RANGE") {
    setPreset(p);
    if (p === "TODAY" || p === "YESTERDAY") {
      fetchCashbook(p);
    }
  }

  function handlePrint() {
    window.print();
  }

  function exportCSV() {
    const summary = data.summary || {};
    const lines: string[] = [];

    lines.push(`DAILY CASHBOOK REPORT - ${data.formattedDateRange}`);
    lines.push(`Business Name: ${headerData.businessName}`);
    lines.push(`Generated: ${new Date().toLocaleString()}`);
    lines.push("");

    // Summary Section
    lines.push("SUMMARY");
    lines.push(`Opening Cash,${summary.openingCash || 0}`);
    lines.push(`Cash Sales,${summary.cashSales || 0}`);
    lines.push(`Credit Sales,${summary.creditSales || 0}`);
    lines.push(`Customer Collection,${summary.customerCollection || 0}`);
    lines.push(`Purchases,${summary.totalPurchases || 0}`);
    lines.push(`Expenses,${summary.totalExpenses || 0}`);
    lines.push(`Closing Cash in Hand,${summary.closingCash || 0}`);
    lines.push("");

    // Sales Table
    lines.push("TODAY'S SALES");
    lines.push("Invoice No,Time,Customer,Product Count,Total Quantity,Total Amount,Paid,Due,Payment Method");
    (data.sales || []).forEach((s: any) => {
      lines.push(`${s.invoiceNo},${s.time},"${(s.customer || "").replace(/"/g, '""')}",${s.productCount},${s.totalQuantity},${s.totalAmount},${s.paid},${s.due},${s.paymentMethod}`);
    });
    lines.push("");

    // Customer Collection Table
    lines.push("TODAY'S CUSTOMER COLLECTION");
    lines.push("Receipt No,Time,Customer,Collected Amount,Payment Method,Collected By");
    (data.collections || []).forEach((c: any) => {
      lines.push(`${c.receiptNo},${c.time},"${(c.customer || "").replace(/"/g, '""')}",${c.collectedAmount},${c.paymentMethod},${c.collectedBy}`);
    });
    lines.push("");

    // Purchases Table
    lines.push("TODAY'S PURCHASES");
    lines.push("Purchase No,Time,Supplier,Product Count,Total Amount,Paid,Due,Payment Method");
    (data.purchases || []).forEach((p: any) => {
      lines.push(`${p.purchaseNo},${p.time},"${(p.supplier || "").replace(/"/g, '""')}",${p.productCount},${p.totalAmount},${p.paid},${p.due},${p.paymentMethod}`);
    });
    lines.push("");

    // Expenses Table
    lines.push("TODAY'S EXPENSES");
    lines.push("Time,Expense Head,Description,Amount,Payment Method,Created By");
    (data.expenses || []).forEach((e: any) => {
      lines.push(`${e.time},"${(e.expenseHead || "").replace(/"/g, '""')}","${(e.description || "").replace(/"/g, '""')}",${e.amount},${e.paymentMethod},${e.createdBy}`);
    });

    const csvContent = "data:text/csv;charset=utf-8," + lines.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Cashbook_${data.startDate || "report"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const summary = data.summary || {
    openingCash: 0,
    cashSales: 0,
    creditSales: 0,
    customerCollection: 0,
    totalPurchases: 0,
    cashPurchases: 0,
    duePurchases: 0,
    totalExpenses: 0,
    otherCashIn: 0,
    otherCashOut: 0,
    closingCash: 0,
  };

  const salesList = data.sales || [];
  const collectionsList = data.collections || [];
  const purchasesList = data.purchases || [];
  const expensesList = data.expenses || [];

  return (
    <div className="space-y-6">
      {/* Print CSS Rules */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 9.5pt !important;
            -webkit-print-color-adjust: exact;
          }
          .no-print, nav, aside, button, select, input, .no-print * {
            display: none !important;
          }
          #cashbook-printable-section {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 10px !important;
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
            padding: 5px 6px !important;
            font-weight: bold !important;
            font-size: 8.5pt !important;
          }
          td {
            border: 1px solid #cbd5e1 !important;
            padding: 5px 6px !important;
            font-size: 8.5pt !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Header & Breadcrumbs (Screen) */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">Cashbook</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <WalletCards className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            Daily Cashbook
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Complete daily cash activity, sales, collections, purchases, expenses, and cash reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canExport && (
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Export CSV / Excel
            </button>
          )}

          {canPrint && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print Cashbook
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar (Screen) */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePresetChange("TODAY")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              preset === "TODAY"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handlePresetChange("YESTERDAY")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              preset === "YESTERDAY"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => handlePresetChange("CUSTOM")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              preset === "CUSTOM"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Custom Date
          </button>
          <button
            onClick={() => handlePresetChange("RANGE")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              preset === "RANGE"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            Date Range
          </button>
        </div>

        {/* Date Inputs */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {preset === "CUSTOM" && (
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                fetchCashbook("CUSTOM", e.target.value, endDate);
              }}
              className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          )}

          {preset === "RANGE" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  fetchCashbook("RANGE", e.target.value, endDate);
                }}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  fetchCashbook("RANGE", startDate, e.target.value);
                }}
                className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>
          )}

          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
            {data.formattedDateRange}
          </div>
        </div>
      </div>

      {isPending && (
        <div className="no-print bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2 border border-blue-100 dark:border-blue-900/30 rounded-xl text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          Updating cashbook activity...
        </div>
      )}

      {/* TOP SUMMARY CARDS (7 CARDS REQUIRED BY PROMPT) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Opening Cash */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Opening Cash
          </div>
          <div className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">
            {formatCurrency(summary.openingCash)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Cash balance at start of day</p>
        </div>

        {/* 2. Today's Cash Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Cash Sales
          </div>
          <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {formatCurrency(summary.cashSales)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Cash received from sales</p>
        </div>

        {/* 3. Today's Credit Sales */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Credit Sales
          </div>
          <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {formatCurrency(summary.creditSales)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Unpaid customer due sales</p>
        </div>

        {/* 4. Today's Customer Collection */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Customer Collection
          </div>
          <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">
            {formatCurrency(summary.customerCollection)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Collections from previous dues</p>
        </div>

        {/* 5. Today's Purchases */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Purchases
          </div>
          <div className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">
            {formatCurrency(summary.totalPurchases)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Cash paid: {formatCurrency(summary.cashPurchases)}</p>
        </div>

        {/* 6. Today's Expenses */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Today's Expenses
          </div>
          <div className="text-2xl font-bold mt-1 text-rose-600 dark:text-rose-400">
            {formatCurrency(summary.totalExpenses)}
          </div>
          <p className="text-xs text-slate-400 mt-1">Operating business costs</p>
        </div>

        {/* 7. Closing Cash in Hand */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Closing Cash in Hand
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Reconciled
            </span>
          </div>
          <div className="text-3xl font-extrabold mt-2 text-white">
            {formatCurrency(summary.closingCash)}
          </div>
          <div className="text-xs text-slate-300 mt-1 font-mono">
            Formula: Opening ({formatCurrency(summary.openingCash)}) + Cash Sales ({formatCurrency(summary.cashSales)}) + Collection ({formatCurrency(summary.customerCollection)}) - Cash Purchases ({formatCurrency(summary.cashPurchases)}) - Expenses ({formatCurrency(summary.totalExpenses)})
          </div>
        </div>
      </div>

      {/* PRINTABLE CASHBOOK SECTION */}
      <div id="cashbook-printable-section" className="space-y-6">
        {/* PRINT HEADER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start gap-4">
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
              Daily Cashbook Report
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Report Date: <strong>{data.formattedDateRange}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Printed Time: <strong>{headerData.generatedAt}</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Printed By: <strong>{headerData.printedBy}</strong>
            </p>
          </div>
        </div>

        {/* SECTION 1: TODAY'S SALES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Today's Sales
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Invoices: {salesList.length}
            </span>
          </div>

          {salesList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No sales recorded for this date.</div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Invoice No</Th>
                  <Th>Time</Th>
                  <Th>Customer</Th>
                  <Th className="text-center">Product Count</Th>
                  <Th className="text-center">Total Quantity</Th>
                  <Th className="text-right">Total Amount</Th>
                  <Th className="text-right">Paid</Th>
                  <Th className="text-right">Due</Th>
                  <Th>Payment Method</Th>
                  <Th className="no-print text-center">View</Th>
                </Tr>
              </Thead>
              <Tbody>
                {salesList.map((s: any) => (
                  <Tr key={s.id}>
                    <Td className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {s.invoiceNo}
                    </Td>
                    <Td className="text-xs text-slate-500">{s.time}</Td>
                    <Td className="font-medium text-slate-900 dark:text-slate-100">{s.customer}</Td>
                    <Td className="text-center text-slate-600 dark:text-slate-400">{s.productCount}</Td>
                    <Td className="text-center text-slate-600 dark:text-slate-400">{s.totalQuantity}</Td>
                    <Td className="text-right font-medium">{formatCurrency(s.totalAmount)}</Td>
                    <Td className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(s.paid)}
                    </Td>
                    <Td className={`text-right font-medium ${s.due > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-400"}`}>
                      {formatCurrency(s.due)}
                    </Td>
                    <Td className="text-xs font-semibold">{s.paymentMethod}</Td>
                    <Td className="no-print text-center">
                      <Link
                        href={`/app/sales/manage`}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 inline-block"
                        title="View Sale"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* Sales Summary Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4 text-sm font-semibold">
            <div className="text-slate-600 dark:text-slate-400">
              Total Cash Sales: <span className="text-emerald-600 dark:text-emerald-400 font-bold ml-1">{formatCurrency(summary.cashSales)}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Total Credit Sales: <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">{formatCurrency(summary.creditSales)}</span>
            </div>
            <div className="text-slate-900 dark:text-white text-base font-bold">
              Total Sales: <span className="text-blue-600 dark:text-blue-400 ml-1">{formatCurrency(summary.totalSales)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: TODAY'S CUSTOMER COLLECTION */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Today's Customer Collection
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Collections: {collectionsList.length}
            </span>
          </div>

          {collectionsList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No customer collections recorded for this date.</div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Receipt No</Th>
                  <Th>Time</Th>
                  <Th>Customer</Th>
                  <Th className="text-right">Collected Amount</Th>
                  <Th>Payment Method</Th>
                  <Th>Collected By</Th>
                </Tr>
              </Thead>
              <Tbody>
                {collectionsList.map((c: any) => (
                  <Tr key={c.id}>
                    <Td className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {c.receiptNo}
                    </Td>
                    <Td className="text-xs text-slate-500">{c.time}</Td>
                    <Td className="font-medium text-slate-900 dark:text-slate-100">{c.customer}</Td>
                    <Td className="text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(c.collectedAmount)}
                    </Td>
                    <Td className="text-xs font-semibold">{c.paymentMethod}</Td>
                    <Td className="text-xs text-slate-600 dark:text-slate-400">{c.collectedBy}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* Collection Summary Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-sm font-semibold">
            <div className="text-slate-600 dark:text-slate-400">Total Customer Collection Summary</div>
            <div className="text-slate-900 dark:text-white text-base font-bold">
              Total Collection: <span className="text-emerald-600 dark:text-emerald-400 ml-1">{formatCurrency(summary.customerCollection)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: TODAY'S PURCHASES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Today's Purchases
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Orders: {purchasesList.length}
            </span>
          </div>

          {purchasesList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No purchases recorded for this date.</div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Purchase No</Th>
                  <Th>Time</Th>
                  <Th>Supplier</Th>
                  <Th className="text-center">Product Count</Th>
                  <Th className="text-right">Total Amount</Th>
                  <Th className="text-right">Paid</Th>
                  <Th className="text-right">Due</Th>
                  <Th>Payment Method</Th>
                </Tr>
              </Thead>
              <Tbody>
                {purchasesList.map((p: any) => (
                  <Tr key={p.id}>
                    <Td className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400">
                      {p.purchaseNo}
                    </Td>
                    <Td className="text-xs text-slate-500">{p.time}</Td>
                    <Td className="font-medium text-slate-900 dark:text-slate-100">{p.supplier}</Td>
                    <Td className="text-center text-slate-600 dark:text-slate-400">{p.productCount}</Td>
                    <Td className="text-right font-medium">{formatCurrency(p.totalAmount)}</Td>
                    <Td className="text-right font-medium text-purple-600 dark:text-purple-400">
                      {formatCurrency(p.paid)}
                    </Td>
                    <Td className={`text-right font-medium ${p.due > 0 ? "text-rose-600 dark:text-rose-400 font-bold" : "text-slate-400"}`}>
                      {formatCurrency(p.due)}
                    </Td>
                    <Td className="text-xs font-semibold">{p.paymentMethod}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* Purchase Summary Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4 text-sm font-semibold">
            <div className="text-slate-600 dark:text-slate-400">
              Total Cash Purchase: <span className="text-purple-600 dark:text-purple-400 font-bold ml-1">{formatCurrency(summary.cashPurchases)}</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Total Due Purchase: <span className="text-rose-600 dark:text-rose-400 font-bold ml-1">{formatCurrency(summary.duePurchases)}</span>
            </div>
            <div className="text-slate-900 dark:text-white text-base font-bold">
              Total Purchase: <span className="text-slate-900 dark:text-white ml-1">{formatCurrency(summary.totalPurchases)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: TODAY'S EXPENSES */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              Today's Expenses
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Total Expense Vouchers: {expensesList.length}
            </span>
          </div>

          {expensesList.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No expenses recorded for this date.</div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Time</Th>
                  <Th>Expense Head</Th>
                  <Th>Description</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Payment Method</Th>
                  <Th>Created By</Th>
                </Tr>
              </Thead>
              <Tbody>
                {expensesList.map((e: any) => (
                  <Tr key={e.id}>
                    <Td className="text-xs text-slate-500">{e.time}</Td>
                    <Td className="font-semibold text-slate-900 dark:text-slate-100">{e.expenseHead}</Td>
                    <Td className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{e.description}</Td>
                    <Td className="text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(e.amount)}
                    </Td>
                    <Td className="text-xs font-semibold">{e.paymentMethod}</Td>
                    <Td className="text-xs text-slate-600 dark:text-slate-400">{e.createdBy}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}

          {/* Expense Summary Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-sm font-semibold">
            <div className="text-slate-600 dark:text-slate-400">Total Business Expense Summary</div>
            <div className="text-slate-900 dark:text-white text-base font-bold">
              Total Expense: <span className="text-rose-600 dark:text-rose-400 ml-1">{formatCurrency(summary.totalExpenses)}</span>
            </div>
          </div>
        </div>

        {/* SECTION 5: CASH IN HAND RECONCILIATION BREAKDOWN */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Scale className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Cash In Hand Position
          </h3>

          <div className="max-w-xl space-y-3 text-sm">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span>Opening Cash :</span>
              <span className="font-semibold">{formatCurrency(summary.openingCash)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>+ Cash Sales :</span>
              <span className="font-semibold">{formatCurrency(summary.cashSales)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>+ Customer Collection :</span>
              <span className="font-semibold">{formatCurrency(summary.customerCollection)}</span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
              <span>+ Other Cash In :</span>
              <span className="font-semibold">{formatCurrency(summary.otherCashIn)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>- Cash Purchase :</span>
              <span className="font-semibold">{formatCurrency(summary.cashPurchases)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>- Expenses :</span>
              <span className="font-semibold">{formatCurrency(summary.totalExpenses)}</span>
            </div>
            <div className="flex justify-between text-rose-600 dark:text-rose-400">
              <span>- Other Cash Out :</span>
              <span className="font-semibold">{formatCurrency(summary.otherCashOut)}</span>
            </div>
            <div className="border-t-2 border-slate-300 dark:border-slate-700 pt-3 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
              <span>Closing Cash in Hand :</span>
              <span className="text-xl text-blue-600 dark:text-blue-400">{formatCurrency(summary.closingCash)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
