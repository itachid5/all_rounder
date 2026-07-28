import React from "react";
import { 
  Package, Users, DollarSign, Archive, AlertTriangle, CreditCard, 
  Clock, Zap, ShoppingCart, TrendingUp, TrendingDown, Bell, Wallet, Building, Smartphone
} from "lucide-react";
import { PageHeader, ContentContainer, StatCard, SummaryCard } from "@/templates/egg-shop/components";
import Link from "next/link";
import { getDashboardSummaryAction } from "@/templates/egg-tasta/actions/dashboard";

export default async function BusinessDashboard() {
  const result = await getDashboardSummaryAction();
  const summary = result.success && result.data ? result.data : {
    today: { sales: 0, salesCount: 0, purchase: 0, purchaseCount: 0, collection: 0, payment: 0, expense: 0 },
    counts: { customers: 0, suppliers: 0, products: 0, lowStock: 0, outOfStock: 0 },
    allTime: { sales: 0, purchase: 0, collection: 0, expense: 0 },
    balances: { cash: 0, bank: 0, mobile: 0, receivable: 0, payable: 0 },
    activities: []
  };

  const { today, counts, allTime, balances, activities } = summary;

  return (
    <ContentContainer>
      <PageHeader 
        title="Dashboard" 
        description="Real-time overview of your business performance."
      />

      {/* Row 1: Today's Summary */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
        <StatCard title="Today's Sales" value={`$${today.sales.toFixed(2)}`} subtitle={`${today.salesCount} invoices`} icon={ShoppingCart} iconColorClass="text-blue-500" />
        <StatCard title="Today's Purchase" value={`$${today.purchase.toFixed(2)}`} subtitle={`${today.purchaseCount} bills`} icon={Archive} iconColorClass="text-indigo-500" />
        <StatCard title="Today's Collection" value={`$${today.collection.toFixed(2)}`} subtitle="From customers" icon={TrendingUp} iconColorClass="text-emerald-500" />
        <StatCard title="Supplier Payment" value={`$${today.payment.toFixed(2)}`} subtitle="To suppliers" icon={TrendingDown} iconColorClass="text-orange-500" />
        <StatCard title="Today's Expense" value={`$${today.expense.toFixed(2)}`} subtitle="Operating costs" icon={CreditCard} iconColorClass="text-rose-500" />
      </div>

      {/* Row 2: Entities & Stock */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
        <StatCard title="Total Customers" value={counts.customers.toString()} subtitle="Registered accounts" icon={Users} />
        <StatCard title="Total Suppliers" value={counts.suppliers.toString()} subtitle="Active vendors" icon={Users} />
        <StatCard title="Total Products" value={counts.products.toString()} subtitle="Inventory items" icon={Package} />
        <StatCard title="Low Stock" value={counts.lowStock.toString()} subtitle="Needs reorder" icon={AlertTriangle} iconColorClass="text-yellow-500" />
        <StatCard title="Out of Stock" value={counts.outOfStock.toString()} subtitle="Empty inventory" icon={AlertTriangle} iconColorClass="text-red-500" />
      </div>

      {/* Row 3: All-Time Financials */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-8">
        <StatCard title="Total Sales" value={`$${allTime.sales.toFixed(2)}`} subtitle="Lifetime revenue" icon={DollarSign} />
        <StatCard title="Total Purchase" value={`$${allTime.purchase.toFixed(2)}`} subtitle="Lifetime cost" icon={Archive} />
        <StatCard title="Total Collection" value={`$${allTime.collection.toFixed(2)}`} subtitle="Total received" icon={TrendingUp} />
        <StatCard title="Total Expenses" value={`$${allTime.expense.toFixed(2)}`} subtitle="Total spent" icon={TrendingDown} />
        <StatCard title="Net Profit" value={`$${(allTime.sales - allTime.purchase - allTime.expense).toFixed(2)}`} subtitle="Future ready" icon={DollarSign} iconColorClass="text-emerald-600" />
      </div>

      <div className="grid gap-6 md:grid-cols-12 mb-8">
        {/* Financial Summary */}
        <div className="md:col-span-4">
          <SummaryCard title="Financial Summary" icon={Wallet} colSpan={1} iconColorClass="text-purple-500">
            <div className="space-y-4 p-2">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Wallet className="h-4 w-4 mr-2 text-emerald-500" /> Cash Balance
                </div>
                <span className="font-bold text-slate-900 dark:text-white">${balances.cash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Building className="h-4 w-4 mr-2 text-blue-500" /> Bank Balance
                </div>
                <span className="font-bold text-slate-900 dark:text-white">${balances.bank.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <Smartphone className="h-4 w-4 mr-2 text-pink-500" /> Mobile Banking
                </div>
                <span className="font-bold text-slate-900 dark:text-white">${balances.mobile.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 mt-4">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <TrendingUp className="h-4 w-4 mr-2 text-emerald-500" /> Total Receivable
                </div>
                <span className="font-bold text-emerald-600">${balances.receivable.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center text-slate-700 dark:text-slate-300">
                  <TrendingDown className="h-4 w-4 mr-2 text-rose-500" /> Total Payable
                </div>
                <span className="font-bold text-rose-600">${balances.payable.toFixed(2)}</span>
              </div>
            </div>
          </SummaryCard>
        </div>

        {/* Charts / Analytics Placeholder */}
        <div className="md:col-span-8">
          <SummaryCard title="Analytics & Trends" icon={TrendingUp} colSpan={1} iconColorClass="text-blue-500">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-2 h-full">
              {[
                "Daily Sales", "Monthly Sales", "Purchase Trend", 
                "Expense Trend", "Collection Trend", "Supplier Payment Trend"
              ].map((chart, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center h-32">
                  <div className="flex items-end gap-1 mb-2 h-12">
                    <div className="w-2 bg-blue-200 dark:bg-blue-900/40 h-4 rounded-t-sm"></div>
                    <div className="w-2 bg-blue-300 dark:bg-blue-800/40 h-8 rounded-t-sm"></div>
                    <div className="w-2 bg-blue-400 dark:bg-blue-700/40 h-6 rounded-t-sm"></div>
                    <div className="w-2 bg-blue-500 h-10 rounded-t-sm"></div>
                    <div className="w-2 bg-blue-600 h-12 rounded-t-sm"></div>
                  </div>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{chart}</span>
                </div>
              ))}
            </div>
          </SummaryCard>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12 mb-8">
        {/* Quick Actions */}
        <div className="md:col-span-12 lg:col-span-8">
          <SummaryCard title="Quick Actions" icon={Zap} colSpan={1} iconColorClass="text-yellow-500">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-2">
              <Link href="/app/sales/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <ShoppingCart className="h-6 w-6 mb-2 text-emerald-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Sale</span>
              </Link>
              <Link href="/app/purchases/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <Archive className="h-6 w-6 mb-2 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">New Purchase</span>
              </Link>
              <Link href="/app/customer-collection/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <TrendingUp className="h-6 w-6 mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Receive Collection</span>
              </Link>
              <Link href="/app/supplier-payments/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <TrendingDown className="h-6 w-6 mb-2 text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Supplier Payment</span>
              </Link>
              <Link href="/app/expenses/add" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <CreditCard className="h-6 w-6 mb-2 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Expense</span>
              </Link>
              <Link href="/app/products/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <Package className="h-6 w-6 mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Product</span>
              </Link>
              <Link href="/app/customers/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <Users className="h-6 w-6 mb-2 text-cyan-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Customer</span>
              </Link>
              <Link href="/app/suppliers/new" className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                <Building className="h-6 w-6 mb-2 text-pink-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Add Supplier</span>
              </Link>
            </div>
          </SummaryCard>
        </div>

        {/* Low Stock & Dues */}
        <div className="md:col-span-12 lg:col-span-4 space-y-6">
          <SummaryCard title="Low Stock Alerts" icon={AlertTriangle} colSpan={1} iconColorClass="text-yellow-500">
            <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-sm">
              {counts.lowStock === 0 && counts.outOfStock === 0 ? (
                <p>No low stock alerts at the moment.</p>
              ) : (
                <div className="text-center">
                  <p className="text-red-500 mb-1">{counts.outOfStock} items out of stock</p>
                  <p className="text-yellow-500">{counts.lowStock} items low on stock</p>
                </div>
              )}
            </div>
          </SummaryCard>

          <SummaryCard title="Recent Dues" icon={CreditCard} colSpan={1} iconColorClass="text-rose-500">
            <div className="flex flex-col items-center justify-center py-6 text-slate-500 text-sm">
              <p>Receivable: ${balances.receivable.toFixed(2)}</p>
              <p>Payable: ${balances.payable.toFixed(2)}</p>
            </div>
          </SummaryCard>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <SummaryCard title="Recent Activities" icon={Clock} colSpan={1} iconColorClass="text-slate-500">
          <div className="flex flex-col justify-center p-4 text-slate-500 text-sm">
            {activities.length === 0 ? (
              <p className="text-center py-6">No recent activities found.</p>
            ) : (
              <ul className="space-y-3">
                {activities.map((act: any) => (
                  <li key={act.id} className="border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{act.action}</span> {act.resource?.replace('_', ' ') || act.category}
                    <div className="text-xs mt-1 text-slate-400">
                      {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SummaryCard>

        <SummaryCard title="System Announcements" icon={Bell} colSpan={1} iconColorClass="text-blue-500">
          <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm">
            <p>No new system updates or notices.</p>
          </div>
        </SummaryCard>
      </div>

    </ContentContainer>
  );
}
