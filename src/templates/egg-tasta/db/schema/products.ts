import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { tenants  } from "@/platform/db/schema";
import { productCategories } from './productCategories';
import { productUnits } from './productUnits';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  productCode: text('product_code').notNull(),
  name: text('name').notNull(),
  categoryId: text('category_id').references(() => productCategories.id),
  unitId: text('unit_id').references(() => productUnits.id),
  purchasePrice: real('purchase_price').notNull().default(0),
  sellingPrice: real('selling_price').notNull().default(0),
  wholesalePrice: real('wholesale_price').notNull().default(0),
  minimumSellingPrice: real('minimum_selling_price').notNull().default(0),
  openingStock: integer('opening_stock').notNull().default(0),
  currentStock: integer('current_stock').notNull().default(0),
  minimumStockAlert: integer('minimum_stock_alert').notNull().default(0),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE
  notes: text('notes'),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
