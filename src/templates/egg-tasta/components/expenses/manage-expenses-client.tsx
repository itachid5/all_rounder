"use client";

import React, { useState, useTransition } from "react";
import { Search, Plus, Filter, Download, Eye, Edit2, Trash2, CheckSquare, XSquare, DollarSign, Calendar, AlertCircle, CheckCircle2, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge, Modal, TextField, SelectField, Textarea } from "@/templates/egg-tasta/components";
import { getExpensesAction, deleteExpenseAction, bulkDeleteExpensesAction, updateExpenseAction } from "@/templates/egg-tasta/actions/expenses";
import { formatDate } from "@/shared/utils/date";
import { useCurrency } from "@/shared/components/regional-context";
import { usePermission } from "@/shared/components/permission-context";

export function ManageExpensesClient({
  initialData,
  initialTotal,
  categories = [],
}: {
  initialData: any[];
  initialTotal: number;
  categories?: any[];
}) {
  const { symbol, formatMoney } = useCurrency();
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("create:expenses");
  const canEdit = hasPermission("edit:expenses");
  const canDelete = hasPermission("delete:expenses");

  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // View / Edit / Delete dialogs
  const [viewingExpense, setViewingExpense] = useState<any | null>(null);
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<any | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editPaymentMethod, setEditPaymentMethod] = useState("CASH");
  const [editReference, setEditReference] = useState("");
  const [editPaidTo, setEditPaidTo] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function fetchExpenses(
    newSearch = search,
    newCat = categoryId,
    newMethod = paymentMethod,
    newStart = startDate,
    newEnd = endDate,
    newMin = minAmount,
    newMax = maxAmount,
    newPage = page
  ) {
    startTransition(async () => {
      const res = await getExpensesAction({
        search: newSearch,
        categoryId: newCat || undefined,
        paymentMethod: newMethod || undefined,
        startDate: newStart || undefined,
        endDate: newEnd || undefined,
        minAmount: newMin ? parseFloat(newMin) : undefined,
        maxAmount: newMax ? parseFloat(newMax) : undefined,
        page: newPage,
        limit,
      });
      if (res.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    });
  }

  function handleSelectAll() {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map((item) => item.expense.id)));
    }
  }

  function handleSelectOne(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function handleOpenEdit(item: any) {
    const exp = item.expense;
    setEditingExpense(exp);
    setEditDate(exp.expenseDate ? exp.expenseDate.split("T")[0] : new Date().toISOString().split("T")[0]);
    setEditCategory(exp.categoryId || "");
    setEditAmount(exp.amount?.toString() || "");
    setEditPaymentMethod(exp.paymentMethod || "CASH");
    setEditReference(exp.referenceNo || "");
    setEditPaidTo(exp.paidTo || "");
    setEditNotes(exp.notes || "");
    setError(null);
  }

  function handleUpdateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingExpense) return;
    const parsedAmt = parseFloat(editAmount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    startTransition(async () => {
      const res = await updateExpenseAction(editingExpense.id, {
        expenseDate: editDate,
        categoryId: editCategory,
        amount: parsedAmt,
        paymentMethod: editPaymentMethod,
        referenceNo: editReference,
        paidTo: editPaidTo,
        notes: editNotes,
      });

      if (res.success) {
        setSuccess("Expense updated successfully.");
        setEditingExpense(null);
        fetchExpenses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || "Failed to update expense.");
      }
    });
  }

  function handleDeleteSingle() {
    if (!deletingExpense) return;
    startTransition(async () => {
      const res = await deleteExpenseAction(deletingExpense.id);
      if (res.success) {
        setSuccess("Expense deleted successfully.");
        setDeletingExpense(null);
        fetchExpenses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || "Failed to delete expense.");
      }
    });
  }

  function handleBulkDelete() {
    startTransition(async () => {
      const res = await bulkDeleteExpensesAction(Array.from(selectedIds));
      if (res.success) {
        setSuccess(`${selectedIds.size} expense(s) deleted successfully.`);
        setSelectedIds(new Set());
        setIsBulkDeleteOpen(false);
        fetchExpenses();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || "Failed to bulk delete expenses.");
      }
    });
  }

  function exportCSV() {
    const headers = ["Expense No", "Date", "Expense Head", "Amount", "Payment Method", "Reference", "Paid To", "Notes"];
    const rows = data.map((item) => [
      item.expense.expenseNo,
      formatDate(item.expense.expenseDate),
      item.categoryName || "-",
      item.expense.amount,
      item.expense.paymentMethod,
      item.expense.referenceNo || "-",
      item.expense.paidTo || "-",
      `"${(item.expense.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses_export_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search No, Note, Ref..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                  fetchExpenses(e.target.value, categoryId, paymentMethod, startDate, endDate, minAmount, maxAmount, 1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Expense Head Filter */}
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
                fetchExpenses(search, e.target.value, paymentMethod, startDate, endDate, minAmount, maxAmount, 1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Expense Heads</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Payment Method Filter */}
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
                fetchExpenses(search, categoryId, e.target.value, startDate, endDate, minAmount, maxAmount, 1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">All Payment Methods</option>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex gap-2 w-full lg:w-auto justify-end">
            <button
              onClick={exportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </button>

            {canCreate && (
              <Link href="/app/expenses/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Date & Amount Range Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-col">
            <label className="text-xs text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
                fetchExpenses(search, categoryId, paymentMethod, e.target.value, endDate, minAmount, maxAmount, 1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
                fetchExpenses(search, categoryId, paymentMethod, startDate, e.target.value, minAmount, maxAmount, 1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-400 mb-1">Min Amount ({symbol})</label>
            <input
              type="number"
              placeholder="0.00"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value);
                setPage(1);
                fetchExpenses(search, categoryId, paymentMethod, startDate, endDate, e.target.value, maxAmount, 1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-xs text-slate-400 mb-1">Max Amount ({symbol})</label>
            <input
              type="number"
              placeholder="0.00"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value);
                setPage(1);
                fetchExpenses(search, categoryId, paymentMethod, startDate, endDate, minAmount, e.target.value, 1);
              }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && canDelete && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-rose-700 dark:text-rose-300">
            {selectedIds.size} expense(s) selected
          </span>
          <button
            onClick={() => setIsBulkDeleteOpen(true)}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Selected
          </button>
        </div>
      )}

      {/* Expense Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <Thead>
            <Tr>
              {canDelete && (
                <Th className="w-10">
                  <input
                    type="checkbox"
                    checked={data.length > 0 && selectedIds.size === data.length}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600"
                  />
                </Th>
              )}
              <Th>Expense No</Th>
              <Th>Date</Th>
              <Th>Expense Head</Th>
              <Th className="text-right">Amount</Th>
              <Th>Payment Method</Th>
              <Th>Reference</Th>
              <Th>Paid To</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.length === 0 ? (
              <Tr>
                <Td colSpan={canDelete ? 9 : 8} className="py-12 text-center">
                  <EmptyState title="No Expenses Recorded" description="Record a business expense to track payments." icon={DollarSign} />
                </Td>
              </Tr>
            ) : (
              data.map((item) => {
                const exp = item.expense;
                const isSelected = selectedIds.has(exp.id);

                return (
                  <Tr key={exp.id} className={isSelected ? "bg-blue-50/50 dark:bg-blue-900/10" : ""}>
                    {canDelete && (
                      <Td>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(exp.id)}
                          className="rounded border-slate-300 text-blue-600"
                        />
                      </Td>
                    )}
                    <Td className="font-mono text-xs font-medium text-slate-500">{exp.expenseNo}</Td>
                    <Td className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(exp.expenseDate)}</Td>
                    <Td className="font-medium text-slate-900 dark:text-white">{item.categoryName || "-"}</Td>
                    <Td className="text-right font-bold text-slate-900 dark:text-white">{formatMoney(exp.amount)}</Td>
                    <Td className="text-slate-600 dark:text-slate-400">{exp.paymentMethod ? exp.paymentMethod.replace("_", " ") : "-"}</Td>
                    <Td className="text-slate-500 text-xs font-mono">{exp.referenceNo || "-"}</Td>
                    <Td className="text-slate-600 dark:text-slate-400">{exp.paidTo || "-"}</Td>
                    <Td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingExpense(item)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeletingExpense(exp)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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
        {total > limit && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} Expenses
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  fetchExpenses(search, categoryId, paymentMethod, startDate, endDate, minAmount, maxAmount, page - 1);
                }}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchExpenses(search, categoryId, paymentMethod, startDate, endDate, minAmount, maxAmount, page + 1);
                }}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Drawer / Modal */}
      {viewingExpense && (
        <Modal isOpen={!!viewingExpense} onClose={() => setViewingExpense(null)} title={`Expense Details: ${viewingExpense.expense.expenseNo}`}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs text-slate-400 mb-1">Expense Head</p>
                <p className="font-semibold text-slate-900 dark:text-white">{viewingExpense.categoryName || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Amount</p>
                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{formatMoney(viewingExpense.expense.amount)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Date</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{formatDate(viewingExpense.expense.expenseDate)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Payment Method</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{viewingExpense.expense.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Reference No</p>
                <p className="font-mono text-xs text-slate-700 dark:text-slate-300">{viewingExpense.expense.referenceNo || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Paid To / Payee</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{viewingExpense.expense.paidTo || "-"}</p>
              </div>
            </div>

            {viewingExpense.expense.notes && (
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400 mb-1">Notes</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewingExpense.expense.notes}</p>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={() => setViewingExpense(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title={`Edit Expense: ${editingExpense.expenseNo}`}>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1">Expense Date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                  required
                />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-medium text-slate-500 mb-1">Expense Head</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm"
                  required
                >
                  <option value="">Select Head</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <TextField label={`Amount (${symbol})`} type="number" step="0.01" value={editAmount} onChange={(e: any) => setEditAmount(e.target.value)} required />

              <SelectField
                label="Payment Method"
                value={editPaymentMethod}
                onChange={(e: any) => setEditPaymentMethod(e.target.value)}
                options={[
                  { label: "Cash", value: "CASH" },
                  { label: "Bank", value: "BANK" },
                  { label: "Mobile Banking", value: "MOBILE_BANKING" },
                  { label: "Other", value: "OTHER" },
                ]}
              />

              <TextField label="Reference Number" value={editReference} onChange={(e: any) => setEditReference(e.target.value)} />

              <TextField label="Paid To" value={editPaidTo} onChange={(e: any) => setEditPaidTo(e.target.value)} />
            </div>

            <Textarea label="Notes" value={editNotes} onChange={(e: any) => setEditNotes(e.target.value)} rows={3} />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingExpense(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Updating..." : "Update Expense"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Single Modal */}
      {deletingExpense && (
        <Modal isOpen={!!deletingExpense} onClose={() => setDeletingExpense(null)} title="Delete Expense Record">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete expense record <strong className="text-slate-900 dark:text-white">{deletingExpense.expenseNo}</strong> ({formatMoney(deletingExpense.amount)})?
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingExpense(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSingle}
                disabled={isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
              >
                {isPending ? "Deleting..." : "Delete Expense"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Modal */}
      {isBulkDeleteOpen && (
        <Modal isOpen={isBulkDeleteOpen} onClose={() => setIsBulkDeleteOpen(false)} title="Bulk Delete Expenses">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-rose-600 font-bold">{selectedIds.size}</strong> selected expense records? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium"
              >
                {isPending ? "Deleting Selected..." : "Confirm Bulk Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
