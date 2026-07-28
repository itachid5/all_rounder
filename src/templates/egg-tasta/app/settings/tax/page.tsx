"use client";

import React from "react";
import { Percent } from "lucide-react";
import GenericSettingsPage from "@/templates/egg-tasta/components/settings/generic-settings-page";
import { FormGrid, TextField, SelectField } from "@/templates/egg-shop/components";

export default function TaxSettingsPage() {
  return (
    <GenericSettingsPage title="Tax Settings" description="Configure VAT, tax, and service charges." icon={Percent}>
      <FormGrid>
        <SelectField 
          label="Enable VAT" 
          name="enableVat" 
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          defaultValue="no"
        />
        <TextField label="Default VAT Percentage (%)" name="vatPercent" type="number" defaultValue="0" />

        <SelectField 
          label="Enable Tax" 
          name="enableTax" 
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          defaultValue="no"
        />
        <TextField label="Default Tax Percentage (%)" name="taxPercent" type="number" defaultValue="0" />

        <SelectField 
          label="Enable Service Charge" 
          name="enableServiceCharge" 
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          defaultValue="no"
        />
        <TextField label="Service Charge Percentage (%)" name="scPercent" type="number" defaultValue="0" />
      </FormGrid>
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-md text-sm">
        <strong>Note:</strong> Tax calculations are currently disabled platform-wide. These settings prepare your business for future compliance updates.
      </div>
    </GenericSettingsPage>
  );
}
