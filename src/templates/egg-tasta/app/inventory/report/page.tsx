"use client";

import React, { useState } from "react";
import { FileDown, Printer, Filter, Download, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function AdjustmentReportPage() {
  const [reportType, setReportType] = useState("daily");

  const reports = [
    { id: 1, date: "2024-03-18", no: "ADJ-00001", product: "Premium Brown Eggs", previous: 150, new: 145, diff: -5, type: "Decrease", reason: "Broken Eggs", user: "Admin User" },
    { id: 2, date: "2024-03-18", no: "ADJ-00002", product: "White Eggs (Medium)", previous: 0, new: 50, diff: 50, type: "Increase", reason: "Opening Balance", user: "Admin User" },
    { id: 3, date: "2024-03-19", no: "ADJ-00003", product: "Organic Eggs", previous: 200, new: 198, diff: -2, type: "Decrease", reason: "Damaged", user: "Manager" },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Inventory</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Adjustment Report</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Adjustment Report</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed history and summary of manual stock adjustments.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Report View:</span>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-md">
            {[
              { id: "daily", label: "Daily" },
              { id: "monthly", label: "Monthly" },
              { id: "product", label: "Product-wise" },
              { id: "reason", label: "Reason-wise" },
              { id: "user", label: "User-wise" },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded ${
                  reportType === type.id 
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <input type="date" className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <span className="text-slate-400">to</span>
            <input type="date" className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            
            <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Products</option>
            </select>
            <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Adjustment Types</option>
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="primary">
              <FileDown className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Date & Time</Th>
            <Th>Adj. No</Th>
            <Th>Product</Th>
            <Th>Reason</Th>
            <Th className="text-right">Prev. Stock</Th>
            <Th className="text-right">New Stock</Th>
            <Th className="text-right font-bold text-slate-900 dark:text-white">Difference</Th>
            <Th>User</Th>
          </Tr>
        </Thead>
        <Tbody>
          {reports.map((item) => (
            <Tr key={item.id}>
              <Td className="whitespace-nowrap text-slate-500">{item.date}</Td>
              <Td className="font-medium text-slate-900 dark:text-white">{item.no}</Td>
              <Td>{item.product}</Td>
              <Td>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  {item.reason}
                </span>
              </Td>
              <Td className="text-right">{item.previous}</Td>
              <Td className="text-right">{item.new}</Td>
              <Td className="text-right">
                <span className={`font-semibold ${
                  item.diff > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {item.diff > 0 ? `+${item.diff}` : item.diff}
                </span>
              </Td>
              <Td className="text-slate-500">{item.user}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </div>
  );
}
