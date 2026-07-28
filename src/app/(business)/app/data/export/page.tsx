"use client";

import React from "react";
import { DownloadCloud, FileText, TableProperties, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function ExportDataPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Export Data</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Export Data</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Download your business records for external use or analysis.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        
        <FormGrid>
          <div className="col-span-full mb-2">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">Export Configuration</h3>
          </div>
          
          <SelectField 
            label="Module to Export" 
            name="exportModule" 
            options={[
              { value: "products", label: "Products" },
              { value: "customers", label: "Customers" },
              { value: "suppliers", label: "Suppliers" },
              { value: "purchases", label: "Purchases" },
              { value: "sales", label: "Sales" },
              { value: "expenses", label: "Expenses" },
              { value: "collections", label: "Collections" },
              { value: "payments", label: "Supplier Payments" },
            ]}
          />

          <SelectField 
            label="Date Range" 
            name="dateRange" 
            options={[
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "this_week", label: "This Week" },
              { value: "this_month", label: "This Month" },
              { value: "custom", label: "Custom Range" },
            ]}
          />

          <div className="col-span-full mt-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Export Format</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <label className="cursor-pointer">
                <input type="radio" name="format" value="excel" className="peer sr-only" defaultChecked />
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 dark:peer-checked:bg-blue-900/20 dark:peer-checked:text-blue-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableProperties className="h-8 w-8" />
                  <span className="font-medium text-sm">Excel (.xlsx)</span>
                </div>
              </label>
              
              <label className="cursor-pointer">
                <input type="radio" name="format" value="csv" className="peer sr-only" />
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 dark:peer-checked:bg-blue-900/20 dark:peer-checked:text-blue-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableProperties className="h-8 w-8" />
                  <span className="font-medium text-sm">CSV (.csv)</span>
                </div>
              </label>

              <label className="cursor-pointer">
                <input type="radio" name="format" value="pdf" className="peer sr-only" />
                <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 peer-checked:border-blue-600 peer-checked:bg-blue-50 peer-checked:text-blue-700 dark:peer-checked:bg-blue-900/20 dark:peer-checked:text-blue-400 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <FileText className="h-8 w-8" />
                  <span className="font-medium text-sm">PDF Report</span>
                </div>
              </label>
              
            </div>
          </div>
        </FormGrid>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="primary" type="button">
            <DownloadCloud className="h-4 w-4 mr-2" />
            Generate & Download
          </Button>
        </div>
      </div>
    </div>
  );
}
