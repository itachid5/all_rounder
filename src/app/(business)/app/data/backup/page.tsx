"use client";

import React from "react";
import { Download, Trash2, CalendarClock, HardDriveDownload, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function BackupPage() {
  const backups = [
    { id: 1, name: "egg_shop_db_20240319.sql", date: "2024-03-19 02:00 AM", size: "45 MB", createdBy: "Auto System" },
    { id: 2, name: "egg_shop_db_20240318.sql", date: "2024-03-18 11:30 PM", size: "44.5 MB", createdBy: "Admin User" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Data Management</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Backup</span>
        </nav>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Database Backup</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage manual and scheduled system backups.</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <CalendarClock className="h-4 w-4 mr-2" />
              Schedule Settings
            </Button>
            <Button variant="primary">
              <HardDriveDownload className="h-4 w-4 mr-2" />
              Create Backup Now
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <Table>
          <Thead>
            <Tr>
              <Th>Backup Name</Th>
              <Th>Creation Date</Th>
              <Th>File Size</Th>
              <Th>Created By</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {backups.map((item) => (
              <Tr key={item.id}>
                <Td className="font-medium text-slate-900 dark:text-white">{item.name}</Td>
                <Td className="text-slate-500">{item.date}</Td>
                <Td>{item.size}</Td>
                <Td>{item.createdBy}</Td>
                <Td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" className="p-2 h-8" title="Download Backup">
                      <Download className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="outline" className="p-2 h-8 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20" title="Delete Backup">
                      <Trash2 className="h-4 w-4 text-rose-600" />
                    </Button>
                  </div>
                </Td>
              </Tr>
            ))}
            {backups.length === 0 && (
              <Tr>
                <Td colSpan={5} className="text-center py-8 text-slate-500">No backups found.</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  );
}
