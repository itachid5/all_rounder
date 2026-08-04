"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Plus, FileDown, ArrowUpDown, Edit, Eye, RotateCcw, AlertTriangle, Copy, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  listProductsAction,
  bulkUpdateStatusAction,
  softDeleteProductAction,
  restoreProductAction,
  hardDeleteProductAction,
  duplicateProductAction,
} from "@/templates/egg-tasta/actions/products";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";
import { PermissionGuard } from "@/shared/components/permission-context";
import { useCurrency } from "@/shared/components/regional-context";

export function ManageProductsClient({
  initialData,
  initialTotal,
}: {
  initialData: any[];
  initialTotal: number;
}) {
  const { symbol } = useCurrency();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Error modal / message state
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchProducts = async () => {
    startTransition(() => {});
    const res = await listProductsAction({
      search,
      status: statusFilter,
      lowStock: lowStockFilter,
      sortBy,
      sortDir,
      page,
      limit,
    });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, lowStockFilter, sortBy, sortDir, page, limit]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map((d) => d.productCode)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (code: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(code)) newSet.delete(code);
    else newSet.add(code);
    setSelectedIds(newSet);
  };

  const handleBulkAction = async (status: "ACTIVE" | "INACTIVE" | "SOFT_DELETED") => {
    if (selectedIds.size === 0) return;
    if (status === "SOFT_DELETED" && !confirm("Soft delete selected products?")) return;

    setActionError(null);
    setActionSuccess(null);

    const codes = Array.from(selectedIds);
    const res = await bulkUpdateStatusAction(codes, status);
    if (res.success) {
      setActionSuccess(`Updated ${codes.length} products.`);
      fetchProducts();
      setSelectedIds(new Set());
    } else {
      setActionError(res.error || "Bulk action failed.");
    }
  };

  const handleEdit = (productCode: string) => {
    router.push(`/app/products/edit/${productCode}`);
  };

  const handleDuplicate = async (productCode: string) => {
    setActionError(null);
    setActionSuccess(null);
    const res = await duplicateProductAction(productCode);
    if (res.success) {
      setActionSuccess(`Product duplicated! New Code: ${res.productCode}`);
      fetchProducts();
    } else {
      setActionError(res.error || "Failed to duplicate product.");
    }
  };

  const handleSoftDelete = async (productCode: string) => {
    if (!confirm("Are you sure you want to Soft Delete this product? History will be preserved.")) return;
    setActionError(null);
    setActionSuccess(null);
    const res = await softDeleteProductAction(productCode);
    if (res.success) {
      setActionSuccess(`Product ${productCode} soft-deleted.`);
      fetchProducts();
    } else {
      setActionError(res.error || "Soft delete failed.");
    }
  };

  const handleRestore = async (productCode: string) => {
    setActionError(null);
    setActionSuccess(null);
    const res = await restoreProductAction(productCode);
    if (res.success) {
      setActionSuccess(`Product ${productCode} restored to Active.`);
      fetchProducts();
    } else {
      setActionError(res.error || "Restore failed.");
    }
  };

  const handleHardDelete = async (productCode: string) => {
    if (
      !confirm(
        "WARNING: Permanent Deletion!\n\nThis will PERMANENTLY remove the product from the database.\n\nContinue?"
      )
    )
      return;

    setActionError(null);
    setActionSuccess(null);
    const res = await hardDeleteProductAction(productCode);
    if (res.success) {
      setActionSuccess(`Product ${productCode} permanently deleted.`);
      fetchProducts();
    } else {
      setActionError(res.error || "Hard delete blocked.");
    }
  };

  return (
    <div className="space-y-6 max-w-full">
      {/* Alert Messages */}
      {actionError && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg flex items-start gap-3 shadow-sm text-sm font-medium">
          <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0 text-red-600" />
          <div>
            <h4 className="font-bold">Action Warning</h4>
            <p className="mt-0.5">{actionError}</p>
          </div>
        </div>
      )}

      {actionSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg flex items-center justify-between text-sm font-medium shadow-sm">
          <span>{actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
            ×
          </button>
        </div>
      )}

      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search product name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SOFT_DELETED">Soft Deleted</option>
            </select>

            <button
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`px-3 py-2 border rounded-lg text-sm flex items-center gap-2 transition-colors font-medium ${
                lowStockFilter
                  ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400"
                  : "bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300"
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </button>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <PermissionGuard permission="export:products">
            <Button variant="outline" className="hidden sm:flex" onClick={() => alert("Export feature initialized.")}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
          </PermissionGuard>
          <PermissionGuard permission="create:products">
            <Link href="/app/products/new">
              <Button variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </PermissionGuard>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <PermissionGuard permission="edit:products">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between animate-in fade-in">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
              {selectedIds.size} products selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("ACTIVE")}>
                Activate
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction("INACTIVE")}>
                Deactivate
              </Button>
              <PermissionGuard permission="delete:products">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction("SOFT_DELETED")}
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400"
                >
                  Soft Delete
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </PermissionGuard>
      )}

      {/* Table */}
      <Table className={isPending ? "opacity-60 pointer-events-none transition-opacity" : "transition-opacity"}>
        <Thead>
          <Tr>
            <Th className="w-10">
              <input
                type="checkbox"
                checked={data.length > 0 && selectedIds.size === data.length}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </Th>
            <Th className="cursor-pointer" onClick={() => toggleSort("productCode")}>
              <div className="flex items-center gap-1">
                Code {sortBy === "productCode" && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </Th>
            <Th className="cursor-pointer" onClick={() => toggleSort("name")}>
              <div className="flex items-center gap-1">
                Product {sortBy === "name" && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </Th>
            <Th className="cursor-pointer text-right" onClick={() => toggleSort("purchasePrice")}>
              <div className="flex items-center justify-end gap-1">
                Purchase Price {sortBy === "purchasePrice" && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </Th>
            <Th className="cursor-pointer text-right" onClick={() => toggleSort("sellingPrice")}>
              <div className="flex items-center justify-end gap-1">
                Selling Price {sortBy === "sellingPrice" && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </Th>
            <Th className="cursor-pointer text-right" onClick={() => toggleSort("currentStock")}>
              <div className="flex items-center justify-end gap-1">
                Stock {sortBy === "currentStock" && <ArrowUpDown className="h-3 w-3" />}
              </div>
            </Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState
                  title="No products found"
                  description="Try adjusting search or status filters."
                  icon={Search}
                  action={
                    <PermissionGuard permission="create:products">
                      <Link href="/app/products/new">
                        <Button variant="outline" size="sm">
                          Add Product
                        </Button>
                      </Link>
                    </PermissionGuard>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((item) => {
              const stockToDisplay = item.currentStock ?? item.openingStock ?? 0;
              const isLowStock = stockToDisplay <= item.minimumStockAlert;
              const hasVariants = item.hasVariants && Array.isArray(item.variants) && item.variants.length > 0;
              const isSoftDeleted = item.isDeleted || item.status === "SOFT_DELETED";

              return (
                <Tr
                  key={item.id}
                  className={
                    isSoftDeleted
                      ? "bg-slate-100/70 dark:bg-slate-800/40 opacity-75"
                      : selectedIds.has(item.productCode)
                      ? "bg-blue-50/50 dark:bg-blue-900/10"
                      : ""
                  }
                >
                  <Td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(item.productCode)}
                      onChange={() => handleSelectOne(item.productCode)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </Td>
                  <Td className="font-mono text-xs font-semibold text-slate-500">{item.productCode}</Td>
                  <Td className="font-semibold text-slate-900 dark:text-white">
                    {item.name}
                    {hasVariants && (
                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                        {item.variants.length} Variants
                      </span>
                    )}
                  </Td>
                  <Td className="text-right font-medium text-slate-700 dark:text-slate-300">
                    {symbol}
                    {item.purchasePrice?.toFixed(2)}
                  </Td>
                  <Td className="text-right font-bold text-slate-900 dark:text-white">
                    {symbol}
                    {item.sellingPrice?.toFixed(2)}
                  </Td>
                  <Td className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        isLowStock
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          : "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                      }`}
                    >
                      {stockToDisplay}
                    </span>
                  </Td>
                  <Td>
                    {isSoftDeleted ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Soft Deleted
                      </span>
                    ) : (
                      <StatusBadge status={item.status} />
                    )}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      <PermissionGuard permission="edit:products">
                        <button
                          onClick={() => handleEdit(item.productCode)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </PermissionGuard>

                      {/* Duplicate */}
                      <PermissionGuard permission="create:products">
                        <button
                          onClick={() => handleDuplicate(item.productCode)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                          title="Duplicate Product"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </PermissionGuard>

                      {/* Restore or Soft Delete */}
                      <PermissionGuard permission="delete:products">
                        {isSoftDeleted ? (
                          <button
                            onClick={() => handleRestore(item.productCode)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded transition-colors"
                            title="Restore Product"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSoftDelete(item.productCode)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded transition-colors"
                            title="Soft Delete Product"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </PermissionGuard>

                      {/* Hard Delete */}
                      <PermissionGuard permission="delete:products">
                        <button
                          onClick={() => handleHardDelete(item.productCode)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Hard Delete Product (Permanent)"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </PermissionGuard>
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
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-semibold">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-semibold">{Math.min(page * limit, total)}</span> of{" "}
            <span className="font-semibold">{total}</span> results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page * limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
