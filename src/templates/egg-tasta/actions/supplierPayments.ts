"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";

import { db } from "@/shared/db/database";
import { SupplierPaymentRepository } from "@/templates/egg-tasta/db/repositories/SupplierPaymentRepository";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  return await getSharedTenantId();
}

export async function createSupplierPaymentAction(data: any) {
  await requirePermissionAction('create:supplier_payments');
  try {
    const { tenantId, userId } = await getTenantId();
    
    if (!data.supplierId || !data.amount || data.amount <= 0) {
      return { success: false, error: "Supplier and valid amount are required." };
    }

    if (!data.accountId) {
      const { accounts } = await import("@/templates/egg-tasta/db/schema");

      const and = (await import("drizzle-orm")).and;
      const account = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, "CASH"))).get();
      if (account) {
        data.accountId = account.id;
      }
    }

    const payment = await SupplierPaymentRepository.createPayment(tenantId, userId, data);
    
    revalidatePath("/app/supplier-payments/manage");
    revalidatePath("/app/suppliers/due");
    revalidatePath("/app/suppliers/ledger");
    
    return { success: true, payment };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to record payment" };
  }
}

export async function listSupplierPaymentsAction(options: any = {}) {
  await requirePermissionAction('view:supplier_payments');
  try {
    const { tenantId } = await getTenantId();
    const result = await SupplierPaymentRepository.listPayments(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list payments" };
  }
}

export async function deleteSupplierPaymentAction(paymentId: string) {
  await requirePermissionAction('delete:supplier_payments');
  try {
    const { tenantId } = await getTenantId();
    await SupplierPaymentRepository.deletePayment(tenantId, paymentId);
    
    revalidatePath("/app/supplier-payments/manage");
    revalidatePath("/app/suppliers/due");
    revalidatePath("/app/suppliers/ledger");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete payment" };
  }
}
