"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormSection, FormGrid, TextField, SelectField, Textarea, Button } from "@/templates/egg-shop/components";
import { CreditCard } from "lucide-react";
import { createSupplierPaymentAction } from "@/templates/egg-tasta/actions/supplierPayments";

export default function NewPaymentClient({ suppliers, accounts }: { suppliers: any[], accounts: any[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [error, setError] = useState<string | null>(null);

  const supplierObj = suppliers.find(s => s.id === selectedSupplier);
  const due = supplierObj ? supplierObj.previousDue : 0;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get("paymentDate"),
      supplierId: formData.get("supplierId"),
      accountId: formData.get("accountId"),
      amount: parseFloat(formData.get("amount") as string) || 0,
      paymentMethod: formData.get("paymentMethod"),
      referenceNo: formData.get("referenceNo"),
      notes: formData.get("notes"),
    };

    const res = await createSupplierPaymentAction(data);
    if (res.success) {
      router.push("/app/supplier-payments/manage");
    } else {
      setError(res.error || "Failed to record payment.");
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      {error && <div className="p-4 bg-red-50 text-red-600 rounded-md">{error}</div>}
      <FormSection title="Payment Details" description="Core information about the payment." icon={CreditCard}>
        <FormGrid>
          <TextField 
            label="Payment No" 
            name="paymentNo" 
            placeholder="Auto Generated" 
            disabled 
          />
          <TextField 
            label="Payment Date" 
            name="paymentDate" 
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required 
          />
          <SelectField 
            label="Supplier" 
            name="supplierId" 
            required
            options={suppliers.map(s => ({ value: s.id, label: s.name }))}
            value={selectedSupplier}
            onChange={(e: any) => setSelectedSupplier(e.target.value)}
          />
          <TextField 
            label="Current Due (Read Only)" 
            name="currentDue" 
            type="text"
            value={`$${due.toFixed(2)}`}
            disabled 
          />
          <TextField 
            label="Payment Amount" 
            name="amount" 
            type="number"
            step="0.01"
            placeholder="e.g. 500.00"
            required 
          />
          <SelectField 
            label="Payment Method" 
            name="paymentMethod" 
            required
            options={[
              { value: "CASH", label: "Cash" },
              { value: "BANK_TRANSFER", label: "Bank Transfer" },
              { value: "MOBILE_BANKING", label: "Mobile Banking" },
            ]}
          />
          <SelectField 
            label="Account" 
            name="accountId" 
            options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
          />
          <TextField 
            label="Reference No (Optional)" 
            name="referenceNo" 
            placeholder="e.g. TRC-0001, Check No."
          />
        </FormGrid>
        
        <div className="mt-6">
          <Textarea 
            label="Notes (Optional)" 
            name="notes" 
            placeholder="Payment description or notes..." 
            rows={3} 
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button variant="ghost" type="reset" disabled={isSubmitting}>
          Reset
        </Button>
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Payment"}
        </Button>
      </div>
    </form>
  );
}
