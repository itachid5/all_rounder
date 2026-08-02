import React from "react";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/templates/egg-tasta/components";
import { getTenantBrandingAction } from "@/shared/actions/branding";
import { BrandingSettingsClient } from "@/templates/egg-tasta/components/settings/branding-settings-client";

export default async function BusinessBrandingPage() {
  const brandingRes = await getTenantBrandingAction();
  const initialBranding = brandingRes.success && brandingRes.data ? brandingRes.data : {};

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Branding"
        description="Upload and manage your company logo, favicon, icon, and banner assets."
      />

      <BrandingSettingsClient initialBranding={initialBranding} />
    </div>
  );
}
