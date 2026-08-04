import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { templates } from './templates';

export const templateNavigations = sqliteTable('template_navigations', {
  id: text('id').primaryKey(),
  parentId: text('parent_id'),
  templateId: text('template_id').notNull().references(() => templates.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  icon: text('icon'),
  route: text('route'),
  sortOrder: integer('sort_order').notNull().default(0),
  permissionKey: text('permission_key'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
}, (t) => ({
  templateActiveIdx: index('template_navs_template_active_idx').on(t.templateId, t.isActive),
}));
