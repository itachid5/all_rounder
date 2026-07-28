"use client";

import React from "react";
import { Bell } from "lucide-react";
import GenericSettingsPage from "@/templates/egg-tasta/components/settings/generic-settings-page";
import { FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function NotificationSettingsPage() {
  return (
    <GenericSettingsPage title="Notification Settings" description="Manage alerts for stock, dues, and summaries." icon={Bell}>
      <FormGrid>
        <SelectField 
          label="Low Stock Alert" 
          name="lowStock" 
          options={[
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <SelectField 
          label="Due Reminder" 
          name="dueReminder" 
          options={[
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <SelectField 
          label="Daily Summary" 
          name="dailySummary" 
          options={[
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        <SelectField 
          label="Monthly Summary" 
          name="monthlySummary" 
          options={[
            { value: "enabled", label: "Enabled" },
            { value: "disabled", label: "Disabled" },
          ]}
        />
        
        <div className="col-span-full mt-4">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Future Channels</h3>
        </div>

        <SelectField 
          label="SMS Notifications" 
          name="sms" 
          options={[{ value: "coming_soon", label: "Coming Soon" }]}
          disabled
        />
        <SelectField 
          label="Email Notifications" 
          name="email" 
          options={[{ value: "coming_soon", label: "Coming Soon" }]}
          disabled
        />
        <SelectField 
          label="WhatsApp Notifications" 
          name="whatsapp" 
          options={[{ value: "coming_soon", label: "Coming Soon" }]}
          disabled
        />
      </FormGrid>
    </GenericSettingsPage>
  );
}
