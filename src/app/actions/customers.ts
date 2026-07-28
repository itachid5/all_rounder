"use server";

import { db } from "@/db";
import { CustomerRepository } from "@/lib/repositories/CustomerRepository";
import { userRoles } from "@/db/schema";
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

export async function createCustomerAction(formData: FormData) {
  try {
    const tenantId = await getTenantId();
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
    const tenantId = await getTenantId();
    const result = CustomerRepository.listCustomers(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list customers", data: [], total: 0 };
  }
}

export async function updateCustomerStatusAction(customerCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  try {
    const tenantId = await getTenantId();
    CustomerRepository.updateCustomerStatus(tenantId, customerCodes, status);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customers" };
  }
}
