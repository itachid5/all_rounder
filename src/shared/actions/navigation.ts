import { db } from "@/shared/db/database";
import { users, userRoles, tenants, templateNavigations, templates } from "@/platform/db/schema";

import { eq, and, asc, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessions } from "@/platform/db/schema/sessions";
import { NavItem } from "@/templates/egg-tasta/components/sidebar";

import { getCurrentUserPermissionsAction } from "./rbac";

export async function getBusinessNavigation(): Promise<NavItem[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!token || !sessionToken) return [];

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionToken)).get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) return [];

  const user = await db.select().from(users).where(eq(users.id, token)).get();
  if (!user || user.status !== 'ACTIVE') return [];

  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, user.id)).get();
  if (!userRoleInfo?.tenantId) return [];
  
  const tenant = await db.select().from(tenants).where(eq(tenants.id, userRoleInfo.tenantId)).get();
  if (!tenant?.templateId) return [];

  const userPermsRes = await getCurrentUserPermissionsAction();
  const userPerms = userPermsRes.permissions || [];
  const isOwner = userPermsRes.isOwner;

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

  // Route to Permission Mapping
  const routePermMap: Record<string, string> = {
    '/app/dashboard': 'view:dashboard',
    '/app/products': 'view:products',
    '/app/suppliers': 'view:suppliers',
    '/app/supplier-payments': 'view:supplier_payments',
    '/app/customers': 'view:customers',
    '/app/customer-collection': 'view:customer_collections',
    '/app/purchases': 'view:purchases',
    '/app/sales': 'view:sales',
    '/app/sales-return': 'view:sales_returns',
    '/app/inventory': 'view:inventory',
    '/app/expenses': 'view:expenses',
    '/app/cashbook': 'view:cashbook',
    '/app/reports': 'view:reports',
    '/app/users': 'view:users',
    '/app/data': 'view:data_management',
    '/app/settings/branding': 'view:branding',
    '/app/settings': 'view:settings',
    '/app/profile': 'view:profile',
  };

  const hasAccessToRoute = (route?: string | null) => {
    if (isOwner) return true;
    if (!route || route === '#') return true;

    // Find matching route prefix
    for (const [rPrefix, requiredPerm] of Object.entries(routePermMap)) {
      if (route === rPrefix || route.startsWith(rPrefix + '/')) {
        return userPerms.includes(requiredPerm);
      }
    }
    return true;
  };

  // Build the tree
  const itemsMap = new Map<string, any>();
  navItems.forEach(item => {
    if (hasAccessToRoute(item.route)) {
      itemsMap.set(item.id, {
        label: item.name,
        href: item.route || '#',
        icon: item.icon,
        parentId: item.parentId,
        subItems: []
      });
    }
  });

  const rootItems: NavItem[] = [];

  itemsMap.forEach(item => {
    if (item.parentId) {
      const parent = itemsMap.get(item.parentId);
      if (parent) {
        parent.subItems.push(item);
      }
    } else {
      rootItems.push(item);
    }
  });

  // Filter out empty parent categories if no subItems remain accessible
  return rootItems.filter(item => item.href !== '#' || (item.subItems && item.subItems.length > 0));
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!token || !sessionToken) return { username: "Guest" };
  
  const session = await db.select().from(sessions).where(eq(sessions.id, sessionToken)).get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) return { username: "Guest" };

  const user = await db.select().from(users).where(eq(users.id, token)).get();
  return user || { username: "Guest" };
}

export async function getTemplateSlug(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!token || !sessionToken) return 'egg-shop';

  const session = await db.select().from(sessions).where(eq(sessions.id, sessionToken)).get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) return 'egg-shop';

  const userRoleInfo = await db.select().from(userRoles).where(eq(userRoles.userId, token)).get();
  if (!userRoleInfo?.tenantId) return 'egg-shop';

  const tenant = await db.select().from(tenants).where(eq(tenants.id, userRoleInfo.tenantId)).get();
  if (!tenant?.templateId) return 'egg-shop';

  const template = await db.select().from(templates).where(eq(templates.id, tenant.templateId)).get();
  return template?.slug || 'egg-shop';
}
