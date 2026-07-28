"use server";

import { db } from "@/db";
import { CustomerCollectionRepository } from "@/lib/repositories/CustomerCollectionRepository";
import { userRoles } from "@/db/schema";
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

export async function createCustomerCollectionAction(data: any) {
  try {
    const tenantId = await getTenantId();
    
    if (!data.customerId || !data.amount) {
      return { success: false, error: "Customer and Amount are required." };
    }

    const collection = CustomerCollectionRepository.createCollection(tenantId, data);
    return { success: true, collection };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create collection" };
  }
}

export async function listCustomerCollectionsAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = CustomerCollectionRepository.listCollections(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list collections", data: [], total: 0 };
  }
}
