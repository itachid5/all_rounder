import { db } from "@/shared/db/database";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessions } from "@/platform/db/schema/sessions";
import { users } from "@/platform/db/schema";

export async function getTenantId(): Promise<{ tenantId: string; userId: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;
  
  if (!token || !sessionToken) {
    redirect('/business-login');
  }
  
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionToken)).get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) {
    redirect('/business-login');
  }

  const user = await db.select().from(users).where(eq(users.id, token)).get();
  if (!user || user.status !== 'ACTIVE') {
    redirect('/business-login');
  }
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) {
    throw new Error("No tenant found");
  }
  
  return { tenantId: userRoleInfo.tenantId, userId: token };
}
