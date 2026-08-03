"use client";

import React, { useState, useTransition } from "react";
import { DollarSign, Calendar, TrendingUp, BarChart3, PieChart, Printer, FileSpreadsheet, Download, ArrowUpRight } from "lucide-react";
import { getExpenseReportSummaryAction } from "@/templates/egg-tasta/actions/expenses";
import { useCurrency } from "@/shared/components/regional-context";

export function ExpenseReportClient({ initialSummary }: { initialSummary: any }) {
  const { symbol, formatMoney } = useCurrency();
  const [isPending, startTransition] = useTransition();
  const [period, setPeriod] = useState("this_month");
  const [summary, setSummary] = useState(initialSummary || {});

  function handlePeriodChange(newPeriod: string) {
    setPeriod(newPeriod);
    startTransition(async () => {
      const res = await getExpenseReportSummaryAction(newPeriod);
      if (res.success) {
        setSummary(res.data || {});
      }
    });
  }

  function handlePrint() {
    window.print();
  }

  function exportCSV() {
    const categoriesList = summary.categoriesList || [];
    const headers = ["Expense Head", "Expense Count", "Total Amount"];
    const rows = categoriesList.map((c: any) => [c.name, c.count, c.amount]);

    const csvContent = [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expense_report_${period}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  const categoriesList = summary.categoriesList || [];
  const topCategories = summary.topCategories || [];
  const trendList = summary.trendList || [];
  const totalExp = summary.totalExpense || 0;

  return (
    <div className="space-y-6 print:p-6 print:bg-white">
      {/* Top Filter & Actions Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-slate-500">Date Filter:</label>
          <select
            value={period}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel/CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 font-medium"
          >
            <Printer className="h-4 w-4" />
            Print Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Total Expense</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatMoney(summary.totalExpense || 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <Calendar className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">Today's Expense</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatMoney(summary.todayExpense || 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">This Week</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatMoney(summary.weekExpense || 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
            <BarChart3 className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">This Month</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatMoney(summary.monthExpense || 0)}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="h-10 w-10 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <PieChart className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-500">This Year</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatMoney(summary.yearExpense || 0)}</p>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Expense Categories */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-4 w-4 text-blue-500" />
              Top Expense Categories
            </h3>
          </div>

          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">No category data available.</p>
            ) : (
              topCategories.map((cat: any, idx: number) => {
                const percentage = totalExp > 0 ? Math.round((cat.amount / totalExp) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">{formatMoney(cat.amount)} ({percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Expense Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-500" />
              Monthly Expense Trend
            </h3>
          </div>

          <div className="flex-1 flex items-end justify-between gap-2 pt-6 min-h-[220px]">
            {trendList.length === 0 ? (
              <p className="text-sm text-slate-400 text-center w-full my-auto">No trend data available.</p>
            ) : (
              (() => {
                const maxVal = Math.max(...trendList.map((t: any) => t.amount), 1);
                return trendList.map((t: any, idx: number) => {
                  const barHeight = Math.round((t.amount / maxVal) * 100);
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        {formatMoney(t.amount)}
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-lg flex items-end overflow-hidden h-40">
                        <div
                          className="w-full bg-indigo-600 dark:bg-indigo-500 group-hover:bg-indigo-700 transition-all rounded-t-lg"
                          style={{ height: `${Math.max(barHeight, 8)}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono truncate">{t.month}</span>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </div>

      {/* Expense by Head Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-semibold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Expense Breakdown by Head</span>
          <span className="text-xs text-slate-400 font-normal">{categoriesList.length} Categories</span>
        </div>

        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800/40 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-3">Expense Head</th>
              <th className="px-6 py-3 text-center">Transactions Count</th>
              <th className="px-6 py-3 text-right">Total Expense</th>
              <th className="px-6 py-3 text-right">Percentage of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {categoriesList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No expenses recorded yet.
                </td>
              </tr>
            ) : (
              categoriesList.map((cat: any, idx: number) => {
                const pct = totalExp > 0 ? ((cat.amount / totalExp) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{cat.name}</td>
                    <td className="px-6 py-4 text-center font-medium text-slate-600 dark:text-slate-400">{cat.count}</td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">{formatMoney(cat.amount)}</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-500">{pct}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
