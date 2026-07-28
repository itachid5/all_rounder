"use server";

import { db } from "@/db";
import { PurchaseRepository } from "@/lib/repositories/PurchaseRepository";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

async function getTenantId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return { tenantId: userRoleInfo.tenantId, userId: token };
}

export async function createPurchaseAction(data: any) {
  try {
    const { tenantId, userId } = await getTenantId();
    
    // In a real scenario, you'd validate the data using Zod here
    if (!data.supplierId || !data.items || data.items.length === 0) {
      return { success: false, error: "Supplier and at least one item are required." };
    }

    // Default to the first account if none provided and paidAmount > 0
    if (data.paidAmount > 0 && !data.accountId) {
      const { accounts } = await import("@/db/schema");
      const and = (await import("drizzle-orm")).and;
      const account = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, "CASH"))).get();
      if (account) {
        data.accountId = account.id;
      }
    }

    const purchase = PurchaseRepository.createPurchase(tenantId, userId, data);
    return { success: true, purchase };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create purchase" };
  }
}

export async function listPurchasesAction(options: any = {}) {
  try {
    const { tenantId } = await getTenantId();
    const result = PurchaseRepository.listPurchases(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list purchases", data: [], total: 0 };
  }
}

export async function cancelPurchaseAction(purchaseId: string) {
  try {
    const { tenantId } = await getTenantId();
    PurchaseRepository.cancelPurchase(tenantId, purchaseId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel purchase" };
  }
}
