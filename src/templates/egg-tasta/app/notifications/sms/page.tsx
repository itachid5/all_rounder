"use client";

import React, { useState } from "react";
import { MessageSquare, Edit, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function SmsTemplatesPage() {
  const templates = [
    { id: 1, name: "Customer Collection Reminder", content: "Dear {CustomerName}, your payment of {DueAmount} is pending. Please clear it by {DueDate}. Thank you." },
    { id: 2, name: "Supplier Payment Notice", content: "Dear {SupplierName}, we have paid {PaymentAmount} against {InvoiceNumber}. Thank you." },
    { id: 3, name: "Sale Confirmation", content: "Hello {CustomerName}, your purchase of {TotalAmount} is confirmed. Invoice: {InvoiceNumber}." },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Notifications</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">SMS Templates</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">SMS Templates</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage the text message formats sent to customers and suppliers.</p>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Template Name</Th>
            <Th>Message Content</Th>
            <Th className="text-right">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {templates.map((tpl) => (
            <Tr key={tpl.id}>
              <Td className="font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">{tpl.name}</Td>
              <Td className="text-slate-600 dark:text-slate-400 text-sm max-w-md">{tpl.content}</Td>
              <Td className="text-right">
                <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Template">
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
