"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/shared/db/database";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { InventoryRepository } from "@/templates/egg-tasta/db/repositories/InventoryRepository";

import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  const { tenantId } = await getSharedTenantId();
  return tenantId;
}

export async function createStockAdjustmentAction(data: any) {
  await requirePermissionAction('create:inventory');
  try {
    const tenantId = await getTenantId();
    const adjustment = await InventoryRepository.createStockAdjustment(tenantId, data, "system");
    revalidatePath("/app/inventory");
    return { success: true, data: adjustment };
  } catch (error: any) {
    console.error("Failed to create stock adjustment:", error);
    return { success: false, error: error.message || "Failed to create stock adjustment" };
  }
}

export async function getStockAdjustmentsAction(options: any = {}) {
  await requirePermissionAction('view:inventory');
  try {
    const tenantId = await getTenantId();
    const result = await InventoryRepository.listStockAdjustments(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    console.error("Failed to get stock adjustments:", error);
    return { success: false, error: error.message || "Failed to get stock adjustments" };
  }
}

export async function getStockValuationAction() {
  await requirePermissionAction('view:inventory');
  try {
    const tenantId = await getTenantId();
    const valuations = await InventoryRepository.getStockValuation(tenantId);
    return { success: true, data: valuations };
  } catch (error: any) {
    console.error("Failed to get stock valuation:", error);
    return { success: false, error: error.message || "Failed to calculate stock valuation" };
  }
}
