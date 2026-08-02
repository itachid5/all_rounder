"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";

import { db } from "@/shared/db/database";
import { CustomerCollectionRepository } from "@/templates/egg-tasta/db/repositories/CustomerCollectionRepository";
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

export async function createCustomerCollectionAction(data: any): Promise<{ success: boolean; collection?: any; error?: string }> {
  try {
    const tenantId = await getTenantId();
    
    if (!data.customerId || !data.amount) {
      return { success: false, error: "Missing required fields" };
    }
    
    const result = await CustomerCollectionRepository.createCollection(tenantId, data);
    return { success: true, collection: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function listCustomerCollectionsAction(options: any = {}): Promise<{ success: boolean; data?: any; total?: number; error?: string }> {
  try {
    const tenantId = await getTenantId();
    const result = await CustomerCollectionRepository.listCollections(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCustomerCollectionByIdAction(id: string) {
  await requirePermissionAction('view:customer_collections');
  try {
    const tenantId = await getTenantId();
    // Since we don't have a specific getById yet, we use list and filter
    const result = await CustomerCollectionRepository.listCollections(tenantId, { limit: 1000 });
    const item = result.data.find((i: any) => i.collection.id === id);
    if (!item) return { success: false, error: "Not found" };
    
    // Formatting it nicely to match what view expects
    return { success: true, data: { 
      id: item.collection.id,
      collectionNo: item.collection.collectionNo,
      date: item.collection.date,
      amount: item.collection.amount,
      status: item.collection.status,
      customerName: item.customerName 
    }};
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomerCollectionAction(id: string, data: any): Promise<{ success: boolean, data?: any, error?: string }> {
  try {
    const tenantId = await getTenantId();
    if (!data.customerId || !data.amount) {
      return { success: false, error: "Missing required fields" };
    }
    const result = await CustomerCollectionRepository.updateCollection(tenantId, id, data);
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomerCollectionAction(id: string) {
  await requirePermissionAction('delete:customer_collections');
  try {
    const tenantId = await getTenantId();
    await CustomerCollectionRepository.deleteCollection(tenantId, id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
