import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  status: text('status').notNull().default('ACTIVE'),
  templateId: text('template_id'),
  ownerId: text('owner_id').references(() => users.id),
  settings: text('settings'),
  logoUrl: text('logo_url'),
  faviconUrl: text('favicon_url'),
  iconUrl: text('icon_url'),
  bannerUrl: text('banner_url'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
