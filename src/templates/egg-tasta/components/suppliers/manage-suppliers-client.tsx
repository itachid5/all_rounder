"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Plus, FileDown, ArrowUpDown, Archive, Edit, Eye, RotateCcw } from "lucide-react";
import Link from "next/link";
import { listSuppliersAction, updateSupplierStatusAction } from "@/templates/egg-tasta/actions/suppliers";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-shop/components";

export function ManageSuppliersClient({ initialData, initialTotal }: { initialData: any[], initialTotal: number }) {
  const [isPending, startTransition] = useTransition();
  
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  // Table State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listSuppliersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
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
      setSelectedIds(new Set(data.map(d => d.supplierCode)));
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
    if (status === 'ARCHIVED' && !confirm("Are you sure you want to archive selected suppliers?")) return;
    
    const codes = Array.from(selectedIds);
    await updateSupplierStatusAction(codes, status);
    
    const res = await listSuppliersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
    setSelectedIds(new Set());
  };

  const handleArchive = async (code: string) => {
    if (!confirm("Are you sure you want to archive this supplier?")) return;
    await updateSupplierStatusAction([code], 'ARCHIVED');
    const res = await listSuppliersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  const handleRestore = async (code: string) => {
    await updateSupplierStatusAction([code], 'ACTIVE');
    const res = await listSuppliersAction({ search, status: statusFilter, sortBy, sortDir, page, limit });
    if (res.success) {
      setData(res.data);
      setTotal(res.total);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search suppliers..." 
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
          <Link href="/app/suppliers/new">
            <Button variant="primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          </Link>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
            {selectedIds.size} suppliers selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('ACTIVE')}>Activate</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('INACTIVE')}>Deactivate</Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkAction('ARCHIVED')} className="text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-900/50 dark:hover:bg-amber-900/30">Archive</Button>
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
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('supplierCode')}>
              <div className="flex items-center gap-1">Code {sortBy === 'supplierCode' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('name')}>
              <div className="flex items-center gap-1">Supplier {sortBy === 'name' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('mobile')}>
              <div className="flex items-center gap-1">Mobile {sortBy === 'mobile' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('previousDue')}>
              <div className="flex items-center justify-end gap-1">Current Due {sortBy === 'previousDue' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Status</Th>
            <Th className="text-right">Last Purchase Date</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={8}>
                <EmptyState 
                  title="No suppliers found" 
                  description="Try adjusting your filters or search query." 
                  icon={Search} 
                  action={
                    <Link href="/app/suppliers/new">
                      <Button variant="outline" size="sm">Add Supplier</Button>
                    </Link>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((item) => {
              return (
                <Tr key={item.id} className={selectedIds.has(item.supplierCode) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}>
                  <Td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(item.supplierCode)}
                      onChange={() => handleSelectOne(item.supplierCode)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </Td>
                  <Td className="font-mono text-xs font-medium text-slate-500">{item.supplierCode}</Td>
                  <Td className="font-medium">{item.name}</Td>
                  <Td className="text-slate-600 dark:text-slate-400">{item.mobile}</Td>
                  <Td className="text-right text-slate-600 dark:text-slate-400">${item.previousDue?.toFixed(2)}</Td>
                  <Td>
                    <StatusBadge status={item.status} />
                  </Td>
                  <Td className="text-right text-slate-500 text-sm">
                    N/A
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors" title="View">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded dark:hover:text-blue-400 dark:hover:bg-blue-900/30 transition-colors" title="Edit">
                        <Edit className="h-4 w-4" />
                      </button>
                      {item.status === 'ARCHIVED' ? (
                        <button onClick={() => handleRestore(item.supplierCode)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded dark:hover:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors" title="Restore">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleArchive(item.supplierCode)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded dark:hover:text-amber-400 dark:hover:bg-amber-900/30 transition-colors" title="Archive">
                          <Archive className="h-4 w-4" />
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
