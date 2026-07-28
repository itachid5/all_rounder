"use client";

import React from "react";
import { MapPin } from "lucide-react";
import GenericSettingsPage from "@/templates/egg-tasta/components/settings/generic-settings-page";
import { FormGrid, TextField, Textarea } from "@/templates/egg-shop/components";

export default function CompanyInformationPage() {
  return (
    <GenericSettingsPage title="Company Information" description="Set your physical address and company branding assets." icon={MapPin}>
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Company Logo</label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <span className="text-sm">Click to upload logo (PNG/JPG)</span>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 block">Favicon</label>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <span className="text-sm">Click to upload favicon (ICO/PNG)</span>
          </div>
        </div>
      </div>
      
      <FormGrid>
        <div className="col-span-full">
          <Textarea label="Address" name="address" defaultValue="123 Market Street" rows={2} required />
        </div>
        <TextField label="City" name="city" defaultValue="Dhaka" required />
        <TextField label="District" name="district" defaultValue="Dhaka" required />
        <TextField label="Country" name="country" defaultValue="Bangladesh" required />
        <TextField label="Postal Code" name="postalCode" defaultValue="1200" required />
      </FormGrid>
    </GenericSettingsPage>
  );
}
