import { ChevronRight, BarChart3, Search, Printer, FileDown } from "lucide-react";
import Link from "next/link";
import { EmptyState, Table, Thead, Tbody, Tr, Th, Td } from "@/templates/egg-shop/components";

export default function GenericReportPage({ title = "Report", description = "View and analyze report data.", type = "General" }) {
  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/reports/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Reports</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">{title}</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
      </div>

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
            <label className="text-xs font-medium text-slate-500 mb-1">Filter By</label>
            <select className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Data</option>
            </select>
          </div>
          <div className="relative flex items-end">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search records..." 
                 className="pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
               />
             </div>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0 items-end">
          <button className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm hover:bg-slate-700 transition-colors flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center">
            <FileDown className="h-4 w-4 mr-2" />
            PDF / Excel
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-12 flex items-center justify-center">
           <EmptyState 
             title={`No ${type} Data Found`} 
             description="Try adjusting your filters or search terms." 
             icon={BarChart3} 
           />
        </div>
      </div>
    </div>
  );
}
