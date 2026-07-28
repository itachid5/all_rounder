"use client";

import React from "react";
import { ChevronRight, Search, Key } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";

export default function LoginHistoryPage() {
  const data = [
    { id: "1", user: "alice_j", loginTime: "2024-03-16 08:30 AM", logoutTime: "Active", device: "Desktop", browser: "Chrome", ip: "192.168.1.10", status: "SUCCESS" },
    { id: "2", user: "charlie_b", loginTime: "2024-03-16 07:15 AM", logoutTime: "-", device: "Mobile", browser: "Safari", ip: "10.0.0.2", status: "FAILED" },
    { id: "3", user: "bob_s", loginTime: "2024-03-15 09:00 AM", logoutTime: "2024-03-15 05:30 PM", device: "Desktop", browser: "Firefox", ip: "192.168.1.20", status: "SUCCESS" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/users/manage" className="hover:text-blue-600 dark:hover:text-blue-400">User Management</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Login History</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Login History</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor employee access sessions and device information.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user or IP..." 
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <select className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Username</Th>
            <Th>Login Time</Th>
            <Th>Logout Time</Th>
            <Th>Device / Browser</Th>
            <Th>IP Address</Th>
            <Th className="text-right">Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={6}>
                <EmptyState title="No Login Records" description="System access records will appear here." icon={Key} />
              </Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-slate-900 dark:text-slate-200">{item.user}</Td>
                <Td className="text-slate-600 dark:text-slate-400 whitespace-nowrap">{item.loginTime}</Td>
                <Td className="text-slate-500">{item.logoutTime}</Td>
                <Td className="text-slate-600 dark:text-slate-400">{item.device} • {item.browser}</Td>
                <Td className="font-mono text-xs text-slate-400">{item.ip}</Td>
                <Td className="text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                    {item.status}
                  </span>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </div>
  );
}
