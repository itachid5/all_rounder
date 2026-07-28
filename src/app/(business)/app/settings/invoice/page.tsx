"use client";

import React from "react";
import { FileText } from "lucide-react";
import GenericSettingsPage from "@/components/business/settings/generic-settings-page";
import { FormGrid, TextField, SelectField, Textarea } from "@/templates/egg-shop/components";

export default function InvoiceSettingsPage() {
  return (
    <GenericSettingsPage title="Invoice Settings" description="Customize how your invoices look and print." icon={FileText}>
      <FormGrid>
        <TextField label="Invoice Prefix" name="invoicePrefix" defaultValue="INV-" required />
        <SelectField 
          label="Invoice Number Format" 
          name="invoiceFormat" 
          options={[
            { value: "sequential", label: "Sequential (0001, 0002)" },
            { value: "date_sequential", label: "Date + Sequential (202403-001)" },
          ]}
        />
        <SelectField 
          label="Paper Size" 
          name="paperSize" 
          options={[
            { value: "a4", label: "A4 Size" },
            { value: "pos_80mm", label: "POS Receipt (80mm)" },
            { value: "pos_58mm", label: "POS Receipt (58mm)" },
          ]}
        />
        <SelectField 
          label="Logo Position" 
          name="logoPosition" 
          options={[
            { value: "left", label: "Left Aligned" },
            { value: "center", label: "Center Aligned" },
            { value: "right", label: "Right Aligned" },
          ]}
        />
        <div className="col-span-full">
          <Textarea label="Terms & Conditions" name="terms" defaultValue="Goods once sold cannot be returned without receipt." rows={2} />
        </div>
        <div className="col-span-full">
          <Textarea label="Invoice Footer" name="footer" defaultValue="Thank you for your business!" rows={2} />
        </div>
        <div className="col-span-full">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Digital Signature (Optional)</label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full sm:w-1/2">
            <span className="text-sm">Upload signature image (PNG)</span>
          </div>
        </div>
      </FormGrid>
    </GenericSettingsPage>
  );
}
