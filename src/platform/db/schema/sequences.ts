import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';

export const sequences = sqliteTable('sequences', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(),
  prefix: text('prefix').default(''),
  currentValue: integer('current_value').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
