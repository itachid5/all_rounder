import { db } from './index';
import * as platformSchema from "@/platform/db/schema";
import * as businessSchema from "@/templates/egg-tasta/db/schema";
const schema = { ...platformSchema, ...businessSchema };
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import * as argon2 from 'argon2';

async function seed() {
  console.log('Seeding database...');

  // 1. Create permissions
  const groups = ['businesses', 'users', 'roles', 'permissions', 'templates', 'settings', 'logs'];
  const actions = ['create', 'read', 'update', 'delete'];
  
  const permissionData = groups.flatMap(group => 
    actions.map(action => ({
      id: crypto.randomUUID(),
      name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${group}`,
      slug: `${action}:${group}`,
      description: `Can ${action} ${group}`,
      group,
      scope: 'PLATFORM',
      createdAt: new Date(),
    }))
  );

  for (const p of permissionData) {
    const existing = await db.select().from(schema.permissions).where(eq(schema.permissions.slug, p.slug)).get();
    if (!existing) {
      await db.insert(schema.permissions).values(p).execute();
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
    const existing = await db.select().from(schema.roles).where(eq(schema.roles.slug, r.slug)).get();
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
    const existing = await db.select().from(schema.templates).where(eq(schema.templates.slug, t.slug)).get();
    if (!existing) {
      await db.insert(schema.templates).values({ ...t, id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() }).execute();
    }
  }

  console.log('Database seeded successfully.');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
