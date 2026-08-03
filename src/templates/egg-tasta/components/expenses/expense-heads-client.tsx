"use client";

import React, { useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, Tag, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge, Modal, TextField, SelectField, Textarea } from "@/templates/egg-tasta/components";
import { createExpenseHeadAction, updateExpenseHeadAction, deleteExpenseHeadAction, getExpenseHeadsAction } from "@/templates/egg-tasta/actions/expenses";
import { formatDate } from "@/shared/utils/date";
import { usePermission } from "@/shared/components/permission-context";

export function ExpenseHeadsClient({ initialData, initialTotal }: { initialData: any[]; initialTotal: number }) {
  const { hasPermission } = usePermission();
  const canCreate = hasPermission("create:expenses");
  const canEdit = hasPermission("edit:expenses");
  const canDelete = hasPermission("delete:expenses");

  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Form & Dialog state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHead, setEditingHead] = useState<any | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE">("ACTIVE");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [deletingHead, setDeletingHead] = useState<any | null>(null);

  function fetchHeads(newSearch = search, newStatus = statusFilter, newPage = page) {
    startTransition(async () => {
      const res = await getExpenseHeadsAction({
        search: newSearch,
        status: newStatus || undefined,
        page: newPage,
        limit,
      });
      if (res.success) {
        setData(res.data || []);
        setTotal(res.total || 0);
      }
    });
  }

  function handleOpenCreate() {
    setEditingHead(null);
    setName("");
    setDescription("");
    setStatus("ACTIVE");
    setError(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(head: any) {
    setEditingHead(head);
    setName(head.name || "");
    setDescription(head.description || "");
    setStatus(head.status === "INACTIVE" ? "INACTIVE" : "ACTIVE");
    setError(null);
    setIsModalOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Expense Head Name is required.");
      return;
    }

    setError(null);
    startTransition(async () => {
      let res;
      if (editingHead) {
        res = await updateExpenseHeadAction(editingHead.id, { name: name.trim(), description, status });
      } else {
        res = await createExpenseHeadAction({ name: name.trim(), description, status });
      }

      if (res.success) {
        setSuccess(editingHead ? "Expense Head updated successfully." : "Expense Head created successfully.");
        setIsModalOpen(false);
        fetchHeads();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || "Failed to save Expense Head.");
      }
    });
  }

  function handleDeleteConfirm() {
    if (!deletingHead) return;
    startTransition(async () => {
      const res = await deleteExpenseHeadAction(deletingHead.id);
      if (res.success) {
        setSuccess("Expense Head soft-deleted successfully.");
        setDeletingHead(null);
        fetchHeads();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(res.error || "Failed to delete Expense Head.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Expense Heads..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                fetchHeads(e.target.value, statusFilter, 1);
              }}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              fetchHeads(search, e.target.value, 1);
            }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {canCreate && (
          <Button onClick={handleOpenCreate} className="w-full sm:w-auto flex items-center justify-center gap-2">
            <Plus className="h-4 w-4" />
            Add Expense Head
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <Thead>
            <Tr>
              <Th>Expense Head Name</Th>
              <Th>Description</Th>
              <Th>Status</Th>
              <Th className="text-right">Created Date</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data.length === 0 ? (
              <Tr>
                <Td colSpan={5} className="py-12 text-center">
                  <EmptyState title="No Expense Heads Found" description="Create an Expense Head to categorize business expenses." icon={Tag} />
                </Td>
              </Tr>
            ) : (
              data.map((item) => (
                <Tr key={item.id}>
                  <Td className="font-semibold text-slate-900 dark:text-white">{item.name}</Td>
                  <Td className="text-slate-600 dark:text-slate-400 max-w-xs truncate">{item.description || "-"}</Td>
                  <Td>
                    <StatusBadge status={item.status === "ACTIVE" ? "ACTIVE" : "INACTIVE"} />
                  </Td>
                  <Td className="text-right text-slate-500 text-sm">{formatDate(item.createdAt)}</Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
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
                          onClick={() => setDeletingHead(item)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="Soft Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* Pagination */}
        {total > limit && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} Expense Heads
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage((p) => p - 1);
                  fetchHeads(search, statusFilter, page - 1);
                }}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page * limit >= total}
                onClick={() => {
                  setPage((p) => p + 1);
                  fetchHeads(search, statusFilter, page + 1);
                }}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingHead ? "Edit Expense Head" : "Add New Expense Head"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <TextField label="Expense Head Name *" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. Rent, Electricity, Transport" required />

          <Textarea label="Description (Optional)" value={description} onChange={(e: any) => setDescription(e.target.value)} placeholder="Brief note about this expense head" rows={3} />

          <SelectField
            label="Status"
            value={status}
            onChange={(e: any) => setStatus(e.target.value as "ACTIVE" | "INACTIVE")}
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
            ]}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : editingHead ? "Update Head" : "Create Head"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Soft Delete Modal */}
      {deletingHead && (
        <Modal isOpen={!!deletingHead} onClose={() => setDeletingHead(null)} title="Soft Delete Expense Head">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deletingHead.name}</strong>? Expenses associated with this head will remain intact.
            </p>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingHead(null)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {isPending ? "Deleting..." : "Delete Head"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
