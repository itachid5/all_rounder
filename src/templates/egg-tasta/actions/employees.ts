"use server";

import { EmployeeRepository } from "../db/repositories/EmployeeRepository";
import { cookies } from "next/headers";
import { db } from "@/shared/db/database";
import { users, userRoles } from "@/platform/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getTenantIdFromSession(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  return userRoleInfo?.tenantId || null;
}

export async function getNextEmpIdAction() {
  try {
    const tenantId = await getTenantIdFromSession();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const empId = await EmployeeRepository.generateNextEmpId(tenantId);
    return { success: true, empId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getEmployeesAction() {
  try {
    const tenantId = await getTenantIdFromSession();
    if (!tenantId) return { success: false, error: "Unauthorized", data: [] };

    const data = await EmployeeRepository.getEmployees(tenantId);
    return { success: true, data };
  } catch (error: any) {
    console.error("[getEmployeesAction Error]:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createEmployeeAction(formData: FormData) {
  try {
    const tenantId = await getTenantIdFromSession();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const fullName = (formData.get("fullName") as string || "").trim();
    const mobile = (formData.get("mobile") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const designation = (formData.get("role") as string || formData.get("designation") as string || "").trim();
    const joinDate = (formData.get("joinDate") as string || new Date().toISOString().split("T")[0]).trim();
    const status = (formData.get("status") as string || "ACTIVE").trim();
    const username = (formData.get("username") as string || "").trim();
    const password = (formData.get("password") as string || "").trim();
    const confirmPassword = (formData.get("confirmPassword") as string || "").trim();

    // Validation
    if (!fullName) return { success: false, error: "Full Name is required." };
    if (!mobile) return { success: false, error: "Mobile number is required." };
    if (!designation) return { success: false, error: "Designation is required." };

    if (username) {
      if (!password) return { success: false, error: "Password is required when providing a username." };
      if (password !== confirmPassword) return { success: false, error: "Passwords do not match." };
      if (password.length < 6) return { success: false, error: "Password must be at least 6 characters." };
    }

    const res = await EmployeeRepository.createEmployee(tenantId, {
      fullName,
      mobile,
      email,
      designation,
      joinDate,
      status,
      username: username || undefined,
      password: password || undefined,
    });

    revalidatePath("/app/users/manage");
    revalidatePath("/app/users");
    return { success: true, empId: res.empId };
  } catch (error: any) {
    console.error("[createEmployeeAction Error]:", error);
    return { success: false, error: error.message || "Failed to create employee." };
  }
}

export async function updateEmployeeAction(id: string, formData: FormData) {
  try {
    const tenantId = await getTenantIdFromSession();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const fullName = (formData.get("fullName") as string || "").trim();
    const mobile = (formData.get("mobile") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const designation = (formData.get("role") as string || formData.get("designation") as string || "").trim();
    const joinDate = (formData.get("joinDate") as string || new Date().toISOString().split("T")[0]).trim();
    const status = (formData.get("status") as string || "ACTIVE").trim();
    const password = (formData.get("password") as string || "").trim();

    if (!fullName) return { success: false, error: "Full Name is required." };
    if (!mobile) return { success: false, error: "Mobile number is required." };

    await EmployeeRepository.updateEmployee(tenantId, id, {
      fullName,
      mobile,
      email,
      designation,
      joinDate,
      status,
      password: password || undefined,
    });

    revalidatePath("/app/users/manage");
    revalidatePath("/app/users");
    return { success: true };
  } catch (error: any) {
    console.error("[updateEmployeeAction Error]:", error);
    return { success: false, error: error.message || "Failed to update employee." };
  }
}

export async function toggleEmployeeStatusAction(id: string) {
  try {
    const tenantId = await getTenantIdFromSession();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const newStatus = await EmployeeRepository.toggleEmployeeStatus(tenantId, id);
    revalidatePath("/app/users/manage");
    revalidatePath("/app/users");
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("[toggleEmployeeStatusAction Error]:", error);
    return { success: false, error: error.message || "Failed to update employee status." };
  }
}

export async function deleteEmployeeAction(id: string) {
  try {
    const tenantId = await getTenantIdFromSession();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    await EmployeeRepository.deleteEmployee(tenantId, id);
    revalidatePath("/app/users/manage");
    revalidatePath("/app/users");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteEmployeeAction Error]:", error);
    return { success: false, error: error.message || "Failed to delete employee." };
  }
}
