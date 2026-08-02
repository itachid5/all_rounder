"use client";

import React, { useState, useTransition } from "react";
import { AlertTriangle, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBusinessStatsAction, hardDeleteBusinessAction } from "@/platform/actions/deleteBusinessAction";

export function DeleteBusinessClient({ tenantId, tenantName }: { tenantId: string; tenantName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [step, setStep] = useState(0); // 0 = start, 1 = loading stats, 2 = confirmation form, 3 = deleting, 4 = success
  const [stats, setStats] = useState<any>(null);
  const [totalRecords, setTotalRecords] = useState(0);
  const [error, setError] = useState("");
  
  const [inputName, setInputName] = useState("");
  const [inputDelete, setInputDelete] = useState("");
  const [isChecked, setIsChecked] = useState(false);

  const handleStart = async () => {
    setStep(1);
    setError("");
    try {
      const res = await getBusinessStatsAction(tenantId);
      if (res.success) {
        setStats(res.stats);
        setTotalRecords(res.totalRecords || 0);
        setStep(2);
      } else {
        setError(res.error || "Failed to load business stats");
        setStep(0);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setStep(0);
    }
  };

  const isFormValid = 
    inputName === tenantName && 
    inputDelete === "DELETE" && 
    isChecked;

  const handleDelete = async () => {
    if (!isFormValid) return;
    setStep(3);
    setError("");
    
    try {
      const res = await hardDeleteBusinessAction(tenantId);
      if (res.success) {
        setStep(4);
        setTimeout(() => {
          startTransition(() => {
            router.push("/platform/tenants");
            router.refresh();
          });
        }, 2000);
      } else {
        setError(res.error || "Failed to delete business");
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setStep(2);
    }
  };

  if (step === 3 || step === 4) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-card p-8 rounded-2xl border shadow-xl flex flex-col items-center space-y-6">
          {step === 3 ? (
            <>
              <Loader2 className="h-16 w-16 text-red-600 animate-spin" />
              <h2 className="text-2xl font-bold text-foreground">Deleting Business...</h2>
              <p className="text-muted-foreground">Please do not close this tab. This action is permanent and deleting thousands of records may take a few moments.</p>
            </>
          ) : (
            <>
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Business permanently deleted successfully.</h2>
              <p className="text-muted-foreground">Redirecting back to business list...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10 rounded-2xl overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-red-200 dark:border-red-900/50 bg-red-100/50 dark:bg-red-900/20">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
          <h2 className="text-xl font-bold text-red-900 dark:text-red-400">Danger Zone</h2>
        </div>
        <p className="text-sm text-red-700 dark:text-red-400/80 mt-2">
          Permanently delete this business and all of its data. This action is permanent and cannot be undone.
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {step === 0 && (
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Business
          </button>
        )}

        {step === 1 && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-medium">Calculating data to be deleted...</span>
          </div>
        )}

        {step === 2 && stats && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
            <div className="p-4 bg-white dark:bg-slate-900 border rounded-xl shadow-sm">
              <h3 className="font-semibold mb-4 text-foreground">Data to be permanently destroyed ({totalRecords} records total):</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{stats.products}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Products</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{stats.sales}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Sales</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{stats.customers}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Customers</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border text-center">
                  <div className="text-2xl font-bold">{stats.employees}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Employees</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">Plus all purchases, expenses, collections, inventory logs, roles, and settings.</p>
            </div>

            <div className="space-y-4 max-w-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Type the business name exactly as <strong className="select-none">{tenantName}</strong>
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder={tenantName}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  type="text"
                  value={inputDelete}
                  onChange={(e) => setInputDelete(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="understand"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="mt-1 rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <label htmlFor="understand" className="text-sm text-muted-foreground">
                  I understand that this action is permanent and cannot be undone.
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="px-4 py-2 border bg-background hover:bg-muted text-foreground font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!isFormValid}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-md shadow-sm transition-colors flex items-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
