"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";

import { db } from "@/shared/db/database";
import { PurchaseRepository } from "@/templates/egg-tasta/db/repositories/PurchaseRepository";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  return await getSharedTenantId();
}

export async function createPurchaseAction(data: any) {
  await requirePermissionAction('create:purchases');
  try {
    const { tenantId, userId } = await getTenantId();
    
    // In a real scenario, you'd validate the data using Zod here
    if (!data.supplierId || !data.items || data.items.length === 0) {
      return { success: false, error: "Supplier and at least one item are required." };
    }

    // Default to the first account if none provided and paidAmount > 0
    if (data.paidAmount > 0 && !data.accountId) {
      const { accounts } = await import("@/templates/egg-tasta/db/schema");

      const and = (await import("drizzle-orm")).and;
      const account = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, "CASH"))).get();
      if (account) {
        data.accountId = account.id;
      }
    }

    const purchase = await PurchaseRepository.createPurchase(tenantId, userId, data);
    return { success: true, purchase };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create purchase" };
  }
}

export async function listPurchasesAction(options: any = {}) {
  await requirePermissionAction('view:purchases');
  try {
    const { tenantId } = await getTenantId();
    const result = await PurchaseRepository.listPurchases(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list purchases", data: [], total: 0 };
  }
}

export async function deletePurchaseAction(purchaseId: string) {
  await requirePermissionAction('delete:purchases');
  try {
    const { tenantId } = await getTenantId();
    await PurchaseRepository.deletePurchase(tenantId, purchaseId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete purchase" };
  }
}
