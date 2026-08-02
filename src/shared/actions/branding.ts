"use server";

import { db } from "@/shared/db/database";
import { tenants, users, userRoles } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return { success: false, error: "Unauthorized" };
    }

    const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
    if (!userRoleInfo?.tenantId) {
      return { success: false, error: "Tenant not found" };
    }

    const tenant = await db.select().from(tenants).where(eq(tenants.id, userRoleInfo.tenantId)).get();
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
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return { success: false, error: "Unauthorized" };
    }

    const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
    if (!userRoleInfo?.tenantId) {
      return { success: false, error: "Tenant not found" };
    }

    // Verify role permissions (Owner or Admin)
    const currentUser = await db.select().from(users).where(eq(users.id, token)).get();
    if (!currentUser) {
      return { success: false, error: "User not found" };
    }

    await db.update(tenants)
      .set({
        logoUrl: branding.logoUrl !== undefined ? branding.logoUrl : undefined,
        faviconUrl: branding.faviconUrl !== undefined ? branding.faviconUrl : undefined,
        iconUrl: branding.iconUrl !== undefined ? branding.iconUrl : undefined,
        bannerUrl: branding.bannerUrl !== undefined ? branding.bannerUrl : undefined,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, userRoleInfo.tenantId));

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[updateTenantBrandingAction Error]:", error);
    return { success: false, error: error.message || "Failed to update branding settings" };
  }
}

export async function resetTenantBrandingAction(): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) {
      return { success: false, error: "Unauthorized" };
    }

    const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
    if (!userRoleInfo?.tenantId) {
      return { success: false, error: "Tenant not found" };
    }

    await db.update(tenants)
      .set({
        logoUrl: null,
        faviconUrl: null,
        iconUrl: null,
        bannerUrl: null,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, userRoleInfo.tenantId));

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[resetTenantBrandingAction Error]:", error);
    return { success: false, error: error.message || "Failed to reset branding settings" };
  }
}
