"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/db";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { AccountRepository } from "@/lib/repositories/AccountRepository";

async function getTenantId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return userRoleInfo.tenantId;
}

export async function createAccountAction(data: any) {
  try {
    const tenantId = await getTenantId();
    const account = AccountRepository.createAccount(tenantId, data, "system");
    revalidatePath("/app/accounts");
    return { success: true, data: account };
  } catch (error: any) {
    console.error("Failed to create account:", error);
    return { success: false, error: error.message || "Failed to create account" };
  }
}

export async function getAccountsAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = AccountRepository.listAccounts(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    console.error("Failed to get accounts:", error);
    return { success: false, error: error.message || "Failed to get accounts" };
  }
}

export async function getTransactionsAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = AccountRepository.listTransactions(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    console.error("Failed to get transactions:", error);
    return { success: false, error: error.message || "Failed to get transactions" };
  }
}
