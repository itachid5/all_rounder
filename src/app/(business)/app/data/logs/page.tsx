"use client";

import React from "react";
import { Search, Filter, FileDown, AlertCircle, Info, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function SystemLogsPage() {
  const logs = [
    { id: 1, time: "2024-03-19 14:32:01", type: "Error", message: "Failed to connect to email SMTP server", source: "Background Job" },
    { id: 2, time: "2024-03-19 12:15:44", type: "Warning", message: "High memory usage detected during export", source: "Export Service" },
    { id: 3, time: "2024-03-19 02:05:00", type: "Success", message: "Automated database backup completed successfully", source: "Cron Job" },
    { id: 4, time: "2024-03-18 23:45:12", type: "Info", message: "Admin User logged in from IP 192.168.1.5", source: "Auth Service" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">System Logs</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">System Logs</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Review system events, warnings, errors, and background jobs.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
          </div>
          <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="Error">Errors</option>
            <option value="Warning">Warnings</option>
            <option value="Info">Info</option>
            <option value="Success">Success</option>
          </select>
          <input type="date" className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        
        <Button variant="outline" className="shrink-0 w-full sm:w-auto">
          <FileDown className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <Thead>
            <Tr>
              <Th>Timestamp</Th>
              <Th>Type</Th>
              <Th>Source</Th>
              <Th>Message</Th>
            </Tr>
          </Thead>
          <Tbody>
            {logs.map((item) => (
              <Tr key={item.id}>
                <Td className="whitespace-nowrap text-slate-500">{item.time}</Td>
                <Td>
                  {item.type === 'Error' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">
                      <AlertCircle className="h-3.5 w-3.5" /> Error
                    </span>
                  )}
                  {item.type === 'Warning' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      <AlertCircle className="h-3.5 w-3.5" /> Warning
                    </span>
                  )}
                  {item.type === 'Success' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Success
                    </span>
                  )}
                  {item.type === 'Info' && (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Info className="h-3.5 w-3.5" /> Info
                    </span>
                  )}
                </Td>
                <Td className="text-slate-500">{item.source}</Td>
                <Td className="font-medium text-slate-900 dark:text-white max-w-lg truncate">{item.message}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
