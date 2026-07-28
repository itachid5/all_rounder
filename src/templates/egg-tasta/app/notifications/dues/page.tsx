"use client";

import React from "react";
import { Clock, MessageSquare, Mail, Smartphone, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function DueRemindersPage() {
  const customerDues = [
    { id: 1, entity: "Retailer A", amount: 1500.00, dueDate: "2024-03-20", lastReminded: "Yesterday" },
    { id: 2, entity: "Wholesaler B", amount: 4500.00, dueDate: "2024-03-15 (Overdue)", lastReminded: "3 days ago" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Due Reminders</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Due Reminders</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track and trigger reminders for outstanding payments.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex gap-4">
        <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48">
          <option>Customer Dues</option>
          <option>Supplier Dues</option>
        </select>
        <Button variant="primary">Send Bulk Reminders</Button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Customer Name</Th>
            <Th className="text-right">Due Amount</Th>
            <Th>Due Date</Th>
            <Th>Last Reminded</Th>
            <Th className="text-right">Send Reminder Via</Th>
          </Tr>
        </Thead>
        <Tbody>
          {customerDues.map((item) => (
            <Tr key={item.id}>
              <Td className="font-medium text-slate-900 dark:text-slate-200">{item.entity}</Td>
              <Td className="text-right font-bold text-rose-600">${item.amount.toFixed(2)}</Td>
              <Td className={item.dueDate.includes('Overdue') ? 'text-rose-500 font-medium' : ''}>{item.dueDate}</Td>
              <Td className="text-slate-500 text-sm">{item.lastReminded}</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Send SMS">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Send WhatsApp">
                    <Smartphone className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Send Email">
                    <Mail className="h-4 w-4" />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
