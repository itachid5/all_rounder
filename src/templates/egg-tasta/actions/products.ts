"use server";

import { db } from "@/shared/db/database";
import { productCategories, productUnits } from "@/templates/egg-tasta/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { ProductRepository } from "@/templates/egg-tasta/db/repositories/ProductRepository";
import { userRoles } from "@/platform/db/schema";

import { randomUUID } from "crypto";

async function getTenantId() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return userRoleInfo.tenantId;
}

export async function createProductAction(formData: FormData) {
  try {
    const tenantId = await getTenantId();
    
    const data = {
      name: formData.get("name") as string,
      categoryId: (formData.get("categoryId") as string) || null,
      unitId: (formData.get("unitId") as string) || null,
      purchasePrice: parseFloat(formData.get("purchasePrice") as string) || 0,
      sellingPrice: parseFloat(formData.get("sellingPrice") as string) || 0,
      wholesalePrice: parseFloat(formData.get("wholesalePrice") as string) || 0,
      minimumSellingPrice: parseFloat(formData.get("minimumSellingPrice") as string) || 0,
      openingStock: parseInt(formData.get("openingStock") as string, 10) || 0,
      minimumStockAlert: parseInt(formData.get("minimumStockAlert") as string, 10) || 0,
      status: formData.get("status") as string || 'ACTIVE',
      notes: formData.get("notes") as string,
      // Barcode support if added to schema in future, for now append to notes or discard
    };

    if (!data.name) return { error: "Product Name is required" };
    if (data.purchasePrice < 0) return { error: "Purchase Price cannot be negative" };
    if (data.sellingPrice < 0) return { error: "Selling Price cannot be negative" };

    const product = await ProductRepository.createProduct(tenantId, data);
    
    return { success: true, productCode: product.productCode };
  } catch (error: any) {
    return { error: error.message || "Failed to create product" };
  }
}

export async function getCategoriesAndUnits() {
  try {
    const tenantId = await getTenantId();
    const categories = await db.select().from(productCategories).where(eq(productCategories.tenantId, tenantId)).all();
    let units = await db.select().from(productUnits).where(eq(productUnits.tenantId, tenantId)).all();
    
    // Seed default Egg Shop units if empty
    if (units.length === 0) {
      const defaultUnits = ['Piece', 'Dozen', 'Tray', 'Carton'];
      for (const u of defaultUnits) {
        await db.insert(productUnits).values({
          id: randomUUID(),
          tenantId,
          name: u,
        });
      }
      units = await db.select().from(productUnits).where(eq(productUnits.tenantId, tenantId)).all();
    }

    return { categories, units };
  } catch (error) {
    return { categories: [], units: [] };
  }
}

export async function listProductsAction(options: any = {}) {
  try {
    const tenantId = await getTenantId();
    const result = ProductRepository.listProducts(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list products", data: [], total: 0 };
  }
}

export async function softDeleteProductAction(productCode: string) {
  try {
    const tenantId = await getTenantId();
    ProductRepository.softDeleteProduct(tenantId, productCode);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete product" };
  }
}

export async function bulkUpdateStatusAction(productCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  try {
    const tenantId = await getTenantId();
    ProductRepository.bulkUpdateStatus(tenantId, productCodes, status);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update products" };
  }
}
