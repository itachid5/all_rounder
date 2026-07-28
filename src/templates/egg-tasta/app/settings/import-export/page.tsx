"use client";

import React from "react";
import { ArrowLeftRight, FileSpreadsheet, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/templates/egg-tasta/components";

export default function ImportExportPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Settings</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Import & Export</span>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ArrowLeftRight className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Import & Export</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Bulk manage your entities via CSV or Excel.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Import Data</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">Products</p>
                <p className="text-xs text-slate-500">Import inventory items</p>
              </div>
              <Button variant="outline" size="sm">Import CSV</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">Customers</p>
                <p className="text-xs text-slate-500">Import customer list</p>
              </div>
              <Button variant="outline" size="sm">Import CSV</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">Suppliers</p>
                <p className="text-xs text-slate-500">Import supplier list</p>
              </div>
              <Button variant="outline" size="sm">Import CSV</Button>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button className="text-blue-600 text-sm font-medium hover:underline flex items-center">
              <FileSpreadsheet className="h-4 w-4 mr-1.5" />
              Download Sample Templates
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Export Data</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">Products</p>
                <p className="text-xs text-slate-500">Export inventory to Excel</p>
              </div>
              <Button variant="outline" size="sm">Export XLS</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">Customers</p>
                <p className="text-xs text-slate-500">Export customers to Excel</p>
              </div>
              <Button variant="outline" size="sm">Export XLS</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">Suppliers</p>
                <p className="text-xs text-slate-500">Export suppliers to Excel</p>
              </div>
              <Button variant="outline" size="sm">Export XLS</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-200">All Reports</p>
                <p className="text-xs text-slate-500">Batch export financial reports</p>
              </div>
              <Button variant="outline" size="sm">Export ZIP</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
