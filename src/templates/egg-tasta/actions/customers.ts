"use server";

import { db } from "@/db";
import { CustomerRepository } from "@/templates/egg-tasta/repositories/CustomerRepository";
import { userRoles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

async function getTenantInfo() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return { tenantId: userRoleInfo.tenantId, userId: token };
}

export async function createCustomerAction(formData: FormData) {
  try {
    const { tenantId } = await getTenantInfo();
    const data = {
      name: formData.get("name")?.toString() || "",
      mobile: formData.get("mobile")?.toString() || "",
      alternativeMobile: formData.get("alternativeMobile")?.toString() || "",
      whatsappNumber: formData.get("whatsappNumber")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      previousDue: parseFloat(formData.get("previousDue")?.toString() || "0"),
      notes: formData.get("notes")?.toString() || "",
      status: formData.get("status")?.toString() || "ACTIVE",
    };

    if (!data.name) {
      return { success: false, error: "Customer Name is required." };
    }

    const customer = CustomerRepository.createCustomer(tenantId, data);
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function listCustomersAction(options: any = {}) {
  try {
    const { tenantId } = await getTenantInfo();
    const result = CustomerRepository.listCustomers(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list customers", data: [], total: 0 };
  }
}

export async function updateCustomerStatusAction(customerCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  try {
    const { tenantId, userId } = await getTenantInfo();
    CustomerRepository.updateCustomerStatus(tenantId, customerCodes, status, userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customers" };
  }
}

export async function updateCustomerAction(formData: FormData) {
  try {
    const { tenantId, userId } = await getTenantInfo();
    const customerCode = formData.get("customerCode")?.toString();
    if (!customerCode) return { success: false, error: "Customer Code is required." };

    const data = {
      name: formData.get("name")?.toString() || "",
      mobile: formData.get("mobile")?.toString() || "",
      alternativeMobile: formData.get("alternativeMobile")?.toString() || "",
      whatsappNumber: formData.get("whatsappNumber")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      previousDue: parseFloat(formData.get("previousDue")?.toString() || "0"),
      notes: formData.get("notes")?.toString() || "",
      status: formData.get("status")?.toString() || "ACTIVE",
    };

    if (!data.name) {
      return { success: false, error: "Customer Name is required." };
    }

    const customer = CustomerRepository.updateCustomer(tenantId, customerCode, data, userId);
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function adjustCustomerBalanceAction(formData: FormData) {
  try {
    const { tenantId, userId } = await getTenantInfo();
    const customerCode = formData.get("customerCode")?.toString();
    if (!customerCode) return { success: false, error: "Customer Code is required." };
    
    const newBalanceStr = formData.get("newBalance")?.toString();
    if (!newBalanceStr || isNaN(parseFloat(newBalanceStr))) {
      return { success: false, error: "Valid New Balance is required." };
    }
    const newBalance = parseFloat(newBalanceStr);
    
    const reason = formData.get("reason")?.toString();
    if (!reason) return { success: false, error: "Reason is required." };
    
    const notes = formData.get("notes")?.toString() || "";

    const result = CustomerRepository.adjustCustomerBalance(tenantId, customerCode, newBalance, reason, notes, userId);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to adjust balance" };
  }
}

export async function getCustomerProfileAction(customerCode: string) {
  try {
    const { tenantId } = await getTenantInfo();
    const data = CustomerRepository.getCustomerProfileData(tenantId, customerCode);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load profile" };
  }
}
