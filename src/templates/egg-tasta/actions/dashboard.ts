"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";

import { db } from "@/shared/db/database";
import { DashboardRepository } from "@/templates/egg-tasta/db/repositories/DashboardRepository";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  const { tenantId } = await getSharedTenantId();
  return tenantId;
}

export async function getDashboardSummaryAction(filterOptions: { range?: string; from?: string; to?: string } = {}) {
  await requirePermissionAction('view:dashboard');
  try {
    const tenantId = await getTenantId();
    const data = await DashboardRepository.getSummary(tenantId, filterOptions);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load dashboard data" };
  }
}
