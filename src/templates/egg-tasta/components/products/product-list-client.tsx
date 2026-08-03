"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search, Plus, ArrowUpDown, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { listProductsAction } from "@/templates/egg-tasta/actions/products";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";
import { PermissionGuard } from "@/shared/components/permission-context";
import { useCurrency } from "@/shared/components/regional-context";

export function ProductListClient({ initialData, initialTotal }: { initialData: any[], initialTotal: number }) {
  const { symbol } = useCurrency();
  const [isPending, startTransition] = useTransition();
  
  const [data, setData] = useState(initialData);
  const [total, setTotal] = useState(initialTotal);
  
  // Table State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState<'asc'|'desc'>("desc");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetch = async () => {
      startTransition(() => {});
      const res = await listProductsAction({ search, status: statusFilter, lowStock: lowStockFilter, sortBy, sortDir, page, limit });
      if (res.success) {
        setData(res.data);
        setTotal(res.total);
      }
    };
    
    const timer = setTimeout(() => fetch(), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, lowStockFilter, sortBy, sortDir, page, limit]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products or barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 sm:flex-none"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            
            <button 
              onClick={() => setLowStockFilter(!lowStockFilter)}
              className={`px-3 py-2 border rounded-md text-sm flex items-center gap-2 transition-colors flex-1 sm:flex-none justify-center ${lowStockFilter ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-400' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'}`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Low Stock</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table className={isPending ? 'opacity-60 pointer-events-none transition-opacity' : 'transition-opacity'}>
        <Thead>
          <Tr>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('productCode')}>
              <div className="flex items-center gap-1">Code {sortBy === 'productCode' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => toggleSort('name')}>
              <div className="flex items-center gap-1">Product {sortBy === 'name' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('purchasePrice')}>
              <div className="flex items-center justify-end gap-1">Opening Purchase {sortBy === 'purchasePrice' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('sellingPrice')}>
              <div className="flex items-center justify-end gap-1">Selling {sortBy === 'sellingPrice' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th className="text-right">Wholesale</Th>
            <Th className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-right" onClick={() => toggleSort('currentStock')}>
              <div className="flex items-center justify-end gap-1">Stock {sortBy === 'currentStock' && <ArrowUpDown className="h-3 w-3" />}</div>
            </Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState 
                  title="No products found" 
                  description={search || statusFilter || lowStockFilter ? "Try adjusting your filters or search query." : "Your catalog is currently empty."}
                  icon={Search} 
                  action={
                    !search && !statusFilter && !lowStockFilter && (
                      <PermissionGuard permission="create:products">
                        <Link href="/app/products/new" className="w-full sm:w-auto">
                          <Button variant="primary" className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                          </Button>
                        </Link>
                      </PermissionGuard>
                    )
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((item) => {
              const stockToDisplay = item.currentStock ?? item.openingStock;
              const isLowStock = stockToDisplay <= item.minimumStockAlert;
              
              return (
                <Tr key={item.id}>
                  <Td className="font-mono text-xs font-medium text-slate-500">{item.productCode}</Td>
                  <Td className="font-medium">{item.name}</Td>
                  <Td className="text-right text-slate-600 dark:text-slate-400">{symbol}{item.purchasePrice?.toFixed(2)}</Td>
                  <Td className="text-right font-medium">{symbol}{item.sellingPrice?.toFixed(2)}</Td>
                  <Td className="text-right text-slate-600 dark:text-slate-400">{symbol}{item.wholesalePrice?.toFixed(2)}</Td>
                  <Td className="text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${isLowStock ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                      {stockToDisplay}
                    </span>
                  </Td>
                  <Td>
                    <StatusBadge status={item.status} />
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
            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, total)}</span> of <span className="font-medium">{total}</span>
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
