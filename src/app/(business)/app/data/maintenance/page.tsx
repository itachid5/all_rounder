"use client";

import React from "react";
import { Database, Activity, HardDrive, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/templates/egg-shop/components";

export default function DatabaseMaintenancePage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Database Maintenance</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Database Maintenance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor database health and optimize performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Database Size</h3>
            <HardDrive className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">248 MB</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
            <span className="font-medium">Healthy limit</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Records</h3>
            <Database className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">14,209</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Across all tables
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Last Backup</h3>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">Today</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            02:00 AM (Auto)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">System Health</h3>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">Optimal</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            No issues detected
          </p>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <Zap className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Optimize Database</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
            Reorganizes physical storage of table data and index data to reduce storage space and improve I/O efficiency.
          </p>
          <Button variant="outline" className="w-full justify-center">
            Run Optimization
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Database className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Rebuild Indexes</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-1">
            Rebuilds database indexes to improve search speed and query execution performance across large datasets.
          </p>
          <Button variant="outline" className="w-full justify-center">
            Rebuild Indexes
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm flex flex-col items-center text-center md:col-span-2">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Integrity Check</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-2xl">
            Performs a deep scan of the database structure to detect potential corruption or foreign key constraint violations. It is recommended to run this check monthly.
          </p>
          <Button variant="outline" className="w-full sm:w-auto justify-center">
            Run Integrity Check
          </Button>
        </div>

      </div>
    </div>
  );
}
