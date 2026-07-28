"use client";

import React from "react";
import { Database, Download, Upload, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-shop/components";

export default function BackupRestorePage() {
  const history = [
    { id: "1", date: "2024-03-15 23:59", type: "Manual", size: "14.2 MB", status: "Success" },
    { id: "2", date: "2024-03-10 23:59", type: "Manual", size: "13.8 MB", status: "Success" },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Settings</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Backup & Restore</span>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Backup & Restore</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Safeguard your business data.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Download className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Create Backup</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Download a complete snapshot of your database and settings to your local device.</p>
          <Button variant="primary" onClick={() => alert("Generating backup...")}>Generate Manual Backup</Button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Restore Backup</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Upload a previously downloaded `.bak` or `.sql` file to restore your system state.</p>
          <Button variant="outline" onClick={() => alert("Upload dialog...")}>Upload Backup File</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-medium text-slate-900 dark:text-white flex items-center">
            <Clock className="h-4 w-4 mr-2 text-slate-500" />
            Backup History
          </h3>
        </div>
        <Table>
          <Thead>
            <Tr>
              <Th>Date & Time</Th>
              <Th>Type</Th>
              <Th>File Size</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {history.map((h) => (
              <Tr key={h.id}>
                <Td>{h.date}</Td>
                <Td>{h.type}</Td>
                <Td>{h.size}</Td>
                <Td><span className="text-emerald-600 text-sm font-medium">{h.status}</span></Td>
                <Td className="text-right">
                  <button className="text-blue-600 hover:underline text-sm font-medium">Download</button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </div>
      
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 rounded-md text-sm border border-purple-100 dark:border-purple-800/50">
        <strong>Coming Soon:</strong> Automated Cloud Backups directly to Google Drive or AWS S3.
      </div>
    </div>
  );
}
