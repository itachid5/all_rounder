"use client";

import React, { useState, useTransition } from "react";
import {
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Plus,
  ArrowRightLeft,
  Calendar,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Scale,
  Calculator,
  RefreshCw,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState, Modal } from "@/templates/egg-tasta/components";
import { useCurrency } from "@/shared/components/regional-context";
import { usePermission } from "@/shared/components/permission-context";
import { formatDate } from "@/shared/utils/date";
import { getLedgerEntriesAction, createManualAdjustmentAction } from "@/templates/egg-tasta/actions/ledger";

export interface LedgerClientProps {
  initialData: any[];
  initialTotal: number;
  initialSummary: {
    openingBalance: number;
    totalDebit: number;
    totalCredit: number;
    currentBalance: number;
  };
  customersList?: { id: string; name: string; customerCode?: string }[];
  suppliersList?: { id: string; name: string; supplierCode?: string }[];
  defaultTransactionType?: string;
  defaultCustomerId?: string;
  defaultSupplierId?: string;
  title?: string;
  description?: string;
}

export function LedgerClientComponent({
  initialData,
  initialTotal,
  initialSummary,
  customersList = [],
  suppliersList = [],
  defaultTransactionType = "ALL",
  defaultCustomerId = "ALL",
  defaultSupplierId = "ALL",
  title = "General Ledger",
  description = "Complete production-ready financial transaction & balance ledger.",
}: LedgerClientProps) {
  const { formatCurrency, formatMoney } = useCurrency();
  const { hasAnyPermission, isOwner } = usePermission();

  const canView = isOwner || hasAnyPermission(["ledger.view", "view:ledger", "view:reports"]);
  const canExport = isOwner || hasAnyPermission(["ledger.export", "export:ledger"]);
  const canPrint = isOwner || hasAnyPermission(["ledger.print", "print:ledger"]);
  const canAdjust = isOwner || hasAnyPermission(["ledger.adjust", "adjust:ledger"]);

  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<any[]>(initialData);
  const [total, setTotal] = useState<number>(initialTotal);
  const [summary, setSummary] = useState(initialSummary);

  // Filters
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState(defaultTransactionType);
  const [customerId, setCustomerId] = useState(defaultCustomerId);
  const [supplierId, setSupplierId] = useState(defaultSupplierId);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pagination & Sorting
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [sortBy, setSortBy] = useState<"entryDate" | "voucherNo" | "debit" | "credit" | "runningBalance">("entryDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals
  const [viewingEntry, setViewingEntry] = useState<any | null>(null);
  const [printingEntry, setPrintingEntry] = useState<any | null>(null);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);

  // Adjustment Form State
  const [adjType, setAdjType] = useState<"ADJUSTMENT" | "OPENING_BALANCE" | "CASH_IN" | "CASH_OUT">("ADJUSTMENT");
  const [adjEntryType, setAdjEntryType] = useState<"DEBIT" | "CREDIT">("CREDIT");
  const [adjAmount, setAdjAmount] = useState("");
  const [adjCustomer, setAdjCustomer] = useState("");
  const [adjSupplier, setAdjSupplier] = useState("");
  const [adjDate, setAdjDate] = useState("");
  const [adjReferenceNo, setAdjReferenceNo] = useState("");
  const [adjDescription, setAdjDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const totalPages = Math.ceil(total / limit) || 1;

  function fetchLedger(
    newSearch = search,
    newTxType = transactionType,
    newCust = customerId,
    newSupp = supplierId,
    newStart = startDate,
    newEnd = endDate,
    newPage = page,
    newLimit = limit,
    newSortBy = sortBy,
    newSortOrder = sortOrder
  ) {
    startTransition(async () => {
      const res = await getLedgerEntriesAction({
        search: newSearch,
        transactionType: newTxType !== "ALL" ? newTxType : undefined,
        customerId: newCust !== "ALL" ? newCust : undefined,
        supplierId: newSupp !== "ALL" ? newSupp : undefined,
        startDate: newStart || undefined,
        endDate: newEnd || undefined,
        page: newPage,
        limit: newLimit,
        sortBy: newSortBy,
        sortOrder: newSortOrder,
      });

      if (res.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
        if (res.summary) setSummary(res.summary);
      }
    });
  }

  function handleResetFilters() {
    setSearch("");
    setTransactionType("ALL");
    setCustomerId("ALL");
    setSupplierId("ALL");
    setStartDate("");
    setEndDate("");
    setPage(1);
    fetchLedger("", "ALL", "ALL", "ALL", "", "", 1);
  }

  function handleSort(column: "entryDate" | "voucherNo" | "debit" | "credit" | "runningBalance") {
    const newOrder = sortBy === column && sortOrder === "desc" ? "asc" : "desc";
    setSortBy(column);
    setSortOrder(newOrder);
    fetchLedger(search, transactionType, customerId, supplierId, startDate, endDate, page, limit, column, newOrder);
  }

  async function handleCreateAdjustment(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const amt = parseFloat(adjAmount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Please enter a valid amount greater than 0.");
      return;
    }

    startTransition(async () => {
      const res = await createManualAdjustmentAction({
        transactionType: adjType,
        entryType: adjEntryType,
        amount: amt,
        customerId: adjCustomer || undefined,
        supplierId: adjSupplier || undefined,
        entryDate: adjDate || undefined,
        referenceNo: adjReferenceNo || undefined,
        description: adjDescription || undefined,
      });

      if (res.success) {
        setFormSuccess("Ledger entry posted successfully!");
        setTimeout(() => {
          setIsAdjustmentModalOpen(false);
          setAdjAmount("");
          setAdjDescription("");
          setAdjReferenceNo("");
          setFormSuccess(null);
          fetchLedger();
        }, 1000);
      } else {
        setFormError(res.error || "Failed to post adjustment.");
      }
    });
  }

  function exportCSV() {
    if (data.length === 0) return;

    const headers = ["Date", "Voucher No", "Transaction Type", "Reference No", "Description", "Customer/Supplier", "Debit", "Credit", "Running Balance", "Created By"];
    const rows = data.map((item) => [
      item.entryDate ? new Date(item.entryDate).toLocaleDateString() : "",
      item.voucherNo || "",
      item.transactionType || "",
      item.referenceNo || "",
      `"${(item.description || "").replace(/"/g, '""')}"`,
      `"${(item.customerName || item.supplierName || "").replace(/"/g, '""')}"`,
      item.debit || 0,
      item.credit || 0,
      item.runningBalance || 0,
      item.createdBy || "System",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ledger_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrint() {
    window.print();
  }

  function getBadgeColor(type: string) {
    switch (type) {
      case "SALES":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "PURCHASE":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "CUSTOMER_COLLECTION":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      case "SUPPLIER_PAYMENT":
        return "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      case "EXPENSE":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800";
      case "OPENING_BALANCE":
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "ADJUSTMENT":
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800";
      case "CASH_IN":
        return "bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border-teal-200 dark:border-teal-800";
      case "CASH_OUT":
        return "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  }

  function formatTxLabel(type: string) {
    return type.replace(/_/g, " ");
  }

  return (
    <div className="space-y-6">
      {/* Printable CSS override */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ledger-printable-section, #ledger-printable-section * {
            visibility: visible;
          }
          #ledger-printable-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header & Breadcrumbs */}
      <div className="no-print flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-1">
            <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span className="text-slate-900 dark:text-slate-100 font-medium">{title}</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            {title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canAdjust && (
            <button
              onClick={() => setIsAdjustmentModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              Manual Adjustment
            </button>
          )}

          {canExport && (
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Export CSV
            </button>
          )}

          {canPrint && (
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-colors"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              Print
            </button>
          )}
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Opening Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Opening Balance
            </span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            {formatCurrency(summary.openingBalance)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Starting period balance</p>
        </div>

        {/* Total Debit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Debit
            </span>
            <div className="h-9 w-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            {formatCurrency(summary.totalDebit)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total debited transactions</p>
        </div>

        {/* Total Credit */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Credit
            </span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(summary.totalCredit)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Total credited transactions</p>
        </div>

        {/* Current Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Balance
            </span>
            <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calculator className="h-5 w-5" />
            </div>
          </div>
          <div
            className={`text-2xl font-bold mt-2 ${
              summary.currentBalance >= 0
                ? "text-slate-900 dark:text-white"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(summary.currentBalance)}
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Ending period net balance</p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="no-print bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Filter Ledger Entries
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
          >
            <RefreshCw className="h-3 w-3" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search voucher, ref, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                fetchLedger(e.target.value, transactionType, customerId, supplierId, startDate, endDate, 1);
              }}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          </div>

          {/* Transaction Type */}
          <div>
            <select
              value={transactionType}
              onChange={(e) => {
                setTransactionType(e.target.value);
                setPage(1);
                fetchLedger(search, e.target.value, customerId, supplierId, startDate, endDate, 1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="PURCHASE">Purchase</option>
              <option value="PURCHASE_PAYMENT">Purchase Payment</option>
              <option value="PURCHASE_RETURN">Purchase Return</option>
              <option value="SALES">Sales</option>
              <option value="SALES_RETURN">Sales Return</option>
              <option value="CUSTOMER_COLLECTION">Customer Collection</option>
              <option value="EXPENSE">Expense</option>
              <option value="SUPPLIER_PAYMENT">Supplier Payment</option>
              <option value="OPENING_BALANCE">Opening Balance</option>
              <option value="ADJUSTMENT">Adjustment</option>
              <option value="CASH_IN">Cash In</option>
              <option value="CASH_OUT">Cash Out</option>
            </select>
          </div>

          {/* Customer */}
          <div>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setPage(1);
                fetchLedger(search, transactionType, e.target.value, supplierId, startDate, endDate, 1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            >
              <option value="ALL">All Customers</option>
              {customersList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div>
            <select
              value={supplierId}
              onChange={(e) => {
                setSupplierId(e.target.value);
                setPage(1);
                fetchLedger(search, transactionType, customerId, e.target.value, startDate, endDate, 1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            >
              <option value="ALL">All Suppliers</option>
              {suppliersList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
                fetchLedger(search, transactionType, customerId, supplierId, e.target.value, endDate, 1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Printable Section */}
      <div id="ledger-printable-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {isPending && (
          <div className="no-print bg-blue-50/50 dark:bg-blue-900/20 px-4 py-2 border-b border-blue-100 dark:border-blue-900/30 text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            Updating ledger records...
          </div>
        )}

        {data.length === 0 ? (
          <EmptyState
            title="No Ledger Entries Found"
            description="No transactions match your current query or filter parameters."
            icon={ArrowRightLeft}
          />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th onClick={() => handleSort("entryDate")} className="cursor-pointer select-none">
                  Date {sortBy === "entryDate" && (sortOrder === "asc" ? "↑" : "↓")}
                </Th>
                <Th onClick={() => handleSort("voucherNo")} className="cursor-pointer select-none">
                  Voucher No {sortBy === "voucherNo" && (sortOrder === "asc" ? "↑" : "↓")}
                </Th>
                <Th>Type</Th>
                <Th>Reference</Th>
                <Th>Description</Th>
                <Th onClick={() => handleSort("debit")} className="cursor-pointer select-none text-right">
                  Debit {sortBy === "debit" && (sortOrder === "asc" ? "↑" : "↓")}
                </Th>
                <Th onClick={() => handleSort("credit")} className="cursor-pointer select-none text-right">
                  Credit {sortBy === "credit" && (sortOrder === "asc" ? "↑" : "↓")}
                </Th>
                <Th onClick={() => handleSort("runningBalance")} className="cursor-pointer select-none text-right">
                  Running Balance {sortBy === "runningBalance" && (sortOrder === "asc" ? "↑" : "↓")}
                </Th>
                <Th>Created By</Th>
                <Th className="no-print text-center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((row) => {
                const formattedDate = row.entryDate ? new Date(row.entryDate).toLocaleDateString() : "-";

                return (
                  <Tr key={row.id}>
                    <Td className="font-medium text-slate-900 dark:text-slate-100">{formattedDate}</Td>
                    <Td className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {row.voucherNo}
                    </Td>
                    <Td>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeColor(
                          row.transactionType
                        )}`}
                      >
                        {formatTxLabel(row.transactionType)}
                      </span>
                    </Td>
                    <Td className="text-xs text-slate-500 font-mono">
                      {row.referenceNo || "-"}
                    </Td>
                    <Td className="max-w-xs truncate" title={row.description || ""}>
                      {row.description || "-"}
                      {(row.customerName || row.supplierName) && (
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {row.customerName ? `Cust: ${row.customerName}` : `Supp: ${row.supplierName}`}
                        </div>
                      )}
                    </Td>
                    <Td className="text-right font-medium text-rose-600 dark:text-rose-400">
                      {row.debit > 0 ? formatCurrency(row.debit) : "-"}
                    </Td>
                    <Td className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {row.credit > 0 ? formatCurrency(row.credit) : "-"}
                    </Td>
                    <Td
                      className={`text-right font-bold ${
                        row.runningBalance >= 0
                          ? "text-slate-900 dark:text-white"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatCurrency(row.runningBalance)}
                    </Td>
                    <Td className="text-xs text-slate-500 dark:text-slate-400">{row.createdBy || "System"}</Td>
                    <Td className="no-print text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setViewingEntry(row)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Detail"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canPrint && (
                          <button
                            onClick={() => setPrintingEntry(row)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Print Voucher"
                          >
                            <Printer className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}

        {/* Table Footer / Pagination */}
        <div className="no-print px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-900 dark:text-white">{data.length}</span> of{" "}
            <span className="font-semibold text-slate-900 dark:text-white">{total}</span> total entries
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  const l = parseInt(e.target.value);
                  setLimit(l);
                  setPage(1);
                  fetchLedger(search, transactionType, customerId, supplierId, startDate, endDate, 1, l);
                }}
                className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white outline-none"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => {
                  const p = page - 1;
                  setPage(p);
                  fetchLedger(search, transactionType, customerId, supplierId, startDate, endDate, p);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => {
                  const p = page + 1;
                  setPage(p);
                  fetchLedger(search, transactionType, customerId, supplierId, startDate, endDate, p);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW ENTRY DETAIL MODAL */}
      {viewingEntry && (
        <Modal
          isOpen={Boolean(viewingEntry)}
          onClose={() => setViewingEntry(null)}
          title={`Voucher Detail: ${viewingEntry.voucherNo}`}
        >
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Voucher No</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-base">
                  {viewingEntry.voucherNo}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Entry Date</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {viewingEntry.entryDate ? new Date(viewingEntry.entryDate).toLocaleString() : "-"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Transaction Type</span>
                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border mt-0.5 ${getBadgeColor(viewingEntry.transactionType)}`}>
                  {formatTxLabel(viewingEntry.transactionType)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Reference No</span>
                <span className="font-mono text-slate-900 dark:text-white font-medium">
                  {viewingEntry.referenceNo || "-"}
                </span>
              </div>
            </div>

            {(viewingEntry.customerName || viewingEntry.supplierName) && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                <span className="text-xs text-slate-400 block">Related Account</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {viewingEntry.customerName ? `Customer: ${viewingEntry.customerName}` : `Supplier: ${viewingEntry.supplierName}`}
                </span>
              </div>
            )}

            <div>
              <span className="text-xs text-slate-400 block">Description</span>
              <p className="text-slate-800 dark:text-slate-200 mt-1 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                {viewingEntry.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 bg-slate-900 text-white rounded-xl">
              <div>
                <span className="text-xs text-slate-400 block">Debit</span>
                <span className="font-bold text-rose-400 text-base">
                  {formatCurrency(viewingEntry.debit)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Credit</span>
                <span className="font-bold text-emerald-400 text-base">
                  {formatCurrency(viewingEntry.credit)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Running Balance</span>
                <span className="font-bold text-white text-base">
                  {formatCurrency(viewingEntry.runningBalance)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Created By: <strong>{viewingEntry.createdBy || "System"}</strong></span>
              {canPrint && (
                <button
                  onClick={() => {
                    setPrintingEntry(viewingEntry);
                    setTimeout(() => window.print(), 300);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print Voucher
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* PRINTABLE VOUCHER MODAL */}
      {printingEntry && (
        <Modal
          isOpen={Boolean(printingEntry)}
          onClose={() => setPrintingEntry(null)}
          title={`Print Voucher: ${printingEntry.voucherNo}`}
        >
          <div id="voucher-print-area" className="p-6 space-y-6 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold">FINANCIAL VOUCHER</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Voucher #: {printingEntry.voucherNo}</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Date</span>
                <span className="text-sm font-semibold">{printingEntry.entryDate ? new Date(printingEntry.entryDate).toLocaleDateString() : ""}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Transaction Type:</span>
                <span className="font-semibold">{formatTxLabel(printingEntry.transactionType)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Reference No:</span>
                <span className="font-mono">{printingEntry.referenceNo || "-"}</span>
              </div>
              {(printingEntry.customerName || printingEntry.supplierName) && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Party Name:</span>
                  <span className="font-semibold">{printingEntry.customerName || printingEntry.supplierName}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Description:</span>
                <span>{printingEntry.description || "-"}</span>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-sm">
                <span>Debit Amount:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrency(printingEntry.debit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Credit Amount:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(printingEntry.credit)}</span>
              </div>
              <div className="flex justify-between text-base border-t border-slate-200 dark:border-slate-700 pt-2 font-bold">
                <span>Balance After Transaction:</span>
                <span>{formatCurrency(printingEntry.runningBalance)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-4">
              <span>Prepared By: {printingEntry.createdBy || "System"}</span>
              <span>Authorized Signature: _______________________</span>
            </div>

            <div className="no-print pt-4 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                Print Voucher Now
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MANUAL ADJUSTMENT MODAL */}
      {isAdjustmentModalOpen && (
        <Modal
          isOpen={isAdjustmentModalOpen}
          onClose={() => setIsAdjustmentModalOpen(false)}
          title="Add Manual Ledger Adjustment"
        >
          <form onSubmit={handleCreateAdjustment} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {formSuccess}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Type
                </label>
                <select
                  value={adjType}
                  onChange={(e: any) => setAdjType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="OPENING_BALANCE">Opening Balance</option>
                  <option value="CASH_IN">Cash In</option>
                  <option value="CASH_OUT">Cash Out</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Entry Direction
                </label>
                <select
                  value={adjEntryType}
                  onChange={(e: any) => setAdjEntryType(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="CREDIT">Credit (Income / Deposit / Receipt)</option>
                  <option value="DEBIT">Debit (Expense / Withdrawal / Charge)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={adjAmount}
                onChange={(e) => setAdjAmount(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer (Optional)
                </label>
                <select
                  value={adjCustomer}
                  onChange={(e) => setAdjCustomer(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="">None</option>
                  {customersList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier (Optional)
                </label>
                <select
                  value={adjSupplier}
                  onChange={(e) => setAdjSupplier(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                >
                  <option value="">None</option>
                  {suppliersList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Entry Date
                </label>
                <input
                  type="date"
                  value={adjDate}
                  onChange={(e) => setAdjDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reference No (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ADJ-001"
                  value={adjReferenceNo}
                  onChange={(e) => setAdjReferenceNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description / Reason *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Reason for manual adjustment..."
                value={adjDescription}
                onChange={(e) => setAdjDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Post Ledger Entry
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
