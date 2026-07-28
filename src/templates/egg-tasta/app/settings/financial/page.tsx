"use client";

import React from "react";
import { DollarSign } from "lucide-react";
import GenericSettingsPage from "@/templates/egg-tasta/components/settings/generic-settings-page";
import { FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function FinancialSettingsPage() {
  return (
    <GenericSettingsPage title="Financial Settings" description="Configure currency, accounting formats, and fiscal periods." icon={DollarSign}>
      <FormGrid>
        <SelectField 
          label="Base Currency" 
          name="currency" 
          options={[
            { value: "BDT", label: "Bangladeshi Taka (BDT)" },
            { value: "USD", label: "US Dollar (USD)" },
            { value: "EUR", label: "Euro (EUR)" },
          ]}
        />
        <SelectField 
          label="Currency Symbol" 
          name="currencySymbol" 
          options={[
            { value: "৳", label: "৳ (Taka)" },
            { value: "$", label: "$ (Dollar)" },
            { value: "€", label: "€ (Euro)" },
          ]}
        />
        <SelectField 
          label="Decimal Places" 
          name="decimals" 
          options={[
            { value: "0", label: "0 (e.g. 100)" },
            { value: "2", label: "2 (e.g. 100.00)" },
          ]}
          defaultValue="2"
        />
        <SelectField 
          label="Default Payment Method" 
          name="defaultPayment" 
          options={[
            { value: "cash", label: "Cash" },
            { value: "bank", label: "Bank" },
            { value: "mobile", label: "Mobile Banking" },
          ]}
        />
        <SelectField 
          label="Fiscal Year Start Month" 
          name="fiscalYear" 
          options={[
            { value: "jan", label: "January (Jan - Dec)" },
            { value: "jul", label: "July (Jul - Jun)" },
          ]}
        />
        <SelectField 
          label="Opening Financial Year" 
          name="openingYear" 
          options={[
            { value: "2024", label: "2024" },
            { value: "2023", label: "2023" },
          ]}
        />
      </FormGrid>
    </GenericSettingsPage>
  );
}
