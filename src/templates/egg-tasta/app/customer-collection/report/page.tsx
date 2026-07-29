import { ChevronRight, BarChart3, Calendar, Users, PieChart } from "lucide-react";
import Link from "next/link";

export default function CollectionReportPage() {
  const reports = [
    { title: "Daily Collection", icon: Calendar, description: "View all collections made today." },
    { title: "Monthly Collection", icon: BarChart3, description: "Analyze collection trends over the month." },
    { title: "Customer-wise Collection", icon: Users, description: "Breakdown of collections per customer." },
    { title: "Collection Summary", icon: PieChart, description: "High-level summary of total inflows." },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/customer-collection/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customer Collection</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Collection Report</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Collection Report</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Analyze customer collection data and generate reports.</p>
      </div>

      {/* Global Report Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Date Range</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Customer Filter</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Customers</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Method Filter</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Methods</option>
              <option value="CASH">Cash</option>
              <option value="BANK">Bank</option>
              <option value="MOBILE_BANKING">Mobile Banking</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 items-end">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition-colors">
            Generate
          </button>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" disabled title="Export feature coming soon">
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm opacity-60">
            <div className="h-12 w-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <report.icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">{report.title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{report.description}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm text-slate-400">
              <span>Report Engine Not Initialized</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
