"use server";

import { db } from "@/shared/db/database";
import { users, userRoles, roles, auditLogs } from "@/platform/db/schema";
import { employees } from "@/templates/egg-tasta/db/schema/employees";
import { eq, and, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import * as argon2 from "argon2";

async function verifySuperAdmin(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  const u = await db.select().from(users).where(eq(users.id, token)).get();
  if (!u) return null;
  if (u.userType === 'PLATFORM') return { userId: token };
  return null;
}

export async function getInternalAdminsAction(tenantId: string) {
  try {
    const adminCtx = await verifySuperAdmin();
    if (!adminCtx) return { success: false, error: "Unauthorized. Super Admin access required.", data: [] };

    // Fetch internal business admin role for this tenant
    const internalRole = await db
      .select()
      .from(roles)
      .where(and(eq(roles.tenantId, tenantId), eq(roles.slug, "internal_business_admin")))
      .get();

    if (!internalRole) {
      return { success: true, data: [] };
    }

    const uRoles = await db
      .select()
      .from(userRoles)
      .where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.roleId, internalRole.id)))
      .all();

    if (uRoles.length === 0) return { success: true, data: [] };

    const userIds = uRoles.map((ur) => ur.userId);
    const internalUsers = await Promise.all(
      userIds.map(async (uId) => {
        const u = await db.select().from(users).where(eq(users.id, uId)).get();
        const emp = await db.select().from(employees).where(eq(employees.userId, uId)).get();

        return {
          id: uId,
          empId: emp?.empId || "INT-001",
          username: u?.username || "",
          fullName: `${u?.firstName || ""} ${u?.lastName || ""}`.trim(),
          mobile: emp?.mobile || "",
          email: emp?.email || "",
          status: u?.status || "ACTIVE",
          lastLogin: u?.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never",
          createdAt: u?.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
        };
      })
    );

    return { success: true, data: internalUsers };
  } catch (error: any) {
    console.error("[getInternalAdminsAction Error]:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function createInternalAdminAction(tenantId: string, formData: FormData) {
  try {
    const adminCtx = await verifySuperAdmin();
    if (!adminCtx) return { success: false, error: "Unauthorized. Super Admin access required." };

    const fullName = (formData.get("fullName") as string || "").trim();
    const mobile = (formData.get("mobile") as string || "").trim();
    const email = (formData.get("email") as string || "").trim();
    const username = (formData.get("username") as string || "").trim();
    const password = (formData.get("password") as string || "").trim();

    if (!fullName) return { success: false, error: "Full Name is required." };
    if (!username) return { success: false, error: "Username is required." };
    if (!password || password.length < 6) return { success: false, error: "Password must be at least 6 characters." };

    // Check duplicate username
    const existingUser = await db.select().from(users).where(eq(users.username, username)).get();
    if (existingUser) {
      return { success: false, error: `Username "${username}" is already taken.` };
    }

    // Resolve or seed internal_business_admin role for tenant
    let internalRole = await db
      .select()
      .from(roles)
      .where(and(eq(roles.tenantId, tenantId), eq(roles.slug, "internal_business_admin")))
      .get();

    if (!internalRole) {
      const roleId = crypto.randomUUID();
      await db.insert(roles).values({
        id: roleId,
        name: "Internal Business Administrator",
        slug: "internal_business_admin",
        description: "Hidden internal administrator role for business support and audit.",
        scope: "BUSINESS",
        tenantId,
        isSystem: true,
        isInternal: true,
      });
      internalRole = await db.select().from(roles).where(eq(roles.id, roleId)).get();
    }

    const userId = crypto.randomUUID();
    const employeeId = crypto.randomUUID();
    const passwordHash = await argon2.hash(password);

    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "Internal";
    const lastName = nameParts.slice(1).join(" ") || "Admin";

    // 1. Insert User (with isInternal = true)
    await db.insert(users).values({
      id: userId,
      username,
      passwordHash,
      firstName,
      lastName,
      userType: "BUSINESS",
      status: "ACTIVE",
      mustChangePassword: false,
      isInternal: true,
    });

    // 2. Insert UserRole
    if (internalRole) {
      await db.insert(userRoles).values({
        userId,
        roleId: internalRole.id,
        tenantId,
      });
    }

    // 3. Insert Employee (with isInternal = true)
    await db.insert(employees).values({
      id: employeeId,
      tenantId,
      empId: `INT-${Math.floor(100 + Math.random() * 900)}`,
      fullName,
      mobile: mobile || "01700000000",
      email: email || null,
      designation: "Internal Business Administrator",
      joinDate: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      isInternal: true,
      userId,
    });

    // 4. Log Audit Entry
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: adminCtx.userId,
      tenantId,
      action: "CREATE_INTERNAL_ADMIN",
      category: "SECURITY",
      severity: "WARNING",
      resource: "USER",
      resourceId: userId,
      details: `Platform Super Admin created Internal Business Administrator account "${username}" for tenant ${tenantId}.`,
    });

    revalidatePath(`/platform/tenants/${tenantId}`);
    return { success: true, userId };
  } catch (error: any) {
    console.error("[createInternalAdminAction Error]:", error);
    return { success: false, error: error.message || "Failed to create Internal Business Administrator." };
  }
}

export async function toggleInternalAdminStatusAction(tenantId: string, id: string) {
  try {
    const adminCtx = await verifySuperAdmin();
    if (!adminCtx) return { success: false, error: "Unauthorized." };

    const u = await db.select().from(users).where(eq(users.id, id)).get();
    if (!u || !u.isInternal) return { success: false, error: "Internal Administrator not found." };

    const newStatus = u.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await db.update(users).set({ status: newStatus, updatedAt: new Date() }).where(eq(users.id, id));
    await db.update(employees).set({ status: newStatus, updatedAt: new Date() }).where(eq(employees.userId, id));

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: adminCtx.userId,
      tenantId,
      action: "TOGGLE_INTERNAL_ADMIN_STATUS",
      category: "SECURITY",
      severity: "WARNING",
      resource: "USER",
      resourceId: id,
      details: `Platform Super Admin updated status for Internal Admin "${u.username}" to ${newStatus}.`,
    });

    revalidatePath(`/platform/tenants/${tenantId}`);
    return { success: true, newStatus };
  } catch (error: any) {
    console.error("[toggleInternalAdminStatusAction Error]:", error);
    return { success: false, error: error.message || "Failed to update status." };
  }
}

export async function deleteInternalAdminAction(tenantId: string, id: string) {
  try {
    const adminCtx = await verifySuperAdmin();
    if (!adminCtx) return { success: false, error: "Unauthorized." };

    const u = await db.select().from(users).where(eq(users.id, id)).get();
    if (!u || !u.isInternal) return { success: false, error: "Internal Administrator not found." };

    await db.delete(employees).where(eq(employees.userId, id));
    await db.delete(userRoles).where(eq(userRoles.userId, id));
    await db.delete(users).where(eq(users.id, id));

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: adminCtx.userId,
      tenantId,
      action: "DELETE_INTERNAL_ADMIN",
      category: "SECURITY",
      severity: "WARNING",
      resource: "USER",
      resourceId: id,
      details: `Platform Super Admin deleted Internal Admin "${u.username}" from tenant ${tenantId}.`,
    });

    revalidatePath(`/platform/tenants/${tenantId}`);
    return { success: true };
  } catch (error: any) {
    console.error("[deleteInternalAdminAction Error]:", error);
    return { success: false, error: error.message || "Failed to delete Internal Business Administrator." };
  }
}

export async function logInternalAdminAuditAction(tenantId: string, action: string, details: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return;

    const u = await db.select().from(users).where(eq(users.id, token)).get();
    if (!u || !u.isInternal) return;

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId: token,
      tenantId,
      action: `INTERNAL_ADMIN_${action.toUpperCase()}`,
      category: "INTERNAL_ADMIN_AUDIT",
      severity: "INFO",
      resource: "BUSINESS_MODULE",
      details: `[Internal Admin Audit] User "${u.username}": ${details}`,
    });
  } catch (error) {
    console.error("[logInternalAdminAuditAction Error]:", error);
  }
}
