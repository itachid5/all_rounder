"use client";

import React from "react";
import { Monitor } from "lucide-react";
import GenericSettingsPage from "@/components/business/settings/generic-settings-page";
import { FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function SystemPreferencesPage() {
  return (
    <GenericSettingsPage title="System Preferences" description="Configure localization and visual options." icon={Monitor}>
      <FormGrid>
        <SelectField 
          label="Time Zone" 
          name="timezone" 
          options={[
            { value: "Asia/Dhaka", label: "Asia/Dhaka (GMT+6)" },
            { value: "UTC", label: "UTC (GMT+0)" },
          ]}
        />
        <SelectField 
          label="Date Format" 
          name="dateFormat" 
          options={[
            { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2024)" },
            { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2024)" },
            { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2024-12-31)" },
          ]}
        />
        <SelectField 
          label="Time Format" 
          name="timeFormat" 
          options={[
            { value: "12h", label: "12 Hour (01:30 PM)" },
            { value: "24h", label: "24 Hour (13:30)" },
          ]}
        />
        <SelectField 
          label="Language" 
          name="language" 
          options={[
            { value: "en", label: "English" },
            { value: "bn", label: "Bengali (বাংলা)" },
          ]}
        />
        <SelectField 
          label="UI Theme" 
          name="theme" 
          options={[
            { value: "system", label: "System Default" },
            { value: "light", label: "Light Mode" },
            { value: "dark", label: "Dark Mode" },
          ]}
        />
      </FormGrid>
    </GenericSettingsPage>
  );
}
