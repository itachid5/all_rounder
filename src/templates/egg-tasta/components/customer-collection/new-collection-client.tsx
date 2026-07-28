"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormSection, FormGrid, Button } from "@/templates/egg-tasta/components";
import { createCustomerCollectionAction } from "@/templates/egg-tasta/actions/customerCollections";

export function NewCollectionClient({ customers }: { customers: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [referenceNo, setReferenceNo] = useState("");
  const [notes, setNotes] = useState("");

  const selectedCustomer = customers.find(c => c.id === customerId);
  const currentDue = selectedCustomer ? selectedCustomer.previousDue : 0;

  const handleSave = (stay: boolean) => {
    setError(null);
    setSuccess(null);

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }
    if (amount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    startTransition(async () => {
      const data = {
        customerId,
        date,
        amount,
        paymentMethod,
        referenceNo,
        notes
      };

      const res = await createCustomerCollectionAction(data);
      if (res.success && res.collection) {
        setSuccess(`Collection ${res.collection.collectionNo} recorded successfully!`);
        if (stay) {
          setCustomerId("");
          setAmount(0);
          setReferenceNo("");
          setNotes("");
          window.scrollTo(0, 0);
        } else {
          setTimeout(() => {
            router.push('/app/customer-collection/manage');
          }, 1000);
        }
      } else {
        setError(res.error || "Failed to record collection.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-4 rounded-md flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 mt-0.5" />
          <p>{success}</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <FormSection title="Receipt Details" description="Core information about the collection received." icon={CreditCard}>
          <FormGrid>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Receipt No</label>
              <input type="text" disabled placeholder="Auto Generated" className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 w-full" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.customerCode})</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Current Due (Read Only)</label>
              <input type="text" disabled value={`$${currentDue.toFixed(2)}`} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 w-full font-medium" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Received Amount *</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} placeholder="e.g. 500.00" className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Payment Method *</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full">
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Transfer</option>
                <option value="MOBILE_BANKING">Mobile Banking</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Reference No (Optional)</label>
              <input type="text" value={referenceNo} onChange={e => setReferenceNo(e.target.value)} placeholder="e.g. TRC-0001, Check No." className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>
          </FormGrid>
          
          <div className="mt-6 flex flex-col">
            <label className="text-xs font-medium text-slate-500 mb-1">Notes (Optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Collection description or notes..." className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
          </div>
        </FormSection>

        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="ghost" type="button" onClick={() => router.push('/app/customer-collection/manage')} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="outline" type="button" onClick={() => handleSave(true)} disabled={isPending}>
            {isPending ? "Saving..." : "Save & New"}
          </Button>
          <Button variant="primary" type="button" onClick={() => handleSave(false)} disabled={isPending}>
            {isPending ? "Saving..." : "Save Collection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
