"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Archive } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";

export function ExpenseCategoriesClient() {
  const [search, setSearch] = useState("");
  
  // Placeholder default data based on specs
  const [data, setData] = useState([
    { id: "1", name: "Shop Rent", status: "ACTIVE" },
    { id: "2", name: "Salary", status: "ACTIVE" },
    { id: "3", name: "Electricity Bill", status: "ACTIVE" },
    { id: "4", name: "Gas Bill", status: "ACTIVE" },
    { id: "5", name: "Internet Bill", status: "ACTIVE" },
    { id: "6", name: "Transport", status: "ACTIVE" },
    { id: "7", name: "Packaging", status: "ACTIVE" },
    { id: "8", name: "Maintenance", status: "ACTIVE" },
    { id: "9", name: "Office Expense", status: "ACTIVE" },
    { id: "10", name: "Miscellaneous", status: "ACTIVE" }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="primary" onClick={() => alert("Add category feature coming soon.")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Category Name</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={3}>
                <EmptyState 
                  title="No categories found" 
                  description="Create a new expense category to get started." 
                  icon={Search} 
                  action={
                    <Button variant="outline" size="sm" onClick={() => alert("Coming soon")}>Add Category</Button>
                  }
                />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.name}</Td>
                <Td>
                  <StatusBadge status={item.status as any} />
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Archive Category">
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
