"use server";

import { db } from "@/shared/db/database";
import { roles, permissions, rolePermissions, userRoles, users, tenants } from "@/platform/db/schema";
import { employees } from "@/templates/egg-tasta/db/schema/employees";
import { eq, and, inArray, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { sessions } from "@/platform/db/schema/sessions";
import crypto from "crypto";

import { cache } from "react";

const getSessionContext = cache(async (): Promise<{ userId: string; tenantId: string } | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const sessionToken = cookieStore.get("session-token")?.value;
  if (!token || !sessionToken) return null;

  const session = await db.select({ id: sessions.id, userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.id, sessionToken))
    .get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) return null;

  const user = await db.select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.id, token))
    .get();
  if (!user || user.status !== 'ACTIVE') return null;

  // 1. Check if user is owner of a tenant
  const ownedTenant = await db.select({ id: tenants.id }).from(tenants).where(eq(tenants.ownerId, token)).get();
  if (ownedTenant) {
    return { userId: token, tenantId: ownedTenant.id };
  }

  // 2. Check userRoles
  const userRoleInfo = await db.select({ tenantId: userRoles.tenantId }).from(userRoles).where(eq(userRoles.userId, token)).get();
  if (userRoleInfo?.tenantId) {
    return { userId: token, tenantId: userRoleInfo.tenantId };
  }

  // 3. Check employees
  const emp = await db.select({ tenantId: employees.tenantId }).from(employees).where(eq(employees.userId, token)).get();
  if (emp?.tenantId) {
    return { userId: token, tenantId: emp.tenantId };
  }

  return null;
});

export const getCurrentUserPermissionsAction = cache(async (): Promise<{
  success: boolean;
  permissions: string[];
  isOwner: boolean;
}> => {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { success: false, permissions: [], isOwner: false };

    const tenant = await db.select({ ownerId: tenants.ownerId }).from(tenants).where(eq(tenants.id, ctx.tenantId)).get();
    const isTenantOwner = tenant?.ownerId === ctx.userId;

    const user = await db.select({ userType: users.userType, isInternal: users.isInternal }).from(users).where(eq(users.id, ctx.userId)).get();
    const isPlatformAdmin = user?.userType === 'PLATFORM';

    // Get user roles
    const uRoles = await db.select({ roleId: userRoles.roleId }).from(userRoles).where(eq(userRoles.userId, ctx.userId)).all();
    const roleIds = uRoles.map((ur) => ur.roleId);
    const dbRoles = roleIds.length > 0 ? await db.select({ slug: roles.slug, isInternal: roles.isInternal }).from(roles).where(inArray(roles.id, roleIds)).all() : [];

    // Check if Business Owner, Internal Admin, or Super Admin
    const isOwner = isTenantOwner || isPlatformAdmin || Boolean(user?.isInternal) || dbRoles.some(
      (r) =>
        r.slug === "business_owner" ||
        r.slug === "internal_business_admin" ||
        r.slug === "super_admin" ||
        r.slug === "platform_admin" ||
        r.isInternal
    );

    if (isOwner) {
      // Business Owners, Internal Admins, and Super Admins receive ALL permissions automatically
      const allPerms = await db.select({ slug: permissions.slug }).from(permissions).all();
      return {
        success: true,
        permissions: allPerms.map((p) => p.slug),
        isOwner: true,
      };
    }

    if (roleIds.length === 0) {
      return { success: true, permissions: [], isOwner: false };
    }

    // Otherwise load assigned permissions for employee's assigned roles
    const rPerms = await db
      .select({ slug: permissions.slug })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(inArray(rolePermissions.roleId, roleIds))
      .all();

    const permSlugs = Array.from(new Set(rPerms.map((p) => p.slug)));
    return { success: true, permissions: permSlugs, isOwner: false };
  } catch (error: any) {
    console.error("[getCurrentUserPermissionsAction Error]:", error);
    return { success: false, permissions: [], isOwner: false };
  }
});

export async function requirePermissionAction(permissionSlug: string): Promise<void> {
  const permsRes = await getCurrentUserPermissionsAction();
  if (permsRes.isOwner) return;
  if (!permsRes.success || !permsRes.permissions.includes(permissionSlug)) {
    throw new Error("403 - Forbidden: You do not have permission for this action.");
  }
}

export async function requireAnyPermissionAction(permissionSlugs: string[]): Promise<void> {
  const permsRes = await getCurrentUserPermissionsAction();
  if (permsRes.isOwner) return;
  if (!permsRes.success || !permissionSlugs.some((p) => permsRes.permissions.includes(p))) {
    throw new Error("403 - Forbidden: You do not have permission for this action.");
  }
}

export async function getRolesAction() {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { success: false, error: "Unauthorized", data: [] };

    // Fetch tenant roles directly via DB query
    const tenantRoles = await db.select()
      .from(roles)
      .where(
        and(
          eq(roles.isInternal, false),
          or(eq(roles.tenantId, ctx.tenantId), eq(roles.isSystem, true))
        )
      )
      .all();

    if (tenantRoles.length === 0) {
      return { success: true, data: [] };
    }

    const roleIds = tenantRoles.map((r) => r.id);

    // Batch fetch user counts and role permissions in 2 bulk queries instead of 2*N queries
    const [allUserRoles, allRolePerms] = await Promise.all([
      db.select({ roleId: userRoles.roleId })
        .from(userRoles)
        .where(and(inArray(userRoles.roleId, roleIds), eq(userRoles.tenantId, ctx.tenantId)))
        .all(),
      db.select({ roleId: rolePermissions.roleId, permissionId: rolePermissions.permissionId })
        .from(rolePermissions)
        .where(inArray(rolePermissions.roleId, roleIds))
        .all(),
    ]);

    const userCountMap = new Map<string, number>();
    allUserRoles.forEach((ur) => {
      userCountMap.set(ur.roleId, (userCountMap.get(ur.roleId) || 0) + 1);
    });

    const permMap = new Map<string, string[]>();
    allRolePerms.forEach((rp) => {
      const existing = permMap.get(rp.roleId) || [];
      existing.push(rp.permissionId);
      permMap.set(rp.roleId, existing);
    });

    const result = tenantRoles.map((role) => ({
      id: role.id,
      name: role.name,
      slug: role.slug,
      description: role.description || "",
      isSystem: role.isSystem,
      userCount: userCountMap.get(role.id) || 0,
      permissionIds: permMap.get(role.id) || [],
    }));

    return { success: true, data: result };
  } catch (error: any) {
    console.error("[getRolesAction Error]:", error);
    return { success: false, error: error.message, data: [] };
  }
}

export async function getAllPermissionsAction() {
  try {
    const allPerms = await db.select().from(permissions).all();
    
    // Group permissions by module (group)
    const grouped: Record<string, typeof allPerms> = {};
    allPerms.forEach((p) => {
      if (!grouped[p.group]) grouped[p.group] = [];
      grouped[p.group].push(p);
    });

    return { success: true, permissions: allPerms, grouped };
  } catch (error: any) {
    console.error("[getAllPermissionsAction Error]:", error);
    return { success: false, error: error.message, permissions: [], grouped: {} };
  }
}

export async function createRoleAction(name: string, description: string, permissionIds: string[]) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { success: false, error: "Unauthorized" };

    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, error: "Role name is required." };

    const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    const roleId = crypto.randomUUID();

    // Check duplicate role slug for tenant
    const existing = await db.select().from(roles).all();
    const isDuplicate = existing.some((r) => r.tenantId === ctx.tenantId && r.slug === slug);

    if (isDuplicate) {
      return { success: false, error: `A role with name "${trimmedName}" already exists.` };
    }

    await db.insert(roles).values({
      id: roleId,
      name: trimmedName,
      slug,
      description: description || null,
      scope: "BUSINESS",
      tenantId: ctx.tenantId,
      isSystem: false,
      isInternal: false,
    });

    // Assign permissions
    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((pId) => ({
          roleId,
          permissionId: pId,
        }))
      );
    }

    revalidatePath("/app/users/roles");
    revalidatePath("/app/roles");
    return { success: true, roleId };
  } catch (error: any) {
    console.error("[createRoleAction Error]:", error);
    return { success: false, error: error.message || "Failed to create role." };
  }
}

export async function updateRolePermissionsAction(roleId: string, permissionIds: string[]) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { success: false, error: "Unauthorized" };

    const role = await db.select().from(roles).where(eq(roles.id, roleId)).get();
    if (!role) return { success: false, error: "Role not found." };

    if (role.isInternal || (role.tenantId && role.tenantId !== ctx.tenantId)) {
      return { success: false, error: "Unauthorized" };
    }

    // Delete existing permissions for role
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

    // Re-insert selected permissions
    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(
        permissionIds.map((pId) => ({
          roleId,
          permissionId: pId,
        }))
      );
    }

    revalidatePath("/app", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("[updateRolePermissionsAction Error]:", error);
    return { success: false, error: error.message || "Failed to update permissions." };
  }
}

export async function duplicateRoleAction(roleId: string) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { success: false, error: "Unauthorized" };

    const sourceRole = await db.select().from(roles).where(eq(roles.id, roleId)).get();
    if (!sourceRole || sourceRole.isInternal) return { success: false, error: "Source role not found." };
    if (sourceRole.tenantId && sourceRole.tenantId !== ctx.tenantId) {
      return { success: false, error: "Unauthorized" };
    }

    const sourcePerms = await db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId)).all();
    const permIds = sourcePerms.map((p) => p.permissionId);

    const newName = `${sourceRole.name} (Copy)`;
    return await createRoleAction(newName, sourceRole.description || "", permIds);
  } catch (error: any) {
    console.error("[duplicateRoleAction Error]:", error);
    return { success: false, error: error.message || "Failed to duplicate role." };
  }
}

export async function deleteRoleAction(roleId: string) {
  try {
    const ctx = await getSessionContext();
    if (!ctx) return { success: false, error: "Unauthorized" };

    const role = await db.select().from(roles).where(eq(roles.id, roleId)).get();
    if (!role || role.isInternal) return { success: false, error: "Role not found." };
    if (role.tenantId && role.tenantId !== ctx.tenantId) {
      return { success: false, error: "Unauthorized" };
    }

    if (role.isSystem || role.slug === "business_owner") {
      return { success: false, error: "System protected roles cannot be deleted." };
    }

    // Check if role is assigned to active users
    const assignedUsers = await db.select().from(userRoles).where(eq(userRoles.roleId, roleId)).all();
    if (assignedUsers.length > 0) {
      return {
        success: false,
        error: `Cannot delete role "${role.name}" because it is currently assigned to ${assignedUsers.length} employee(s). Please reassign those employees first.`
      };
    }

    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    await db.delete(roles).where(eq(roles.id, roleId));

    revalidatePath("/app/users/roles");
    revalidatePath("/app/roles");
    return { success: true };
  } catch (error: any) {
    console.error("[deleteRoleAction Error]:", error);
    return { success: false, error: error.message || "Failed to delete role." };
  }
}
