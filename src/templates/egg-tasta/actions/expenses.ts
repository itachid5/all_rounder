"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/shared/db/database";
import { userRoles } from "@/platform/db/schema";
import { expenseCategories } from "@/templates/egg-tasta/db/schema";

import { eq } from "drizzle-orm";
import { ExpenseRepository } from "@/templates/egg-tasta/db/repositories/ExpenseRepository";

import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  const { tenantId } = await getSharedTenantId();
  return tenantId;
}

export async function createExpenseAction(data: any) {
  await requirePermissionAction('create:expenses');
  try {
    const tenantId = await getTenantId();
    const expense = await ExpenseRepository.createExpense(tenantId, data, "system");
    revalidatePath("/app/expenses");
    return { success: true, data: expense };
  } catch (error: any) {
    console.error("Failed to create expense:", error);
    return { success: false, error: error.message || "Failed to create expense" };
  }
}

export async function getExpensesAction(options: any = {}) {
  await requirePermissionAction('view:expenses');
  try {
    const tenantId = await getTenantId();
    const result = await ExpenseRepository.listExpenses(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    console.error("Failed to get expenses:", error);
    return { success: false, error: error.message || "Failed to get expenses" };
  }
}

export async function getExpenseCategoriesAction() {
  await requirePermissionAction('view:expenses');
  try {
    const tenantId = await getTenantId();
    const data = await db.select().from(expenseCategories).where(eq(expenseCategories.tenantId, tenantId)).all();
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to get expense categories:", error);
    return { success: false, error: error.message || "Failed to get expense categories" };
  }
}
