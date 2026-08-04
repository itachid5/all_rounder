import { cache } from "react";
import { db } from "@/shared/db/database";
import { userRoles, tenants, users } from "@/platform/db/schema";
import { employees } from "@/templates/egg-tasta/db/schema/employees";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessions } from "@/platform/db/schema/sessions";

export const getTenantId = cache(async (): Promise<{ tenantId: string; userId: string }> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;
  
  if (!token || !sessionToken) {
    redirect('/business-login');
  }
  
  const session = await db.select({ id: sessions.id, userId: sessions.userId, expiresAt: sessions.expiresAt })
    .from(sessions)
    .where(eq(sessions.id, sessionToken))
    .get();
    
  if (!session || session.userId !== token || session.expiresAt < new Date()) {
    redirect('/business-login');
  }

  const user = await db.select({ id: users.id, status: users.status })
    .from(users)
    .where(eq(users.id, token))
    .get();
    
  if (!user || user.status !== 'ACTIVE') {
    redirect('/business-login');
  }
  
  // 1. Check if user is owner of a tenant
  const ownedTenant = await db.select({ id: tenants.id })
    .from(tenants)
    .where(eq(tenants.ownerId, token))
    .get();
  if (ownedTenant) {
    return { tenantId: ownedTenant.id, userId: token };
  }

  // 2. Check userRoles
  const userRoleInfo = await db.select({ tenantId: userRoles.tenantId })
    .from(userRoles)
    .where(eq(userRoles.userId, token))
    .get();
  if (userRoleInfo?.tenantId) {
    return { tenantId: userRoleInfo.tenantId, userId: token };
  }

  // 3. Check employees
  const emp = await db.select({ tenantId: employees.tenantId })
    .from(employees)
    .where(eq(employees.userId, token))
    .get();
  if (emp?.tenantId) {
    return { tenantId: emp.tenantId, userId: token };
  }
  
  throw new Error("No tenant found for current user.");
});


