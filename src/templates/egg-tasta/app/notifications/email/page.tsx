"use client";

import React from "react";
import { Mail, Edit, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function EmailTemplatesPage() {
  const templates = [
    { id: 1, name: "Customer Collection Reminder", subject: "Payment Reminder: Invoice {InvoiceNumber}", variables: "{CustomerName}, {DueAmount}, {DueDate}" },
    { id: 2, name: "Sale Confirmation", subject: "Invoice from Egg Shop Trading: {InvoiceNumber}", variables: "{CustomerName}, {TotalAmount}" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Email Templates</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Email Templates</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure subjects, variables, and HTML body content for automated emails.</p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Template Name</Th>
            <Th>Subject Line</Th>
            <Th>Available Variables</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((tpl) => (
            <Tr key={tpl.id}>
              <Td className="font-medium text-slate-900 dark:text-slate-200">{tpl.name}</Td>
              <Td className="text-slate-600 dark:text-slate-400 text-sm">{tpl.subject}</Td>
              <Td className="text-slate-500 text-xs font-mono">{tpl.variables}</Td>
              <Td className="text-right">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit HTML">
                  <Edit className="h-4 w-4" />
                </button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
