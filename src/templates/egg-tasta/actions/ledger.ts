"use server";

import { requireAnyPermissionAction, getCurrentUserPermissionsAction } from "@/shared/actions/rbac";
import { LedgerService, PostLedgerInput, LedgerListOptions } from "@/templates/egg-tasta/services/LedgerService";
import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";
import { revalidatePath } from "next/cache";

async function getTenantInfo() {
  return await getSharedTenantId();
}

export async function getLedgerEntriesAction(options: LedgerListOptions = {}) {
  await requireAnyPermissionAction(['ledger.view', 'view:ledger', 'view:reports', 'view:sales', 'view:purchases']);
  try {
    const { tenantId } = await getTenantInfo();
    const result = await LedgerService.listLedgerEntries(tenantId, options);
    return { success: true, ...result };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch ledger entries",
      data: [],
      total: 0,
      page: 1,
      limit: options.limit || 50,
      totalPages: 0,
      summary: { openingBalance: 0, totalDebit: 0, totalCredit: 0, currentBalance: 0 }
    };
  }
}

export async function getLedgerDetailAction(entryId: string) {
  await requireAnyPermissionAction(['ledger.view', 'view:ledger', 'view:reports']);
  try {
    const { tenantId } = await getTenantInfo();
    const result = await LedgerService.getLedgerEntryById(tenantId, entryId);
    if (!result) return { success: false, error: "Ledger entry not found" };
    return { success: true, data: result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch ledger entry detail" };
  }
}

export async function createManualAdjustmentAction(data: {
  transactionType: "OPENING_BALANCE" | "ADJUSTMENT" | "CASH_IN" | "CASH_OUT";
  amount: number;
  entryType: "DEBIT" | "CREDIT";
  customerId?: string;
  supplierId?: string;
  entryDate?: string;
  description?: string;
  referenceNo?: string;
}) {
  await requireAnyPermissionAction(['ledger.adjust', 'adjust:ledger']);
  try {
    const { tenantId, userId } = await getTenantInfo();

    if (!data.amount || data.amount <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    const debit = data.entryType === "DEBIT" ? data.amount : 0;
    const credit = data.entryType === "CREDIT" ? data.amount : 0;

    let entityType: "CUSTOMER" | "SUPPLIER" | "CASH" | "GENERAL" = "GENERAL";
    if (data.customerId) entityType = "CUSTOMER";
    else if (data.supplierId) entityType = "SUPPLIER";
    else if (data.transactionType === "CASH_IN" || data.transactionType === "CASH_OUT") entityType = "CASH";

    const entry = await LedgerService.postEntry(tenantId, {
      transactionType: data.transactionType,
      debit,
      credit,
      customerId: data.customerId || null,
      supplierId: data.supplierId || null,
      entityType,
      referenceType: "MANUAL_ADJUSTMENT",
      referenceNo: data.referenceNo || null,
      entryDate: data.entryDate || new Date().toISOString(),
      description: data.description || `Manual Adjustment (${data.transactionType})`,
      createdBy: userId || "Admin",
    });

    revalidatePath("/app/ledger");
    revalidatePath("/app/customers/ledger");
    revalidatePath("/app/suppliers/ledger");

    return { success: true, entry };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create manual adjustment" };
  }
}

export async function getLedgerUserPermissionsAction() {
  const permsRes = await getCurrentUserPermissionsAction();
  const perms = permsRes.permissions || [];
  const isOwner = permsRes.isOwner || false;

  return {
    isOwner,
    canView: isOwner || perms.includes('ledger.view') || perms.includes('view:ledger') || perms.includes('view:reports'),
    canExport: isOwner || perms.includes('ledger.export') || perms.includes('export:ledger'),
    canPrint: isOwner || perms.includes('ledger.print') || perms.includes('print:ledger'),
    canAdjust: isOwner || perms.includes('ledger.adjust') || perms.includes('adjust:ledger'),
  };
}
