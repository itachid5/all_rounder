"use server";

import { db } from "@/shared/db/database";
import { SupplierRepository } from "@/templates/egg-tasta/db/repositories/SupplierRepository";
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

export async function createSupplierAction(formData: FormData) {
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
      return { success: false, error: "Supplier Name is required." };
    }

    const supplier = SupplierRepository.createSupplier(tenantId, data);
    return { success: true, supplier };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create supplier" };
  }
}

export async function listSuppliersAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = SupplierRepository.listSuppliers(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list suppliers", data: [], total: 0 };
  }
}

export async function updateSupplierStatusAction(supplierCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  try {
    const tenantId = await getTenantId();
    SupplierRepository.updateSupplierStatus(tenantId, supplierCodes, status);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update suppliers" };
  }
}
