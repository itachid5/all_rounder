"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";
import { getTenantId } from "@/shared/utils/auth";
import { CashbookService, CashbookOptions } from "@/templates/egg-tasta/services/CashbookService";
import { getBusinessPrintHeaderAction } from "@/templates/egg-tasta/actions/customers";

export async function getCashbookDataAction(options: CashbookOptions = {}) {
  await requirePermissionAction("view:reports");
  try {
    const { tenantId } = await getTenantId();
    const data = await CashbookService.getCashbookData(tenantId, options);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load cashbook data" };
  }
}

export async function getCashbookHeaderAction() {
  return await getBusinessPrintHeaderAction();
}
