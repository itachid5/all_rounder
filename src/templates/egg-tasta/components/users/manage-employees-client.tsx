"use client";

import React, { useState } from "react";
import { Search, Plus, Edit, Shield, Archive, KeyRound } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState, StatusBadge } from "@/templates/egg-tasta/components";

export function ManageEmployeesClient() {
  const [search, setSearch] = useState("");
  
  // Placeholder data
  const [data, setData] = useState([
    { id: "1", empId: "EMP-001", name: "Alice Johnson", designation: "Manager", username: "alice_j", status: "ACTIVE", lastLogin: "2 hours ago" },
    { id: "2", empId: "EMP-002", name: "Bob Smith", designation: "Salesman", username: "bob_s", status: "ACTIVE", lastLogin: "1 day ago" },
    { id: "3", empId: "EMP-003", name: "Charlie Brown", designation: "Cashier", username: "charlie_b", status: "INACTIVE", lastLogin: "Never" },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
        </div>

        <Link href="/app/users/new">
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </Link>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Emp ID</Th>
            <Th>Name</Th>
            <Th>Designation</Th>
            <Th>Username</Th>
            <Th>Last Login</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={7}>
                <EmptyState title="No Employees Found" description="Add an employee to manage their access." icon={Search} />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td className="font-mono text-xs">{item.empId}</Td>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.name}</Td>
                <Td>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    {item.designation}
                  </span>
                </Td>
                <Td className="text-slate-500">{item.username}</Td>
                <Td className="text-slate-500 text-sm">{item.lastLogin}</Td>
                <Td>
                  <StatusBadge status={item.status as any} />
                </Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors" title="Reset Password">
                      <KeyRound className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Archive">
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
