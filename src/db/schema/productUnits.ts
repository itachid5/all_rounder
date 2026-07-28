import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { tenants } from './tenants';

export const productUnits = sqliteTable('product_units', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // Piece, Dozen, Tray, Carton
  abbreviation: text('abbreviation'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
