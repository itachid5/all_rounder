"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import GenericSettingsPage from "@/components/business/settings/generic-settings-page";
import { FormGrid, SelectField } from "@/templates/egg-shop/components";

export default function AuditSettingsPage() {
  return (
    <GenericSettingsPage title="Audit Settings" description="Configure security policies and data retention rules." icon={ShieldCheck}>
      <FormGrid>
        <SelectField 
          label="Activity Log Retention" 
          name="activityRetention" 
          options={[
            { value: "30", label: "30 Days" },
            { value: "90", label: "90 Days" },
            { value: "365", label: "1 Year" },
            { value: "infinite", label: "Keep Forever" },
          ]}
          defaultValue="90"
        />
        <SelectField 
          label="Login History Retention" 
          name="loginRetention" 
          options={[
            { value: "30", label: "30 Days" },
            { value: "90", label: "90 Days" },
            { value: "365", label: "1 Year" },
            { value: "infinite", label: "Keep Forever" },
          ]}
          defaultValue="30"
        />
        <SelectField 
          label="Session Timeout (Inactivity)" 
          name="sessionTimeout" 
          options={[
            { value: "15m", label: "15 Minutes" },
            { value: "30m", label: "30 Minutes" },
            { value: "1h", label: "1 Hour" },
            { value: "never", label: "Never Timeout" },
          ]}
          defaultValue="30m"
        />
        <SelectField 
          label="Password Policy" 
          name="passwordPolicy" 
          options={[
            { value: "basic", label: "Basic (Min 6 chars)" },
            { value: "strong", label: "Strong (Min 8 chars, 1 number, 1 symbol)" },
          ]}
          defaultValue="basic"
        />
      </FormGrid>
    </GenericSettingsPage>
  );
}
