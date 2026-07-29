"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Plus, FileDown, ArrowUpDown, Archive, Trash2, Edit, Eye, RotateCcw, Scale } from "lucide-react";
import Link from "next/link";
import { listCustomersAction, updateCustomerStatusAction } from "@/templates/egg-tasta/actions/customers";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";
import { EditCustomerDialog } from "./edit-customer-dialog";
import { BalanceAdjustmentDialog } from "./balance-adjustment-dialog";
import { CustomerProfileDrawer } from "./CustomerProfileDrawer";
import { formatDate } from "@/shared/utils/date";

export interface CustomerPermissions {
  view: boolean;
  add: boolean;
  edit: boolean;
  archive: boolean;
  restore: boolean;
  adjustBalance: boolean;
}

export function ManageCustomersClient({ initialData, initialTotal, permissions = { view: true, add: true, edit: true, archive: true, restore: true, adjustBalance: true } }: { initialData: any[], initialTotal: number, permissions?: CustomerPermissions }) {
  const [isPending, startTransition] = useTransition();
  
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  // Table State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingCustomerCode, setViewingCustomerCode] = useState<string | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [adjustingBalanceCustomer, setAdjustingBalanceCustomer] = useState<any>(null);
  const [customerToArchive, setCustomerToArchive] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listCustomersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
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

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(data.map(d => d.customerCode)));
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

  const handleBulkAction = async (status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') => {
    if (selectedIds.size === 0) return;
    if (status === 'ARCHIVED' && !confirm("Are you sure you want to archive selected customers?")) return;
    
    const codes = Array.from(selectedIds);
    await updateCustomerStatusAction(codes, status);
    
    const res = await listCustomersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
    setSelectedIds(new Set());
  };

  const handleArchive = (code: string) => {
    setCustomerToArchive(code);
  };

  const confirmArchive = async () => {
    if (!customerToArchive) return;
    await updateCustomerStatusAction([customerToArchive], 'ARCHIVED');
    setCustomerToArchive(null);
    setSuccessMessage("Customer archived successfully.");
    setTimeout(() => setSuccessMessage(null), 3000);
    const res = await listCustomersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  const handleRestore = async (code: string) => {
    await updateCustomerStatusAction([code], 'ACTIVE');
    setSuccessMessage("Customer restored successfully.");
    setTimeout(() => setSuccessMessage(null), 3000);
    const res = await listCustomersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  const handleEditSuccess = async () => {
    setEditingCustomer(null);
    setSuccessMessage("Customer updated successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
    
    const res = await listCustomersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-md flex items-center gap-3">
          <p>{successMessage}</p>
        </div>
      )}
      
      {viewingCustomerCode && (
        <CustomerProfileDrawer
          customerCode={viewingCustomerCode}
          onClose={() => setViewingCustomerCode(null)}
          onEdit={(customer) => {
            setViewingCustomerCode(null);
            setEditingCustomer(customer);
          }}
          onAdjustBalance={(customer) => {
            setViewingCustomerCode(null);
            setAdjustingBalanceCustomer(customer);
          }}
        />
      )}
      
      {editingCustomer && (
        <EditCustomerDialog 
          customer={editingCustomer} 
          onClose={() => setEditingCustomer(null)} 
          onSuccess={handleEditSuccess} 
        />
      )}

      {adjustingBalanceCustomer && (
        <BalanceAdjustmentDialog 
          customer={adjustingBalanceCustomer} 
          onClose={() => setAdjustingBalanceCustomer(null)} 
          onSuccess={() => {
            setAdjustingBalanceCustomer(null);
            setSuccessMessage("Customer balance adjusted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
            const refresh = async () => {
              const res = await listCustomersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
              if (res.success) {
                setData(res.data);
                setTotal(res.total);
              }
            };
            refresh();
          }} 
        />
      )}

      {customerToArchive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete this customer?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setCustomerToArchive(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={confirmArchive} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
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
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex" onClick={() => alert('Export feature coming soon.')}>
            <FileDown className="h-4 w-4 mr-2" />
            Export
          </Button>
          {permissions.add && (
            <Link href="/app/customers/new">
              <Button variant="primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {selectedIds.size} customers selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('ACTIVE')}>Activate</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('INACTIVE')}>Deactivate</Button>
            {permissions.archive && (
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('ARCHIVED')} className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/30">Delete</Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="w-12">
              <input 
                type="checkbox" 
                checked={data.length > 0 && selectedIds.size === data.length}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('customerCode')}>
              <div className="flex items-center gap-1">Code {sortBy === 'customerCode' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('name')}>
              <div className="flex items-center gap-1">Customer {sortBy === 'name' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('mobile')}>
              <div className="flex items-center gap-1">Mobile {sortBy === 'mobile' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('previousDue')}>
              <div className="flex items-center justify-end gap-1">Previous Due {sortBy === 'previousDue' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Status</Th>
            <Th className="text-right">Created Date</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No customers found" 
                  description="Try adjusting your filters or search query." 
                  icon={Search} 
                  action={
                    <Link href="/app/customers/new">
                      <Button variant="outline" size="sm">Add Customer</Button>
                    </Link>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((item) => {
              return (
                <Tr key={item.id} className={selectedIds.has(item.customerCode) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                  <Td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.customerCode)}
                      onChange={() => handleSelectOne(item.customerCode)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </Td>
                  <Td className="font-mono text-xs font-medium text-slate-500">{item.customerCode}</Td>
                  <Td className="font-medium">{item.name}</Td>
                  <Td className="text-slate-600 dark:text-slate-400">{item.mobile}</Td>
                  <Td className="text-right text-slate-600 dark:text-slate-400">${item.previousDue?.toFixed(2)}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                  <Td className="text-right text-slate-500 text-sm">
                    {formatDate(item.createdAt)}
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {permissions.view && (
                        <button onClick={() => setViewingCustomerCode(item.customerCode)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.edit && (
                        <button onClick={() => setEditingCustomer(item)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {permissions.adjustBalance && (
                        <button onClick={() => setAdjustingBalanceCustomer(item)} className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded dark:hover:text-purple-400 dark:hover:bg-purple-900/30 transition-colors" title="Balance Adjustment">
                          <Scale className="h-4 w-4" />
                        </button>
                      )}
                      {item.status === 'ARCHIVED' ? (
                        permissions.restore && (
                          <button onClick={() => handleRestore(item.customerCode)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors" title="Restore">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )
                      ) : (
                        permissions.archive && (
                          <button onClick={() => handleArchive(item.customerCode)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )
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
