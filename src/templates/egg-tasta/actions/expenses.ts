"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";
import { revalidatePath } from "next/cache";
import { ExpenseRepository } from "@/templates/egg-tasta/db/repositories/ExpenseRepository";
import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  const { tenantId } = await getSharedTenantId();
  return tenantId;
}

// ─── EXPENSE HEAD ACTIONS ──────────────────────────────

export async function getExpenseHeadsAction(options: any = {}) {
  await requirePermissionAction('view:expenses');
  try {
    const tenantId = await getTenantId();
    const result = await ExpenseRepository.listExpenseHeads(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    console.error("Failed to get expense heads:", error);
    return { success: false, error: error.message || "Failed to get expense heads" };
  }
}

export async function createExpenseHeadAction(data: { name: string; description?: string; status?: "ACTIVE" | "INACTIVE" }) {
  await requirePermissionAction('create:expenses');
  try {
    const tenantId = await getTenantId();
    const head = await ExpenseRepository.createExpenseHead(tenantId, data);
    revalidatePath("/app/expenses");
    return { success: true, data: head };
  } catch (error: any) {
    console.error("Failed to create expense head:", error);
    return { success: false, error: error.message || "Failed to create expense head" };
  }
}

export async function updateExpenseHeadAction(id: string, data: { name?: string; description?: string; status?: "ACTIVE" | "INACTIVE" }) {
  await requirePermissionAction('edit:expenses');
  try {
    const tenantId = await getTenantId();
    const updated = await ExpenseRepository.updateExpenseHead(tenantId, id, data);
    revalidatePath("/app/expenses");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update expense head:", error);
    return { success: false, error: error.message || "Failed to update expense head" };
  }
}

export async function deleteExpenseHeadAction(id: string) {
  await requirePermissionAction('delete:expenses');
  try {
    const tenantId = await getTenantId();
    await ExpenseRepository.softDeleteExpenseHead(tenantId, id);
    revalidatePath("/app/expenses");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete expense head:", error);
    return { success: false, error: error.message || "Failed to delete expense head" };
  }
}

// ─── EXPENSE ACTIONS ──────────────────────────────────

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

export async function updateExpenseAction(id: string, data: any) {
  await requirePermissionAction('edit:expenses');
  try {
    const tenantId = await getTenantId();
    const updated = await ExpenseRepository.updateExpense(tenantId, id, data);
    revalidatePath("/app/expenses");
    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to update expense:", error);
    return { success: false, error: error.message || "Failed to update expense" };
  }
}

export async function deleteExpenseAction(id: string) {
  await requirePermissionAction('delete:expenses');
  try {
    const tenantId = await getTenantId();
    await ExpenseRepository.deleteExpense(tenantId, id);
    revalidatePath("/app/expenses");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: error.message || "Failed to delete expense" };
  }
}

export async function bulkDeleteExpensesAction(ids: string[]) {
  await requirePermissionAction('delete:expenses');
  try {
    const tenantId = await getTenantId();
    await ExpenseRepository.bulkDeleteExpenses(tenantId, ids);
    revalidatePath("/app/expenses");
    return { success: true, count: ids.length };
  } catch (error: any) {
    console.error("Failed to bulk delete expenses:", error);
    return { success: false, error: error.message || "Failed to bulk delete expenses" };
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
    const result = await ExpenseRepository.listExpenseHeads(tenantId, { limit: 1000, status: "ACTIVE" });
    return { success: true, data: result.data };
  } catch (error: any) {
    console.error("Failed to get expense categories:", error);
    return { success: false, error: error.message || "Failed to get expense categories" };
  }
}

export async function getExpenseReportSummaryAction(period = "this_month") {
  await requirePermissionAction('view:expenses');
  try {
    const tenantId = await getTenantId();
    const summary = await ExpenseRepository.getExpenseReportSummary(tenantId, period);
    return { success: true, data: summary };
  } catch (error: any) {
    console.error("Failed to get expense report summary:", error);
    return { success: false, error: error.message || "Failed to get expense report summary" };
  }
}
