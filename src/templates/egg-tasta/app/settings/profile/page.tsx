"use client";

import React from "react";
import { Store } from "lucide-react";
import GenericSettingsPage from "@/templates/egg-tasta/components/settings/generic-settings-page";
import { FormGrid, TextField } from "@/templates/egg-tasta/components";

export default function BusinessProfilePage() {
  return (
    <GenericSettingsPage title="Business Profile" description="Manage primary details about your business entity." icon={Store}>
      <FormGrid>
        <TextField label="Business Name" name="businessName" placeholder="e.g. Acme Corp" required />
        <TextField label="Business Type" name="businessType" placeholder="e.g. Retail" required />
        <TextField label="Owner Name" name="ownerName" placeholder="e.g. John Doe" required />
        <TextField label="Mobile Number" name="mobile" placeholder="01700000000" required />
        <TextField label="Email" name="email" type="email" placeholder="admin@business.com" required />
        <TextField label="Website" name="website" placeholder="https://..." />
        <TextField label="Trade License No (Optional)" name="tradeLicense" placeholder="e.g. TR-12345" />
        <TextField label="BIN / VAT No (Optional)" name="vatNo" placeholder="e.g. VAT-98765" />
      </FormGrid>
    </GenericSettingsPage>
  );
}
