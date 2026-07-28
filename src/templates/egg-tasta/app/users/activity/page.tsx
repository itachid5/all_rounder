"use client";

import React from "react";
import { ChevronRight, Search, Activity } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";

export default function ActivityLogsPage() {
  const data = [
    { id: "1", user: "Alice Johnson", action: "Completed Sale #INV-123", module: "Sales", time: "2 mins ago", ip: "192.168.1.10" },
    { id: "2", user: "Alice Johnson", action: "Created Customer CUS-099", module: "Customers", time: "15 mins ago", ip: "192.168.1.10" },
    { id: "3", user: "Bob Smith", action: "Updated Role Permissions", module: "Users", time: "1 hour ago", ip: "10.0.0.5" },
    { id: "4", user: "Charlie Brown", action: "Received Collection $500", module: "Collection", time: "3 hours ago", ip: "192.168.1.15" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/users/manage" className="hover:text-blue-600 dark:hover:text-blue-400">User Management</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Activity Logs</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Activity Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all sensitive operations performed by employees.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search actions or users..." 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <select className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Modules</option>
            <option value="Sales">Sales</option>
            <option value="Purchases">Purchases</option>
            <option value="Users">Users</option>
          </select>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Date & Time</Th>
            <Th>User</Th>
            <Th>Module</Th>
            <Th>Action Taken</Th>
            <Th className="text-right">IP Address</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={5}>
                <EmptyState title="No Activity Logs" description="No recent activities found." icon={Activity} />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td className="whitespace-nowrap text-slate-500">{item.time}</Td>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.user}</Td>
                <Td>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                    {item.module}
                  </span>
                </Td>
                <Td className="text-slate-700 dark:text-slate-300">{item.action}</Td>
                <Td className="text-right font-mono text-xs text-slate-400">{item.ip}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
