import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  userType: text('user_type').notNull(), // 'PLATFORM' or 'BUSINESS'
  status: text('status').notNull().default('ACTIVE'),
  mustChangePassword: integer('must_change_password', { mode: 'boolean' }).notNull().default(true),
  isInternal: integer('is_internal', { mode: 'boolean' }).notNull().default(false),
  avatarUrl: text('avatar_url'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
}, (t) => ({
  statusIdx: index('users_status_idx').on(t.status),
  userTypeIdx: index('users_user_type_idx').on(t.userType),
}));
