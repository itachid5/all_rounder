"use client";

import React, { useState, useTransition, useEffect } from "react";
import { updateCustomerAction } from "@/app/actions/customers";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { TextField, SelectField, Textarea, Button } from "@/templates/egg-tasta/components";

export function EditCustomerDialog({ customer, onClose, onSuccess }: { customer: any, onClose: () => void, onSuccess: () => void }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("customerCode", customer.customerCode);
    
    startTransition(async () => {
      const res = await updateCustomerAction(formData);
      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || "Failed to update customer.");
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Customer Name" name="name" defaultValue={customer.name} required />
            <TextField label="Mobile Number" name="mobile" defaultValue={customer.mobile} />
            <TextField label="Alternative Mobile" name="alternativeMobile" defaultValue={customer.alternativeMobile} />
            <TextField label="WhatsApp Number" name="whatsappNumber" defaultValue={customer.whatsappNumber} />
            <TextField label="Email" name="email" type="email" defaultValue={customer.email} />
            <TextField label="Previous Due" name="previousDue" type="number" step="0.01" defaultValue={customer.previousDue} />
            <SelectField 
              label="Status" 
              name="status" 
              defaultValue={customer.status}
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "INACTIVE", label: "Inactive" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
          </div>
          <Textarea label="Address" name="address" defaultValue={customer.address} rows={2} />
          <Textarea label="Notes" name="notes" defaultValue={customer.notes} rows={2} />
          
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
