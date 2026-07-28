import { db } from "@/shared/db/database";
import { userRoles } from "@/platform/db/schema";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function getTenantId(): Promise<{ tenantId: string; userId: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error("Not authenticated");
  
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) throw new Error("No tenant found");
  
  return { tenantId: userRoleInfo.tenantId, userId: token };
}
