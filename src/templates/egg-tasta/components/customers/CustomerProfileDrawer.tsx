"use client";

import React, { useEffect, useState } from "react";
import { X, User, Phone, Mail, MapPin, Calendar, CreditCard, Activity, Clock, Download, ArrowRight, Printer, AlertCircle } from "lucide-react";
import { getCustomerProfileAction } from "@/templates/egg-tasta/actions/customers";
import { StatusBadge, Button } from "@/templates/egg-tasta/components";
import { formatDate, daysSince } from "@/shared/utils/date";
import { useCurrency } from "@/shared/components/regional-context";

export function CustomerProfileDrawer({ 
  customerCode, 
  onClose,
  onEdit,
  onAdjustBalance
}: { 
  customerCode: string, 
  onClose: () => void,
  onEdit: (customer: any) => void,
  onAdjustBalance: (customer: any) => void
}) {
  const { symbol } = useCurrency();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const res = await getCustomerProfileAction(customerCode);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error || "Failed to load");
      }
      setLoading(false);
    }
    load();
  }, [customerCode]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
        <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl p-6">
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full mb-4 hover:bg-slate-200">
            <X className="h-5 w-5" />
          </button>
          <div className="text-red-500">{error || "Failed to load customer data"}</div>
        </div>
      </div>
    );
  }

  const { customer, stats, recentTransactions, timeline } = data;
  
  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    return formatDate(date);
  };

  const daysSince = (date: any) => {
    if (!date) return 'N/A';
    const diff = new Date().getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 3600 * 24));
  };

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex justify-end transition-opacity">
      <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-950 h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* HEADER */}
        <div className="flex-shrink-0 px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {customer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  {customer.name}
                  <StatusBadge status={customer.status} />
                </h2>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mt-1">
                  <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                    {customer.customerCode}
                  </span>
                  {customer.mobile && (
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.mobile}</span>
                  )}
                  {customer.email && (
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose} className="rounded-full h-10 w-10 p-0 flex items-center justify-center">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="h-16 w-16" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Current Due Balance</p>
              <p className={`text-2xl font-bold ${customer.previousDue > 0 ? 'text-rose-600 dark:text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                {symbol}{customer.previousDue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Lifetime Purchases</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{symbol}{stats.totalPurchases.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Lifetime Paid</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{symbol}{stats.totalPaid.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Total Purchases</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.purchaseCount}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact & Info */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <User className="h-4 w-4 text-indigo-500" />
                Contact Information
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white font-medium">{customer.mobile || "No Mobile"}</p>
                    <p className="text-xs text-slate-500">Primary Mobile</p>
                  </div>
                </div>
                {customer.whatsappNumber && (
                  <div className="flex items-start gap-4">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg text-emerald-600 dark:text-emerald-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-900 dark:text-white font-medium">{customer.whatsappNumber}</p>
                      <p className="text-xs text-slate-500">WhatsApp</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">{customer.address || "No Address Provided"}</p>
                    <p className="text-xs text-slate-500">Address</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg text-purple-600 dark:text-purple-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 dark:text-white">{formatDate(customer.createdAt)}</p>
                    <p className="text-xs text-slate-500">Customer Since</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Insights */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Activity className="h-4 w-4 text-emerald-500" />
                Business Insights
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-sm font-medium text-slate-500">Avg. Purchase Value</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {symbol}{stats.purchaseCount > 0 ? (stats.totalPurchases / stats.purchaseCount).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-sm font-medium text-slate-500">Cash vs Credit Purchases</span>
                  <div className="flex gap-2">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-semibold">{stats.cashPurchases} Cash</span>
                    <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-xs font-semibold">{stats.creditPurchases} Credit</span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
                  <span className="text-sm font-medium text-slate-500">Last Purchase</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatDate(stats.lastPurchaseDate)}</p>
                    <p className="text-xs text-slate-400">{stats.lastPurchaseDate ? `${daysSince(stats.lastPurchaseDate)} days ago` : 'Never'}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium text-slate-500">Last Collection</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white">{formatDate(stats.lastCollectionDate)}</p>
                    <p className="text-xs text-slate-400">{stats.lastCollectionDate ? `${daysSince(stats.lastCollectionDate)} days ago` : 'Never'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-semibold flex items-center justify-between text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  Recent Ledger Transactions
                </div>
                <Button variant="ghost" className="text-xs h-8">View All <ArrowRight className="h-3 w-3 ml-1" /></Button>
              </div>
              <div className="flex-1">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/20">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 font-medium">Type</th>
                      <th className="px-5 py-3 font-medium">Description</th>
                      <th className="px-5 py-3 font-medium text-right">Debit (+)</th>
                      <th className="px-5 py-3 font-medium text-right">Credit (-)</th>
                      <th className="px-5 py-3 font-medium text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {recentTransactions.length === 0 && (
                      <tr><td colSpan={6} className="px-5 py-8 text-center text-slate-500">No recent transactions</td></tr>
                    )}
                    {recentTransactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap text-slate-600 dark:text-slate-400">{formatDate(tx.date)}</td>
                        <td className="px-5 py-3 font-medium">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            tx.type === 'SALE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                            tx.type === 'PAYMENT_RECEIVED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 max-w-[150px] truncate text-slate-700 dark:text-slate-300" title={tx.description || tx.referenceNo}>
                          {tx.description || tx.referenceNo || '-'}
                        </td>
                        <td className="px-5 py-3 text-right text-rose-600 font-medium">
                          {tx.debit > 0 ? `${symbol}${tx.debit.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-5 py-3 text-right text-emerald-600 font-medium">
                          {tx.credit > 0 ? `${symbol}${tx.credit.toFixed(2)}` : '-'}
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">
                          {symbol}{tx.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <Clock className="h-4 w-4 text-orange-500" />
                Activity Timeline
              </div>
              <div className="p-6 flex-1 overflow-y-auto max-h-[400px]">
                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                  {timeline.length === 0 && <p className="text-sm text-slate-500 pl-4">No activity recorded yet.</p>}
                  {timeline.map((log: any) => (
                    <div key={log.id} className="relative pl-6">
                      <div className="absolute w-4 h-4 bg-white dark:bg-slate-900 border-2 border-orange-400 rounded-full -left-[9px] top-0.5"></div>
                      <div className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wider">{formatDate(log.createdAt)}</div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{log.action.replace('_', ' ')}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Notes Section */}
          {customer.notes && (
            <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 p-6 shadow-sm">
              <div className="flex gap-2 items-center text-amber-800 dark:text-amber-500 font-bold mb-3">
                <AlertCircle className="h-5 w-5" /> Internal Notes
              </div>
              <p className="text-sm text-amber-900/80 dark:text-amber-200/80 whitespace-pre-wrap leading-relaxed">{customer.notes}</p>
            </div>
          )}

        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex-shrink-0 p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 items-center justify-between z-10">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none border-slate-200" onClick={() => onEdit(customer)}>
              <User className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none border-slate-200" onClick={() => onAdjustBalance(customer)}>
              Adjust Balance
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none border-slate-200" title="Print Statement">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button variant="primary" className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 shadow-lg">
              Receive Payment
            </Button>
            <Button variant="primary" className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 shadow-lg">
              Create Sale
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
