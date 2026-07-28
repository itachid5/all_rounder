"use client";

import React, { useState } from "react";
import { UploadCloud, FileDown, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function ImportDataPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Import Data</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Import Data</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Bulk import records using Excel or CSV files.</p>
          </div>
          <Button variant="outline">
            <FileDown className="h-4 w-4 mr-2" />
            Download Sample File
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        
        <FormGrid>
          <div className="col-span-full">
            <SelectField 
              label="Select Import Type" 
              name="importType" 
              options={[
                { value: "products", label: "Products" },
                { value: "suppliers", label: "Suppliers" },
                { value: "customers", label: "Customers" },
                { value: "opening_stock", label: "Opening Stock" },
              ]}
            />
          </div>

          <div className="col-span-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950 mt-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
            <UploadCloud className="h-10 w-10 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Upload File</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Supported formats: .xlsx, .csv (Max 10MB)</p>
            <input 
              type="file" 
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
              className="hidden" 
              id="data-upload" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="data-upload">
              <Button variant="outline" type="button" className="pointer-events-none">
                Browse Files
              </Button>
            </label>
            {file && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
                <p className="text-xs text-slate-500">Validation: 15 valid rows, 0 invalid rows.</p>
              </div>
            )}
          </div>
        </FormGrid>

        <div className="flex items-center gap-2 p-3 mt-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm">
          <AlertCircle className="h-4 w-4" />
          <p>Please review the data preview before final import. Invalid rows will be automatically skipped.</p>
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="button" disabled={!file}>
            Preview & Import
          </Button>
        </div>
      </div>
    </div>
  );
}
