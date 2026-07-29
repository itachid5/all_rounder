"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { FormSection, FormGrid, Button, Combobox } from "@/templates/egg-tasta/components";
import { updateCustomerCollectionAction } from "@/templates/egg-tasta/actions/customerCollections";

export function EditCollectionClient({ customers, initialCollection }: { customers: any[], initialCollection: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [date, setDate] = useState(initialCollection.date ? new Date(initialCollection.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [customerId, setCustomerId] = useState(initialCollection.customerId || "");
  const [amount, setAmount] = useState(initialCollection.amount || 0);
  const [paymentMethod, setPaymentMethod] = useState(initialCollection.paymentMethod || "CASH");
  const [referenceNo, setReferenceNo] = useState(initialCollection.referenceNo || "");
  const [notes, setNotes] = useState(initialCollection.notes || "");

  const selectedCustomer = customers.find(c => c.id === customerId);
  const currentDue = selectedCustomer ? selectedCustomer.previousDue : 0;

  // Since we are editing, the amount being edited was ALREADY subtracted from current due.
  // The actual max allowed due should include the old amount.
  const oldAmount = initialCollection.amount || 0;
  const maxAllowedDue = currentDue + oldAmount;

  const handleSave = () => {
    setError(null);
    setSuccess(null);
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!customerId) errors.customerId = "Customer is required.";
    if (amount <= 0) errors.amount = "Amount must be greater than 0.";
    if (amount > maxAllowedDue) errors.amount = "Amount cannot exceed current due.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
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

      const res = await updateCustomerCollectionAction(initialCollection.id, data);
      if (res.success) {
        setSuccess(`Collection updated successfully.`);
        window.scrollTo(0, 0);
        // Do NOT redirect automatically as per UX rules
      } else {
        setError(res.error || "Something went wrong. Please try again.");
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
        <FormSection title="Edit Receipt" description="Modify the collection information. Ledger and cashbook balances will be automatically adjusted." icon={CreditCard}>
          <FormGrid>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Receipt No</label>
              <input type="text" disabled value={initialCollection.collectionNo} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 w-full" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Date *</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Customer *</label>
              <Combobox 
                options={customers.map(c => ({ value: c.id, label: `${c.name} (${c.customerCode})` }))}
                value={customerId}
                onChange={(val) => setCustomerId(val)}
                placeholder="Select Customer"
                error={!!formErrors.customerId}
              />
              {formErrors.customerId && <span className="text-red-500 text-xs mt-1">{formErrors.customerId}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Max Available Due</label>
              <input type="text" disabled value={`$${maxAllowedDue.toFixed(2)}`} className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-500 w-full font-medium" />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Received Amount *</label>
              <input type="number" step="0.01" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} placeholder="e.g. 500.00" className={`px-3 py-2 bg-white dark:bg-slate-950 border ${formErrors.amount ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full`} />
              {formErrors.amount && <span className="text-red-500 text-xs mt-1">{formErrors.amount}</span>}
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium text-slate-500 mb-1">Payment Method *</label>
              <Combobox 
                options={[
                  { value: "CASH", label: "Cash" },
                  { value: "BANK", label: "Bank Transfer" },
                  { value: "MOBILE_BANKING", label: "Mobile Banking" }
                ]}
                value={paymentMethod}
                onChange={(val) => setPaymentMethod(val)}
              />
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
          <Button variant="primary" type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Updating..." : "Update Collection"}
          </Button>
        </div>
      </div>
    </div>
  );
}
