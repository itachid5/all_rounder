import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { tenants  } from "@/platform/db/schema";

export const productCategories = sqliteTable('product_categories', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
