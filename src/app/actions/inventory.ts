"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { InventoryRepository } from "@/lib/repositories/InventoryRepository";

async function getTenantId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return userRoleInfo.tenantId;
}

export async function createStockAdjustmentAction(data: any) {
  try {
    const tenantId = await getTenantId();
    const adjustment = InventoryRepository.createStockAdjustment(tenantId, data, "system");
    revalidatePath("/app/inventory");
    return { success: true, data: adjustment };
  } catch (error: any) {
    console.error("Failed to create stock adjustment:", error);
    return { success: false, error: error.message || "Failed to create stock adjustment" };
  }
}

export async function getStockAdjustmentsAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = InventoryRepository.listStockAdjustments(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    console.error("Failed to get stock adjustments:", error);
    return { success: false, error: error.message || "Failed to get stock adjustments" };
  }
}
