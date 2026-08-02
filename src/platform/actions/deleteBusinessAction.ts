"use server";

import { db } from "@/shared/db/database";
import { 
  tenants, users, roles, userRoles, rolePermissions, auditLogs, sessions, sequences
} from "@/platform/db/schema";
import { 
  accounts, customerCollections, customerLedgers, customers, employees, 
  expenseCategories, expenses, inventoryMovements, stockAdjustments, productCategories, productUnits, 
  productVariants, products, purchases, sales, supplierLedgers, 
  supplierPayments, suppliers 
} from "@/templates/egg-tasta/db/schema";
import { eq, count, inArray, not } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

async function verifyPlatformAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const user = await db.select().from(users).where(eq(users.id, token)).get();
  if (!user || user.userType !== 'PLATFORM') {
    throw new Error("Unauthorized: Only Platform Admins can perform this action.");
  }
  return user;
}

export async function getBusinessStatsAction(tenantId: string) {
  try {
    await verifyPlatformAdmin();

    const stats = {
      products: (await db.select({ count: count() }).from(products).where(eq(products.tenantId, tenantId)).get())?.count || 0,
      customers: (await db.select({ count: count() }).from(customers).where(eq(customers.tenantId, tenantId)).get())?.count || 0,
      suppliers: (await db.select({ count: count() }).from(suppliers).where(eq(suppliers.tenantId, tenantId)).get())?.count || 0,
      employees: (await db.select({ count: count() }).from(employees).where(eq(employees.tenantId, tenantId)).get())?.count || 0,
      sales: (await db.select({ count: count() }).from(sales).where(eq(sales.tenantId, tenantId)).get())?.count || 0,
      purchases: (await db.select({ count: count() }).from(purchases).where(eq(purchases.tenantId, tenantId)).get())?.count || 0,
      collections: (await db.select({ count: count() }).from(customerCollections).where(eq(customerCollections.tenantId, tenantId)).get())?.count || 0,
      expenses: (await db.select({ count: count() }).from(expenses).where(eq(expenses.tenantId, tenantId)).get())?.count || 0,
    };

    const totalRecords = Object.values(stats).reduce((acc, curr) => acc + curr, 0);

    return { success: true, stats, totalRecords };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function hardDeleteBusinessAction(tenantId: string) {
  try {
    const admin = await verifyPlatformAdmin();

    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    if (!tenant) {
      return { success: false, error: "Business not found." };
    }

    let deletedRecordsCount = 0;

    await db.transaction(async (tx) => {
      // Helper function to count and delete
      const deleteFrom = async (table: any, condition: any) => {
        const records = await tx.select({ count: count() }).from(table).where(condition).get();
        const cnt = records?.count || 0;
        if (cnt > 0) {
          await tx.delete(table).where(condition);
          deletedRecordsCount += cnt;
        }
      };

      // 1. Delete Egg Tasta Template Tables
      await deleteFrom(sales, eq(sales.tenantId, tenantId));
      await deleteFrom(purchases, eq(purchases.tenantId, tenantId));
      await deleteFrom(customerCollections, eq(customerCollections.tenantId, tenantId));
      await deleteFrom(supplierPayments, eq(supplierPayments.tenantId, tenantId));
      await deleteFrom(customerLedgers, eq(customerLedgers.tenantId, tenantId));
      await deleteFrom(supplierLedgers, eq(supplierLedgers.tenantId, tenantId));
      await deleteFrom(expenses, eq(expenses.tenantId, tenantId));
      await deleteFrom(expenseCategories, eq(expenseCategories.tenantId, tenantId));
      await deleteFrom(inventoryMovements, eq(inventoryMovements.tenantId, tenantId));
      await deleteFrom(stockAdjustments, eq(stockAdjustments.tenantId, tenantId));
      await deleteFrom(productVariants, eq(productVariants.tenantId, tenantId));
      await deleteFrom(products, eq(products.tenantId, tenantId));
      await deleteFrom(productCategories, eq(productCategories.tenantId, tenantId));
      await deleteFrom(productUnits, eq(productUnits.tenantId, tenantId));
      await deleteFrom(customers, eq(customers.tenantId, tenantId));
      await deleteFrom(suppliers, eq(suppliers.tenantId, tenantId));
      await deleteFrom(accounts, eq(accounts.tenantId, tenantId));
      
      // Get associated user IDs from employees before deleting employees
      const empRecords = await tx.select().from(employees).where(eq(employees.tenantId, tenantId));
      const employeeUserIds = empRecords.map(e => e.userId).filter(Boolean) as string[];
      await deleteFrom(employees, eq(employees.tenantId, tenantId));

      // 2. Delete Platform Tables
      
      const roleRecords = await tx.select().from(userRoles).where(eq(userRoles.tenantId, tenantId));
      const roleUserIds = roleRecords.map(r => r.userId);
      await deleteFrom(userRoles, eq(userRoles.tenantId, tenantId));
      
      const rolesInTenant = await tx.select().from(roles).where(eq(roles.tenantId, tenantId));
      const roleIds = rolesInTenant.map(r => r.id);
      
      if (roleIds.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < roleIds.length; i += chunkSize) {
          const chunk = roleIds.slice(i, i + chunkSize);
          await deleteFrom(rolePermissions, inArray(rolePermissions.roleId, chunk));
        }
      }
      
      await deleteFrom(roles, eq(roles.tenantId, tenantId));

      await deleteFrom(sequences, eq(sequences.tenantId, tenantId));

      // 3. Determine which users to safely delete
      const potentialUserIds = Array.from(new Set([...employeeUserIds, ...roleUserIds, tenant.ownerId])).filter((id): id is string => id !== null);
      let usersToDelete: string[] = [];

      if (potentialUserIds.length > 0) {
        // Users who have roles in other tenants
        const otherRoles = await tx.select().from(userRoles).where(not(eq(userRoles.tenantId, tenantId)));
        const userIdsWithOtherRoles = new Set(otherRoles.map(r => r.userId));

        // Users who own other tenants
        const otherTenants = await tx.select().from(tenants).where(not(eq(tenants.id, tenantId)));
        const ownerIdsOfOtherTenants = new Set(otherTenants.map(t => t.ownerId));

        usersToDelete = potentialUserIds.filter(id => 
          !userIdsWithOtherRoles.has(id) && 
          !ownerIdsOfOtherTenants.has(id)
        );

        if (usersToDelete.length > 0) {
          // Delete sessions for these users before deleting users
          const chunkSize = 100;
          for (let i = 0; i < usersToDelete.length; i += chunkSize) {
            const chunk = usersToDelete.slice(i, i + chunkSize);
            await deleteFrom(sessions, inArray(sessions.userId, chunk));
          }
        }
      }

      // 4. Delete the Tenant Record itself (must be before users, since ownerId references users)
      await deleteFrom(tenants, eq(tenants.id, tenantId));

      // 5. Delete Users (now safe)
      if (usersToDelete.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < usersToDelete.length; i += chunkSize) {
          const chunk = usersToDelete.slice(i, i + chunkSize);
          await deleteFrom(users, inArray(users.id, chunk));
        }
      }
      
      // 5. Create Platform Audit Log
      let ipAddress = 'unknown';
      try {
        const headersList = await headers();
        ipAddress = headersList.get('x-forwarded-for') || 'unknown';
      } catch (e) {}

      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(),
        userId: admin.id,
        tenantId: null, // Global platform log
        action: 'DELETE_BUSINESS',
        category: 'TENANT_MANAGEMENT',
        severity: 'CRITICAL',
        resource: 'Business',
        resourceId: tenantId,
        details: JSON.stringify({
          businessName: tenant.name,
          deletedRecordsCount
        }),
        ipAddress,
        userAgent: 'Platform Admin Portal'
      });
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
