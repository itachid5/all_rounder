"use client";

import React, { useState } from "react";
import { Receipt, XCircle, Printer } from "lucide-react";
import Link from "next/link";
import { FormSection, FormGrid, TextField, SelectField, Textarea, Button } from "@/templates/egg-tasta/components";
import { createExpenseAction } from "@/templates/egg-tasta/actions/expenses";
import { useRouter } from "next/navigation";

export function AddExpenseClient({ categories, accounts }: { categories: any[], accounts: any[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      expenseDate: formData.get("expenseDate"),
      categoryId: formData.get("categoryId"),
      amount: parseFloat(formData.get("amount") as string),
      paymentMethod: formData.get("paymentMethod"),
      accountId: formData.get("accountId"),
      referenceNo: formData.get("referenceNo"),
      paidTo: formData.get("paidTo"),
      notes: formData.get("notes")
    };

    const result = await createExpenseAction(data);
    setLoading(false);
    
    if (result.success) {
      router.push("/app/expenses/manage");
    } else {
      alert("Error: " + result.error);
    }
  };

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <FormSection title="Expense Details" description="Core information about the expense." icon={Receipt}>
        <FormGrid>
          <TextField 
            label="Expense No" 
            name="expenseNo" 
            placeholder="Auto Generated" 
            disabled 
          />
          <TextField 
            label="Expense Date" 
            name="expenseDate" 
            type="date"
            defaultValue={new Date().toISOString().split('T')[0]}
            required 
          />
          <SelectField 
            label="Expense Category" 
            name="categoryId" 
            required
            options={categories.map(c => ({ value: c.id, label: c.name }))}
          />
          <TextField 
            label="Amount" 
            name="amount" 
            type="number"
            step="0.01"
            placeholder="e.g. 150.00"
            required 
          />
          <SelectField 
            label="Payment Method" 
            name="paymentMethod" 
            required
            options={[
              { value: "CASH", label: "Cash" },
              { value: "BANK", label: "Bank" },
              { value: "MOBILE_BANKING", label: "Mobile Banking" },
            ]}
          />
          <SelectField 
            label="Account" 
            name="accountId" 
            options={accounts.map(a => ({ value: a.id, label: a.name }))}
          />
          <TextField 
            label="Reference No (Optional)" 
            name="referenceNo" 
            placeholder="e.g. Bill/Invoice Number"
          />
          <TextField 
            label="Vendor / Paid To (Optional)" 
            name="paidTo" 
            placeholder="Name of person or company"
          />
        </FormGrid>
        
        <div className="mt-6">
          <Textarea 
            label="Notes (Optional)" 
            name="notes" 
            placeholder="Any additional details..." 
            rows={3} 
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button variant="ghost" type="reset">
          Reset
        </Button>
        <Link href="/app/expenses/manage">
          <Button variant="outline" type="button">
            Cancel
          </Button>
        </Link>
        <Button variant="outline" type="reset">
          Save & New
        </Button>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Expense"}
        </Button>
      </div>
    </form>
  );
}
