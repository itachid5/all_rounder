import { ChevronRight, BarChart3, TrendingUp, DollarSign, Users, Package, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/templates/egg-tasta/components";

export default function DashboardReportPage() {
  const kpis = [
    { title: "Total Sales", value: "$45,231.89", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
    { title: "Total Purchases", value: "$32,112.50", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
    { title: "Total Collections", value: "$40,000.00", icon: DollarSign, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
    { title: "Total Supplier Payments", value: "$28,500.00", icon: DollarSign, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
    { title: "Total Expenses", value: "$3,250.00", icon: BarChart3, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
    { title: "Total Customers", value: "142", icon: Users, color: "text-sky-500", bg: "bg-sky-50 dark:bg-sky-500/10" },
    { title: "Total Suppliers", value: "18", icon: Users, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
    { title: "Total Products", value: "56", icon: Package, color: "text-pink-500", bg: "bg-pink-50 dark:bg-pink-500/10" },
    { title: "Current Stock Value", value: "$12,450.00", icon: Package, color: "text-teal-500", bg: "bg-teal-50 dark:bg-teal-500/10" },
    { title: "Net Profit (Est)", value: "$9,869.39", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Dashboard Report</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Report</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">High-level business overview and KPIs.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Export PDF</button>
            <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-md text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors">Print Report</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-4 ${kpi.bg} ${kpi.color}`}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <EmptyState title="Daily Sales Chart" description="Chart integration pending." icon={BarChart3} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <EmptyState title="Monthly Sales Chart" description="Chart integration pending." icon={BarChart3} />
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm min-h-[300px] flex items-center justify-center">
          <EmptyState title="Expense Trend Chart" description="Chart integration pending." icon={BarChart3} />
        </div>
      </div>
    </div>
  );
}
