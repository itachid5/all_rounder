"use server";

import { db } from "@/shared/db/database";
import { tenants, users, userRoles, roles, sessions, auditLogs } from "@/platform/db/schema";
import { employees } from "@/templates/egg-tasta/db/schema";
import { eq, and, or, inArray, not } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import crypto from "crypto";
import * as argon2 from "argon2";

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

export async function getTenantUsersAction(tenantId: string) {
  try {
    await verifyPlatformAdmin();
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    if (!tenant) throw new Error("Business not found.");

    // Get all users associated with this tenant
    // 1. Owner
    const ownerId = tenant.ownerId;
    
    // 2. Users in userRoles for this tenant
    const uRoles = await db.select().from(userRoles).where(eq(userRoles.tenantId, tenantId));
    const roleUserIds = uRoles.map(r => r.userId);
    
    // 3. Employees
    const emps = await db.select().from(employees).where(eq(employees.tenantId, tenantId));
    const empUserIds = emps.map(e => e.userId).filter(Boolean) as string[];

    const allUserIds = Array.from(new Set([ownerId, ...roleUserIds, ...empUserIds])).filter(Boolean) as string[];

    if (allUserIds.length === 0) return { success: true, users: [] };

    // Fetch the users
    const usersData = await db.select().from(users).where(inArray(users.id, allUserIds));

    // Get their roles
    const rolesData = await db.select().from(roles).where(eq(roles.tenantId, tenantId));
    const rolesMap = new Map(rolesData.map(r => [r.id, r.name]));

    const result = usersData.map(u => {
      // Find their role in this tenant
      const userRoleMappings = uRoles.filter(ur => ur.userId === u.id);
      const roleNames = userRoleMappings.map(ur => rolesMap.get(ur.roleId)).filter(Boolean);
      
      let assignedRole = roleNames.join(", ");
      if (u.id === ownerId) {
        assignedRole = assignedRole ? `Business Owner, ${assignedRole}` : "Business Owner";
      }
      if (!assignedRole && u.isInternal) {
        assignedRole = "Hidden Internal Admin";
      }
      if (!assignedRole) {
        assignedRole = "Employee";
      }

      // Find their employee record
      const emp = emps.find(e => e.userId === u.id);

      return {
        id: u.id,
        empId: emp?.empId || "-",
        fullName: `${u.firstName} ${u.lastName}`.trim(),
        username: u.username,
        email: emp?.email || "-",
        phone: emp?.mobile || "-",
        assignedRole,
        status: u.status,
        lastLogin: u.lastLoginAt,
        createdAt: u.createdAt,
        isInternal: u.isInternal,
        isOwner: u.id === ownerId
      };
    });

    return { success: true, users: result };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function logAction(adminId: string, tenantId: string, action: string, targetUserId: string, details: any) {
  let ipAddress = 'unknown';
  try {
    const headersList = await headers();
    ipAddress = headersList.get('x-forwarded-for') || 'unknown';
  } catch (e) {}

  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    userId: adminId,
    tenantId,
    action,
    category: 'USER_MANAGEMENT',
    severity: 'WARNING',
    resource: 'User',
    resourceId: targetUserId,
    details: JSON.stringify(details),
    ipAddress,
    userAgent: 'Platform Admin Portal'
  });
}

export async function resetUserPasswordAction(tenantId: string, userId: string, newPassword: string) {
  try {
    const admin = await verifyPlatformAdmin();
    if (admin.id === userId) throw new Error("Cannot modify your own platform admin account here.");

    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!targetUser || targetUser.userType === 'PLATFORM') {
      throw new Error("Cannot modify this user.");
    }
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    const isOwner = tenant?.ownerId === userId;
    if (!targetUser.isInternal && !isOwner) {
      throw new Error("Super Admin can only reset passwords for Business Owners and Hidden Internal Admins.");
    }

    const passwordHash = await argon2.hash(newPassword);

    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash, mustChangePassword: true }).where(eq(users.id, userId));
      await tx.delete(sessions).where(eq(sessions.userId, userId));
      await logAction(admin.id, tenantId, 'PASSWORD_RESET', userId, { reason: "Forced reset by Platform Admin" });
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeUsernameAction(tenantId: string, userId: string, newUsername: string) {
  try {
    const admin = await verifyPlatformAdmin();
    if (admin.id === userId) throw new Error("Cannot modify your own platform admin account here.");

    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!targetUser || targetUser.userType === 'PLATFORM') {
      throw new Error("Cannot modify this user.");
    }
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    const isOwner = tenant?.ownerId === userId;
    if (!targetUser.isInternal && !isOwner) {
      throw new Error("Super Admin can only modify Business Owners and Hidden Internal Admins.");
    }

    const normalizedUsername = newUsername.trim().toLowerCase();
    
    // Check uniqueness
    const existing = await db.select().from(users).where(eq(users.username, normalizedUsername)).get();
    if (existing && existing.id !== userId) {
      throw new Error("Username already taken.");
    }

    await db.transaction(async (tx) => {
      await tx.update(users).set({ username: normalizedUsername }).where(eq(users.id, userId));
      await logAction(admin.id, tenantId, 'USERNAME_CHANGED', userId, { oldUsername: targetUser.username, newUsername: normalizedUsername });
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function changeUserStatusAction(tenantId: string, userId: string, newStatus: string) {
  try {
    const admin = await verifyPlatformAdmin();
    if (admin.id === userId) throw new Error("Cannot modify your own platform admin account here.");

    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!targetUser || targetUser.userType === 'PLATFORM') {
      throw new Error("Cannot modify this user.");
    }
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    const isOwner = tenant?.ownerId === userId;
    if (!targetUser.isInternal && !isOwner) {
      throw new Error("Super Admin can only modify Business Owners and Hidden Internal Admins.");
    }

    await db.transaction(async (tx) => {
      await tx.update(users).set({ status: newStatus }).where(eq(users.id, userId));
      
      // If suspended or locked, kill sessions
      if (newStatus !== 'ACTIVE') {
        await tx.delete(sessions).where(eq(sessions.userId, userId));
      }

      await logAction(admin.id, tenantId, 'STATUS_CHANGED', userId, { oldStatus: targetUser.status, newStatus });
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function forceLogoutAction(tenantId: string, userId: string) {
  try {
    const admin = await verifyPlatformAdmin();
    if (admin.id === userId) throw new Error("Cannot force logout yourself here.");

    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get();
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    const isOwner = tenant?.ownerId === userId;
    if (targetUser && !targetUser.isInternal && !isOwner) {
      throw new Error("Super Admin can only modify Business Owners and Hidden Internal Admins.");
    }

    await db.transaction(async (tx) => {
      await tx.delete(sessions).where(eq(sessions.userId, userId));
      await logAction(admin.id, tenantId, 'FORCE_LOGOUT', userId, {});
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeUserFromTenantAction(tenantId: string, userId: string) {
  try {
    const admin = await verifyPlatformAdmin();
    if (admin.id === userId) throw new Error("Cannot remove yourself here.");

    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    if (!tenant) throw new Error("Tenant not found.");
    if (tenant.ownerId === userId) throw new Error("Cannot remove the Business Owner. Change ownership first or delete the business.");

    const targetUser = await db.select().from(users).where(eq(users.id, userId)).get();
    if (!targetUser || targetUser.userType === 'PLATFORM') {
      throw new Error("Cannot modify this user.");
    }
    if (!targetUser.isInternal) {
      throw new Error("Super Admin can only remove Hidden Internal Admins. Business Owners cannot be removed, and regular employees are managed by the Business Owner.");
    }

    await db.transaction(async (tx) => {
      // Remove from userRoles in this tenant
      await tx.delete(userRoles).where(and(eq(userRoles.tenantId, tenantId), eq(userRoles.userId, userId)));
      
      // Remove userId link from employees in this tenant
      await tx.update(employees).set({ userId: null }).where(and(eq(employees.tenantId, tenantId), eq(employees.userId, userId)));

      // Check if user has other dependencies
      const otherRoles = await tx.select().from(userRoles).where(eq(userRoles.userId, userId));
      const otherTenants = await tx.select().from(tenants).where(eq(tenants.ownerId, userId));
      const otherEmps = await tx.select().from(employees).where(eq(employees.userId, userId));

      if (otherRoles.length === 0 && otherTenants.length === 0 && otherEmps.length === 0) {
        // User is fully orphaned, safe to delete entirely
        await tx.delete(sessions).where(eq(sessions.userId, userId));
        await tx.delete(users).where(eq(users.id, userId));
        await logAction(admin.id, tenantId, 'DELETED_USER', userId, { reason: "User fully deleted from platform" });
      } else {
        await tx.delete(sessions).where(eq(sessions.userId, userId)); // Force re-login
        await logAction(admin.id, tenantId, 'REMOVED_USER_FROM_TENANT', userId, { reason: "User removed from business" });
      }
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
