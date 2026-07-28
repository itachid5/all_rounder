import { db } from "@/db";
import { users, userRoles, tenants, templateNavigations, templates } from "@/db/schema";
import { eq, and, asc, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { NavItem } from "@/components/business/sidebar";

export async function getBusinessNavigation(): Promise<NavItem[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return [];

  // Find the user's template config
  const user = await db.select().from(users).where(eq(users.id, token)).get();
  if (!user) return [];

  // Find their tenant
  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, user.id)).get();
  if (!userRoleInfo?.tenantId) return [];
  
  const tenant = await db.select().from(tenants).where(eq(tenants.id, userRoleInfo.tenantId)).get();
  if (!tenant?.templateId) return [];

  // Fetch navigation items from DB
  const navItems = await db.select()
    .from(templateNavigations)
    .where(
      and(
        eq(templateNavigations.templateId, tenant.templateId),
        eq(templateNavigations.isActive, true)
      )
    )
    .orderBy(asc(templateNavigations.sortOrder));

  // Build the tree
  // 1. Map all items by ID for quick access
  const itemsMap = new Map<string, any>();
  navItems.forEach(item => {
    itemsMap.set(item.id, {
      label: item.name,
      href: item.route || '#',
      icon: item.icon,
      parentId: item.parentId,
      subItems: []
    });
  });

  const rootItems: NavItem[] = [];

  // 2. Assign children to parents
  itemsMap.forEach(item => {
    if (item.parentId) {
      const parent = itemsMap.get(item.parentId);
      if (parent) {
        parent.subItems.push(item);
      } else {
        // If parent not found but has parentId, it's either orphaned or parent is inactive
        // We'll skip it for now, or you could push to rootItems if you want orphans at root
      }
    } else {
      rootItems.push(item);
    }
  });

  return rootItems;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return { username: "Guest" };
  const user = await db.select().from(users).where(eq(users.id, token)).get();
  return user || { username: "Guest" };
}

export async function getTemplateSlug(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) return 'egg-shop';

  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) return 'egg-shop';

  const tenant = await db.select().from(tenants).where(eq(tenants.id, userRoleInfo.tenantId)).get();
  if (!tenant?.templateId) return 'egg-shop';

  const template = await db.select().from(templates).where(eq(templates.id, tenant.templateId)).get();
  return template?.slug || 'egg-shop';
}
