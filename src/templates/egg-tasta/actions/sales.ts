"use server";

import { db } from "@/shared/db/database";
import { SaleRepository } from "@/templates/egg-tasta/db/repositories/SaleRepository";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

async function getTenantId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return userRoleInfo.tenantId;
}

export async function createSaleAction(data: any) {
  try {
    const tenantId = await getTenantId();
    
    if (!data.customerId || !data.items || data.items.length === 0) {
      return { success: false, error: "Customer and at least one item are required." };
    }

    const sale = await SaleRepository.createSale(tenantId, data);
    return { success: true, sale };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create sale" };
  }
}

export async function listSalesAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = await SaleRepository.listSales(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list sales", data: [], total: 0 };
  }
}

export async function deleteSaleAction(saleId: string) {
  try {
    const tenantId = await getTenantId();
    await SaleRepository.deleteSale(tenantId, saleId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete sale" };
  }
}
