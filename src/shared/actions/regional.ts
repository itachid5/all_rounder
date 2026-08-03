"use server";

import { db } from "@/shared/db/database";
import { tenants } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/shared/utils/auth";
import { getCurrencyByCode } from "@/shared/constants/currencies";

export interface RegionalSettingsData {
  currency: string;
  currencySymbol: string;
  currencyName: string;
  timezone: string;
  language: string;
}

export async function getRegionalSettingsAction(): Promise<{
  success: boolean;
  data: RegionalSettingsData;
  error?: string;
}> {
  try {
    const { tenantId } = await getTenantId();
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();

    let settingsObj: any = {};
    if (tenant?.settings) {
      try {
        settingsObj = typeof tenant.settings === "string" ? JSON.parse(tenant.settings) : tenant.settings;
      } catch (e) {
        settingsObj = {};
      }
    }

    const currencyCode = settingsObj.currency || "BDT";
    const currencyInfo = getCurrencyByCode(currencyCode);

    return {
      success: true,
      data: {
        currency: currencyCode,
        currencySymbol: settingsObj.currencySymbol || currencyInfo.symbol || "৳",
        currencyName: currencyInfo.name || "Bangladeshi Taka",
        timezone: settingsObj.timezone || "Asia/Dhaka",
        language: settingsObj.language || "en",
      }
    };
  } catch (error: any) {
    return {
      success: true,
      data: {
        currency: "BDT",
        currencySymbol: "৳",
        currencyName: "Bangladeshi Taka",
        timezone: "Asia/Dhaka",
        language: "en",
      }
    };
  }
}

export async function updateRegionalSettingsAction(data: {
  currency: string;
  timezone: string;
  language: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { tenantId } = await getTenantId();
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();

    let settingsObj: any = {};
    if (tenant?.settings) {
      try {
        settingsObj = typeof tenant.settings === "string" ? JSON.parse(tenant.settings) : tenant.settings;
      } catch (e) {
        settingsObj = {};
      }
    }

    const currencyInfo = getCurrencyByCode(data.currency);

    const updatedSettings = JSON.stringify({
      ...settingsObj,
      currency: data.currency,
      currencySymbol: currencyInfo.symbol,
      currencyName: currencyInfo.name,
      timezone: data.timezone,
      language: data.language,
      updatedAt: new Date().toISOString(),
    });

    await db.update(tenants)
      .set({
        settings: updatedSettings,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, tenantId));

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[updateRegionalSettingsAction Error]:", error);
    return { success: false, error: error.message || "Failed to update regional settings" };
  }
}
