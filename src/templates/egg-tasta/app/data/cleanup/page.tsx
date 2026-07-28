"use client";

import React from "react";
import { Trash2, AlertTriangle, Archive, RefreshCw, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/templates/egg-tasta/components";

export default function DataCleanupPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Cleanup</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Data Cleanup</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage storage space by archiving or removing temporary records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Archive Old Records */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Archive className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Archive Old Records</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Move inactive records to archive</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
            Archiving removes records from active lists but preserves financial integrity. Archived records can be viewed in reports.
          </p>
          <div className="space-y-3">
            <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Records older than 1 Year</option>
              <option>Records older than 2 Years</option>
              <option>Records older than 3 Years</option>
            </select>
            <Button variant="outline" className="w-full justify-center">
              Preview Archive List
            </Button>
          </div>
        </div>

        {/* Clear Cache */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Clear System Cache</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Free up space and resolve UI issues</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
            Safely clear temporary files, compiled views, and cached queries. This does not affect any business data.
          </p>
          <div className="flex items-end mt-auto">
            <Button variant="outline" className="w-full justify-center text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20">
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear Cache Now
            </Button>
          </div>
        </div>

        {/* Clean Activity Logs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Clean Activity & System Logs</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete old non-financial logs</p>
            </div>
          </div>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-md p-4 mb-6 flex items-start gap-3 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">
              <strong>Note:</strong> Financial records, invoices, and transaction histories can NEVER be permanently deleted. This action only removes old user activity logs and system debug logs based on your retention policy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full space-y-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Retention Policy</label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Keep last 30 days</option>
                <option>Keep last 60 days</option>
                <option>Keep last 90 days</option>
              </select>
            </div>
            <Button variant="outline" className="w-full sm:w-auto text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Old Logs
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
