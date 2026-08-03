import { db } from '@/shared/db/database';
import * as platformSchema from "@/platform/db/schema";
import * as businessSchema from "@/templates/egg-tasta/db/schema";
const schema = { ...platformSchema, ...businessSchema };
import crypto from 'crypto';
import { eq, isNull, and } from 'drizzle-orm';
import * as argon2 from 'argon2';

async function seed() {
  console.log('Seeding database...');

  const businessModulePerms = [
    { slug: 'view:dashboard', name: 'View Dashboard', group: 'dashboard' },
    { slug: 'view:products', name: 'View Products', group: 'products' },
    { slug: 'create:products', name: 'Create Products', group: 'products' },
    { slug: 'edit:products', name: 'Edit Products', group: 'products' },
    { slug: 'delete:products', name: 'Delete Products', group: 'products' },
    { slug: 'view:suppliers', name: 'View Suppliers', group: 'suppliers' },
    { slug: 'create:suppliers', name: 'Create Suppliers', group: 'suppliers' },
    { slug: 'edit:suppliers', name: 'Edit Suppliers', group: 'suppliers' },
    { slug: 'delete:suppliers', name: 'Delete Suppliers', group: 'suppliers' },
    { slug: 'view:supplier_payments', name: 'View Supplier Payments', group: 'supplier_payments' },
    { slug: 'create:supplier_payments', name: 'Create Supplier Payments', group: 'supplier_payments' },
    { slug: 'delete:supplier_payments', name: 'Delete Supplier Payments', group: 'supplier_payments' },
    { slug: 'view:customers', name: 'View Customers', group: 'customers' },
    { slug: 'create:customers', name: 'Create Customers', group: 'customers' },
    { slug: 'edit:customers', name: 'Edit Customers', group: 'customers' },
    { slug: 'delete:customers', name: 'Delete Customers', group: 'customers' },
    { slug: 'view:customer_collections', name: 'View Customer Collections', group: 'customer_collections' },
    { slug: 'create:customer_collections', name: 'Create Customer Collections', group: 'customer_collections' },
    { slug: 'delete:customer_collections', name: 'Delete Customer Collections', group: 'customer_collections' },
    { slug: 'view:purchases', name: 'View Purchases', group: 'purchases' },
    { slug: 'create:purchases', name: 'Create Purchases', group: 'purchases' },
    { slug: 'delete:purchases', name: 'Delete Purchases', group: 'purchases' },
    { slug: 'view:sales', name: 'View Sales', group: 'sales' },
    { slug: 'create:sales', name: 'Create Sales', group: 'sales' },
    { slug: 'delete:sales', name: 'Delete Sales', group: 'sales' },
    { slug: 'view:sales_returns', name: 'View Sales Returns', group: 'sales_returns' },
    { slug: 'create:sales_returns', name: 'Create Sales Returns', group: 'sales_returns' },
    { slug: 'view:inventory', name: 'View Inventory', group: 'inventory' },
    { slug: 'adjust:inventory', name: 'Adjust Inventory', group: 'inventory' },
    { slug: 'view:expenses', name: 'View Expenses', group: 'expenses' },
    { slug: 'create:expenses', name: 'Create Expenses', group: 'expenses' },
    { slug: 'delete:expenses', name: 'Delete Expenses', group: 'expenses' },
    { slug: 'view:cashbook', name: 'View Cashbook', group: 'cashbook' },
    { slug: 'create:cashbook', name: 'Create Cashbook Account', group: 'cashbook' },
    { slug: 'view:reports', name: 'View Reports', group: 'reports' },
    { slug: 'view:users', name: 'View Users', group: 'users' },
    { slug: 'create:users', name: 'Create Users', group: 'users' },
    { slug: 'edit:users', name: 'Edit Users', group: 'users' },
    { slug: 'delete:users', name: 'Delete Users', group: 'users' },
    { slug: 'view:data_management', name: 'View Data Management', group: 'data_management' },
    { slug: 'view:settings', name: 'View Settings', group: 'settings' },
    { slug: 'edit:settings', name: 'Edit Settings', group: 'settings' },
    { slug: 'view:branding', name: 'View Branding', group: 'branding' },
    { slug: 'edit:branding', name: 'Edit Branding', group: 'branding' },
  ];

  for (const p of businessModulePerms) {
    const existing = await db.select().from(schema.permissions).where(eq(schema.permissions.slug, p.slug)).get();
    if (!existing) {
      await db.insert(schema.permissions).values({
        id: crypto.randomUUID(),
        name: p.name,
        slug: p.slug,
        description: `Can ${p.name}`,
        group: p.group,
        scope: 'BUSINESS',
        createdAt: new Date(),
      }).execute();
    }
  }

  // 2. Create roles
  const roles = [
    { name: 'Super Admin', slug: 'super_admin', scope: 'PLATFORM', isSystem: true },
    { name: 'Platform Admin', slug: 'platform_admin', scope: 'PLATFORM', isSystem: true },
    { name: 'Platform Manager', slug: 'platform_manager', scope: 'PLATFORM', isSystem: true },
    { name: 'Support', slug: 'support', scope: 'PLATFORM', isSystem: true },
    { name: 'Viewer', slug: 'viewer', scope: 'PLATFORM', isSystem: true },
  ];

  for (const r of roles) {
    const existing = await db.select().from(schema.roles).where(and(eq(schema.roles.slug, r.slug), isNull(schema.roles.tenantId))).get();
    if (!existing) {
      const id = crypto.randomUUID();
      await db.insert(schema.roles).values({ ...r, id, createdAt: new Date(), updatedAt: new Date() }).execute();
      
      // Give super admin all permissions
      if (r.slug === 'super_admin') {
        const allPerms = await db.select().from(schema.permissions).execute();
        for (const p of allPerms) {
          await db.insert(schema.rolePermissions).values({ roleId: id, permissionId: p.id }).execute();
        }
      }
    }
  }

  // 3. Create Super Admin User
  const adminUsername = process.env.ADMIN_USERNAME || 'superadmin';
  const existingAdmin = await db.select().from(schema.users).where(eq(schema.users.username, adminUsername)).get();
  
  if (!existingAdmin) {
    const adminId = crypto.randomUUID();
    const passwordHash = await argon2.hash('SuperAdmin@123');
    await db.insert(schema.users).values({
      id: adminId,
      username: adminUsername,
      passwordHash: passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      userType: 'PLATFORM',
      status: 'ACTIVE',
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();

    const superAdminRole = await db.select().from(schema.roles).where(eq(schema.roles.slug, 'super_admin')).get();
    if (superAdminRole) {
      await db.insert(schema.userRoles).values({
        userId: adminId,
        roleId: superAdminRole.id,
        createdAt: new Date(),
      }).execute();
    }
  }

  // 3.5 Create Default Business and Business Admin
  const businessAdminUsername = 'admin';
  const existingBusinessAdmin = await db.select().from(schema.users).where(eq(schema.users.username, businessAdminUsername)).get();
  
  if (!existingBusinessAdmin) {
    const businessAdminId = crypto.randomUUID();
    const businessAdminHash = await argon2.hash('Admin@123');
    await db.insert(schema.users).values({
      id: businessAdminId,
      username: businessAdminUsername,
      passwordHash: businessAdminHash,
      firstName: 'Business',
      lastName: 'Admin',
      userType: 'BUSINESS',
      status: 'ACTIVE',
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();

    const tenantId = crypto.randomUUID();
    await db.insert(schema.tenants).values({
      id: tenantId,
      name: 'Default Business',
      slug: 'default-business',
      status: 'ACTIVE',
      ownerId: businessAdminId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();
  }

  // 4. Create Templates
  const templates = [
    { name: 'Rice Shop', slug: 'rice-shop', description: 'Template for rice shops', version: '1.0.0', status: 'ACTIVE' },
    { name: 'Egg Shop', slug: 'egg-shop', description: 'Template for egg shops', version: '1.0.0', status: 'ACTIVE' },
    { name: 'Egg Tasta', slug: 'egg-tasta', description: 'Template for egg tasta businesses', version: '1.0.0', status: 'ACTIVE' },
    { name: 'Electronics Showroom', slug: 'electronics-showroom', description: 'Template for electronics showrooms', version: '1.0.0', status: 'ACTIVE' },
  ];

  for (const t of templates) {
    let tRecord = await db.select().from(schema.templates).where(eq(schema.templates.slug, t.slug)).get();
    if (!tRecord) {
      const templateId = crypto.randomUUID();
      await db.insert(schema.templates).values({ ...t, id: templateId, createdAt: new Date(), updatedAt: new Date() }).execute();
      tRecord = await db.select().from(schema.templates).where(eq(schema.templates.id, templateId)).get();
    }

    if (tRecord) {
      const existingNavs = await db.select().from(schema.templateNavigations).where(eq(schema.templateNavigations.templateId, tRecord.id)).all();
      if (existingNavs.length === 0) {
        const navItems: any[] = [
          { name: "Dashboard", route: "/app/dashboard", icon: "dashboard", sortOrder: 1 },
          { 
            name: "Products", 
            route: "#", 
            icon: "layers", 
            sortOrder: 2,
            children: [
              { name: "Add Product", route: "/app/products/new", sortOrder: 1 },
              { name: "Manage Products", route: "/app/products/manage", sortOrder: 2 },
              { name: "Product List", route: "/app/products/list", sortOrder: 3 },
            ]
          },
          { 
            name: "Suppliers", 
            route: "#", 
            icon: "users", 
            sortOrder: 3,
            children: [
              { name: "Add Supplier", route: "/app/suppliers/new", sortOrder: 1 },
              { name: "Manage Suppliers", route: "/app/suppliers/manage", sortOrder: 2 },
              { name: "Supplier Due", route: "/app/suppliers/due", sortOrder: 3 },
              { name: "Supplier Ledger", route: "/app/suppliers/ledger", sortOrder: 4 },
            ]
          },
          { name: "Supplier Payments", route: "/app/supplier-payments/manage", icon: "DollarSign", sortOrder: 4 },
          { 
            name: "Customers", 
            route: "#", 
            icon: "users", 
            sortOrder: 5,
            children: [
              { name: "Add Customer", route: "/app/customers/new", sortOrder: 1 },
              { name: "Manage Customers", route: "/app/customers/manage", sortOrder: 2 },
              { name: "Customer Ledger", route: "/app/customers/ledger", sortOrder: 3 },
              { name: "Customer Due List", route: "/app/customers/due", sortOrder: 4 },
            ]
          },
          { 
            name: "Customer Collection", 
            route: "#", 
            icon: "HandCoins", 
            sortOrder: 6,
            children: [
              { name: "Add Collection", route: "/app/customer-collection/new", sortOrder: 1 },
              { name: "Manage Collections", route: "/app/customer-collection/manage", sortOrder: 2 },
              { name: "Collection Ledger", route: "/app/customer-collection/ledger", sortOrder: 3 },
            ]
          },
          { name: "Purchases", route: "/app/purchases/manage", icon: "WalletCards", sortOrder: 7 },
          { name: "Sales", route: "/app/sales/manage", icon: "DollarSign", sortOrder: 8 },
          { name: "Sales Return", route: "/app/sales-return/manage", icon: "MoveRight", sortOrder: 9 },
          { name: "Inventory", route: "/app/inventory/adjustment", icon: "Database", sortOrder: 10 },
          { name: "Expenses", route: "/app/expenses/manage", icon: "DollarSign", sortOrder: 11 },
          { name: "Cashbook", route: "/app/cashbook", icon: "WalletCards", sortOrder: 12 },
          { name: "Reports", route: "/app/reports/dashboard", icon: "activity", sortOrder: 13 },
          { name: "User Management", route: "/app/users/manage", icon: "users", sortOrder: 14 },
          { name: "Data Management", route: "/app/data/backup", icon: "Database", sortOrder: 15 },
          { name: "Settings", route: "/app/settings", icon: "settings", sortOrder: 16 },
        ];
        for (const item of navItems) {
          const parentId = crypto.randomUUID();
          const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
          await db.insert(schema.templateNavigations).values({
            id: parentId,
            templateId: tRecord.id,
            name: item.name,
            slug: slug,
            route: item.route,
            icon: item.icon || null,
            parentId: null,
            sortOrder: item.sortOrder,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }).execute();

          if (item.children && item.children.length > 0) {
            for (const child of item.children) {
              const childSlug = child.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
              await db.insert(schema.templateNavigations).values({
                id: crypto.randomUUID(),
                templateId: tRecord.id,
                name: child.name,
                slug: childSlug,
                route: child.route,
                icon: null,
                parentId: parentId,
                sortOrder: child.sortOrder,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              }).execute();
            }
          }
        }
      }
    }
  }

  console.log('Database seeded successfully.');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
