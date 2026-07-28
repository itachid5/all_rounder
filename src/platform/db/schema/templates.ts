import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  version: text('version').notNull().default('1.0.0'),
  status: text('status').notNull().default('ACTIVE'),
  icon: text('icon'),
  config: text('config'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
