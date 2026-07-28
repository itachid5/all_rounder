"use client";

import React, { useState, useTransition } from "react";
import { createCustomerAction } from "@/app/actions/customers";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, UserCircle } from "lucide-react";
import { FormSection, FormGrid, TextField, SelectField, Textarea, Button } from "@/templates/egg-tasta/components";

export function AddCustomerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name')?.toString();

    if (!name) {
      setError("Customer Name is required.");
      return;
    }

    startTransition(async () => {
      const res = await createCustomerAction(formData);
      if (res.success && res.customer) {
        setSuccess(`Customer ${res.customer.customerCode} created successfully!`);
        // @ts-ignore
        e.target.reset(); // Clear form
      } else {
        setError(res.error || "Failed to create customer.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      <FormSection title="Customer Information" description="Basic details about the customer." icon={UserCircle}>
        <FormGrid>
          <TextField 
            label="Customer Name" 
            name="name" 
            placeholder="e.g. John Doe" 
            required 
          />
          <TextField 
            label="Mobile Number (Optional)" 
            name="mobile" 
            placeholder="e.g. 01700000000" 
          />
          <TextField 
            label="Alternative Mobile (Optional)" 
            name="alternativeMobile" 
            placeholder="e.g. 01800000000" 
          />
          <TextField 
            label="WhatsApp Number (Optional)" 
            name="whatsappNumber" 
            placeholder="e.g. 01700000000" 
          />
          <TextField 
            label="Email (Optional)" 
            name="email" 
            type="email"
            placeholder="customer@example.com" 
          />
        </FormGrid>
      </FormSection>

      <FormSection title="Financial & Additional">
        <FormGrid>
          <TextField 
            label="Previous Due (Optional)" 
            name="previousDue" 
            type="number" 
            step="0.01" 
            defaultValue="0"
          />
          <SelectField 
            label="Status" 
            name="status" 
            defaultValue="ACTIVE"
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </FormGrid>
        <div className="mt-6 space-y-6">
          <Textarea 
            label="Address (Optional)" 
            name="address" 
            placeholder="Full address" 
            rows={2} 
          />
          <Textarea 
            label="Notes (Optional)" 
            name="notes" 
            placeholder="Any additional information..." 
            rows={2} 
          />
        </div>
      </FormSection>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
        <Button variant="ghost" type="button" onClick={() => router.push('/app/customers/manage')} disabled={isPending}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Customer"}
        </Button>
      </div>
    </form>
  );
}
