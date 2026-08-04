import { db } from "@/shared/db/database";
import { users, userRoles, tenants, templateNavigations, templates } from "@/platform/db/schema";

import { eq, and, asc, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sessions } from "@/platform/db/schema/sessions";
import { NavItem } from "@/templates/egg-tasta/components/sidebar";

import { getCurrentUserPermissionsAction } from "./rbac";

import { getTenantId } from "@/shared/utils/auth";

const DEFAULT_BUSINESS_NAV: NavItem[] = [
  { label: "Dashboard", href: "/app/dashboard", icon: "dashboard" },
  {
    label: "Products",
    href: "#",
    icon: "layers",
    subItems: [
      { label: "Add Product", href: "/app/products/new" },
      { label: "Manage Products", href: "/app/products/manage" },
      { label: "Product List", href: "/app/products/list" },
    ],
  },
  {
    label: "Suppliers",
    href: "#",
    icon: "users",
    subItems: [
      { label: "Add Supplier", href: "/app/suppliers/new" },
      { label: "Manage Suppliers", href: "/app/suppliers/manage" },
      { label: "Supplier Due", href: "/app/suppliers/due" },
      { label: "Supplier Ledger", href: "/app/suppliers/ledger" },
    ],
  },
  {
    label: "Supplier Payments",
    href: "#",
    icon: "DollarSign",
    subItems: [
      { label: "Add Payment", href: "/app/supplier-payments/new" },
      { label: "Manage Payments", href: "/app/supplier-payments/manage" },
      { label: "Payment Ledger", href: "/app/supplier-payments/ledger" },
    ],
  },
  {
    label: "Customers",
    href: "#",
    icon: "users",
    subItems: [
      { label: "Add Customer", href: "/app/customers/new" },
      { label: "Manage Customers", href: "/app/customers/manage" },
      { label: "Customer Ledger", href: "/app/customers/ledger" },
      { label: "Customer Due List", href: "/app/customers/due" },
    ],
  },
  {
    label: "Customer Collection",
    href: "#",
    icon: "HandCoins",
    subItems: [
      { label: "Add Collection", href: "/app/customer-collection/new" },
      { label: "Manage Collections", href: "/app/customer-collection/manage" },
      { label: "Collection Ledger", href: "/app/customer-collection/ledger" },
    ],
  },
  {
    label: "Purchases",
    href: "#",
    icon: "WalletCards",
    subItems: [
      { label: "Add Purchase", href: "/app/purchases/new" },
      { label: "Manage Purchases", href: "/app/purchases/manage" },
      { label: "Purchase Ledger", href: "/app/purchases/ledger" },
    ],
  },
  {
    label: "Sales",
    href: "#",
    icon: "DollarSign",
    subItems: [
      { label: "Add Sale", href: "/app/sales/new" },
      { label: "Manage Sales", href: "/app/sales/manage" },
      { label: "Sales Report", href: "/app/sales/report" },
    ],
  },
  {
    label: "Sales Return",
    href: "#",
    icon: "MoveRight",
    subItems: [
      { label: "Add Sales Return", href: "/app/sales-return/new" },
      { label: "Manage Sales Return", href: "/app/sales-return/manage" },
      { label: "Sales Return Report", href: "/app/sales-return/report" },
    ],
  },
  { label: "Inventory", href: "/app/inventory/adjustment", icon: "Database" },
  {
    label: "Expenses",
    href: "#",
    icon: "DollarSign",
    subItems: [
      { label: "Add Expense Head", href: "/app/expenses/heads" },
      { label: "Add Expense", href: "/app/expenses/new" },
      { label: "Manage Expenses", href: "/app/expenses/manage" },
      { label: "Expense Report", href: "/app/expenses/report" },
    ],
  },
  { label: "Cashbook", href: "/app/cashbook", icon: "WalletCards" },
  { label: "General Ledger", href: "/app/ledger", icon: "HandCoins" },
  { label: "Reports", href: "/app/reports/dashboard", icon: "activity" },
  { label: "User Management", href: "/app/users/manage", icon: "users" },
  { label: "Data Management", href: "/app/data/backup", icon: "Database" },
  { label: "Settings", href: "/app/settings", icon: "settings" },
];

import { cache } from "react";

export const getBusinessNavigation = cache(async (): Promise<NavItem[]> => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!token || !sessionToken) return DEFAULT_BUSINESS_NAV;

  const session = await db.select({ id: sessions.id, userId: sessions.userId, expiresAt: sessions.expiresAt }).from(sessions).where(eq(sessions.id, sessionToken)).get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) return DEFAULT_BUSINESS_NAV;

  const user = await db.select({ id: users.id, status: users.status }).from(users).where(eq(users.id, token)).get();
  if (!user || user.status !== 'ACTIVE') return DEFAULT_BUSINESS_NAV;

  let tenantId: string;
  try {
    const res = await getTenantId();
    tenantId = res.tenantId;
  } catch {
    return DEFAULT_BUSINESS_NAV;
  }
  
  const tenant = await db.select({ templateId: tenants.templateId }).from(tenants).where(eq(tenants.id, tenantId)).get();
  if (!tenant?.templateId) return DEFAULT_BUSINESS_NAV;

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

  const itemsToBuild = navItems.length > 0 ? navItems : (() => {
    const flat: any[] = [];
    DEFAULT_BUSINESS_NAV.forEach((d, i) => {
      const parentId = `default-${i}`;
      flat.push({
        id: parentId,
        templateId: tenant.templateId,
        name: d.label,
        slug: d.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        icon: d.icon,
        route: d.href,
        sortOrder: i + 1,
        parentId: null,
        isActive: true,
      });
      if (d.subItems) {
        d.subItems.forEach((sub, subIdx) => {
          flat.push({
            id: `default-${i}-sub-${subIdx}`,
            templateId: tenant.templateId,
            name: sub.label,
            slug: sub.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            icon: sub.icon,
            route: sub.href,
            sortOrder: subIdx + 1,
            parentId: parentId,
            isActive: true,
          });
        });
      }
    });
    return flat;
  })();

  // Route to Permission Mapping for Employee Role Filtering
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
    '/app/settings': 'view:settings',
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
  itemsToBuild.forEach((item: any) => {
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

  const filtered = rootItems.filter(item => item.href !== '#' || (item.subItems && item.subItems.length > 0));
  return filtered.length > 0 ? filtered : DEFAULT_BUSINESS_NAV;
});

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const sessionToken = cookieStore.get('session-token')?.value;

  if (!token || !sessionToken) return { username: "Guest" };
  
  const session = await db.select({ id: sessions.id, userId: sessions.userId, expiresAt: sessions.expiresAt }).from(sessions).where(eq(sessions.id, sessionToken)).get();
  if (!session || session.userId !== token || session.expiresAt < new Date()) return { username: "Guest" };

  const user = await db.select({ id: users.id, username: users.username, firstName: users.firstName, lastName: users.lastName, avatarUrl: users.avatarUrl, userType: users.userType }).from(users).where(eq(users.id, token)).get();
  return user || { username: "Guest" };
});

export const getTemplateSlug = cache(async (): Promise<string> => {
  let tenantId: string;
  try {
    const res = await getTenantId();
    tenantId = res.tenantId;
  } catch {
    return 'egg-shop';
  }

  const tenant = await db.select({ templateId: tenants.templateId }).from(tenants).where(eq(tenants.id, tenantId)).get();
  if (!tenant?.templateId) return 'egg-shop';

  const template = await db.select({ slug: templates.slug }).from(templates).where(eq(templates.id, tenant.templateId)).get();
  return template?.slug || 'egg-shop';
});
