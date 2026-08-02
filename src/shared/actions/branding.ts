"use server";

import { db } from "@/shared/db/database";
import { tenants } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/shared/utils/auth";

export interface TenantBrandingData {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  tenantName?: string;
}

export async function getTenantBrandingAction(): Promise<{
  success: boolean;
  data?: TenantBrandingData;
  error?: string;
}> {
  try {
    const { tenantId } = await getTenantId();

    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    if (!tenant) {
      return { success: false, error: "Tenant not found" };
    }

    return {
      success: true,
      data: {
        logoUrl: tenant.logoUrl || null,
        faviconUrl: tenant.faviconUrl || null,
        iconUrl: tenant.iconUrl || null,
        bannerUrl: tenant.bannerUrl || null,
        tenantName: tenant.name
      }
    };
  } catch (error: any) {
    console.error("[getTenantBrandingAction Error]:", error);
    return { success: false, error: error.message || "Failed to load tenant branding" };
  }
}

export async function updateTenantBrandingAction(branding: {
  logoUrl?: string | null;
  faviconUrl?: string | null;
  iconUrl?: string | null;
  bannerUrl?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenantId } = await getTenantId();

    await db.update(tenants)
      .set({
        logoUrl: branding.logoUrl !== undefined ? branding.logoUrl : undefined,
        faviconUrl: branding.faviconUrl !== undefined ? branding.faviconUrl : undefined,
        iconUrl: branding.iconUrl !== undefined ? branding.iconUrl : undefined,
        bannerUrl: branding.bannerUrl !== undefined ? branding.bannerUrl : undefined,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId));

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[updateTenantBrandingAction Error]:", error);
    return { success: false, error: error.message || "Failed to update branding settings" };
  }
}

export async function resetTenantBrandingAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenantId } = await getTenantId();

    await db.update(tenants)
      .set({
        logoUrl: null,
        faviconUrl: null,
        iconUrl: null,
        bannerUrl: null,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId));

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[resetTenantBrandingAction Error]:", error);
    return { success: false, error: error.message || "Failed to reset branding settings" };
  }
}
