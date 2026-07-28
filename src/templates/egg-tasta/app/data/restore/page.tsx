"use client";

import React, { useState } from "react";
import { UploadCloud, AlertTriangle, CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, FormGrid } from "@/templates/egg-tasta/components";

export default function RestorePage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Restore</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Restore Database</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Restore the system data from a previous backup file.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 rounded-md p-4 mb-6 flex items-start gap-3 text-rose-800 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Warning: Destructive Action</h4>
            <p className="text-sm mt-1">
              Restoring a backup will overwrite all current system data. Any transactions, customers, or changes made after the backup was created will be permanently lost. We strongly recommend creating a fresh backup before proceeding.
            </p>
          </div>
        </div>

        <FormGrid>
          <div className="col-span-full border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-slate-950 transition-colors hover:bg-slate-100 dark:hover:bg-slate-900">
            <UploadCloud className="h-10 w-10 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Upload Backup File</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Drag and drop your .sql backup file here, or click to browse</p>
            <input 
              type="file" 
              accept=".sql" 
              className="hidden" 
              id="backup-upload" 
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="backup-upload">
              <Button variant="outline" type="button" className="pointer-events-none">
                Browse Files
              </Button>
            </label>
            {file && (
              <div className="mt-4 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>
        </FormGrid>

        <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button variant="primary" type="button" disabled={!file} className="bg-rose-600 hover:bg-rose-700 text-white border-rose-600">
            Confirm & Restore
          </Button>
        </div>
      </div>
    </div>
  );
}
