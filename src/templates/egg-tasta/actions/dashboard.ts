"use server";

import { db } from "@/shared/db/database";
import { DashboardRepository } from "@/templates/egg-tasta/db/repositories/DashboardRepository";
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

export async function getDashboardSummaryAction(filterOptions: { range?: string; from?: string; to?: string } = {}) {
  try {
    const tenantId = await getTenantId();
    const data = await DashboardRepository.getSummary(tenantId, filterOptions);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load dashboard data" };
  }
}
