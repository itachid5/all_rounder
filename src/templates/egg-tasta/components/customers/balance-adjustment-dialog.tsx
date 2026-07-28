"use client";

import React, { useState, useTransition } from "react";
import { adjustCustomerBalanceAction } from "@/app/actions/customers";
import { AlertCircle } from "lucide-react";
import { TextField, SelectField, Textarea, Button } from "@/templates/egg-tasta/components";

export function BalanceAdjustmentDialog({ customer, onClose, onSuccess }: { customer: any, onClose: () => void, onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("customerCode", customer.customerCode);
    
    // Additional validation prompt
    if (!confirm("You are about to change this customer's current outstanding balance. Historical transactions will remain unchanged. Continue?")) {
      return;
    }

    startTransition(async () => {
      const res = await adjustCustomerBalanceAction(formData);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Failed to adjust balance.");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-md w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Balance Adjustment</h2>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Customer Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">Current Outstanding Balance</p>
              <p className="font-medium text-lg">${Number(customer.previousDue).toFixed(2)}</p>
            </div>

            <TextField 
              label="New Outstanding Balance" 
              name="newBalance" 
              type="number" 
              step="0.01" 
              defaultValue={customer.previousDue} 
              required 
            />
            
            <SelectField 
              label="Reason" 
              name="reason" 
              required
              options={[
                { value: "", label: "Select Reason..." },
                { value: "Opening Balance Correction", label: "Opening Balance Correction" },
                { value: "Data Migration", label: "Data Migration" },
                { value: "Accounting Adjustment", label: "Accounting Adjustment" },
                { value: "Manual Correction", label: "Manual Correction" },
                { value: "Other", label: "Other" },
              ]}
            />
          </div>
          <Textarea label="Notes (Optional)" name="notes" rows={2} />
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white">
              {isPending ? "Saving..." : "Save Adjustment"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
