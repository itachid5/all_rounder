import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { roles } from './roles';
import { users } from './users';
import { tenants } from './tenants';

export const permissions = sqliteTable('permissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  group: text('group').notNull(), // e.g. 'businesses', 'users'
  scope: text('scope').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});

export const rolePermissions = sqliteTable('role_permissions', {
  roleId: text('role_id').notNull().references(() => roles.id),
  permissionId: text('permission_id').notNull().references(() => permissions.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
  roleIdIdx: index('role_permissions_role_id_idx').on(t.roleId),
}));

export const userRoles = sqliteTable('user_roles', {
  userId: text('user_id').notNull().references(() => users.id),
  roleId: text('role_id').notNull().references(() => roles.id),
  tenantId: text('tenant_id').references(() => tenants.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.roleId] }),
  userIdIdx: index('user_roles_user_id_idx').on(t.userId),
  tenantIdIdx: index('user_roles_tenant_id_idx').on(t.tenantId),
}));
