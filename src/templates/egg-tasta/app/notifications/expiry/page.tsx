"use client";

import React from "react";
import { Calendar, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td, EmptyState } from "@/templates/egg-tasta/components";

export default function ExpiryAlertsPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Expiry Alerts</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Expiry Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track products nearing their expiration dates.</p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Product Name</Th>
            <Th>Batch Number</Th>
            <Th>Expiry Date</Th>
            <Th className="text-right">Days Remaining</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td colSpan={4}>
              <EmptyState 
                title="Future Ready Feature" 
                description="Expiry tracking will be enabled in a future update." 
                icon={Calendar} 
              />
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </div>
  );
}
