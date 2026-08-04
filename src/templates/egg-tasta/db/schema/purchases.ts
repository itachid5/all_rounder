import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants  } from "@/platform/db/schema";
import { suppliers } from './suppliers';
import { products } from './products';

export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  invoiceNo: text('invoice_no').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  supplierId: text('supplier_id').notNull().references(() => suppliers.id),
  subTotal: real('sub_total').notNull().default(0),
  discount: real('discount').notNull().default(0),
  transportCost: real('transport_cost').notNull().default(0),
  otherCharges: real('other_charges').notNull().default(0),
  grandTotal: real('grand_total').notNull().default(0),
  paidAmount: real('paid_amount').notNull().default(0),
  dueAmount: real('due_amount').notNull().default(0),
  paymentMethod: text('payment_method'), // CASH, BANK, MOBILE_BANKING
  referenceNo: text('reference_no'),
  notes: text('notes'),
  status: text('status').notNull().default('COMPLETED'), // COMPLETED, CANCELLED
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
}, (t) => ({
  tenantIdIdx: index('purchases_tenant_id_idx').on(t.tenantId),
  tenantDateIdx: index('purchases_tenant_date_idx').on(t.tenantId, t.date),
  supplierIdIdx: index('purchases_supplier_id_idx').on(t.supplierId),
}));

export const purchaseItems = sqliteTable('purchase_items', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  purchaseId: text('purchase_id').notNull().references(() => purchases.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  variantId: text('variant_id'),
  purchasePrice: real('purchase_price').notNull().default(0),
  quantity: integer('quantity').notNull().default(0),
  total: real('total').notNull().default(0),
}, (t) => ({
  tenantIdIdx: index('purchase_items_tenant_id_idx').on(t.tenantId),
  purchaseIdIdx: index('purchase_items_purchase_id_idx').on(t.purchaseId),
  productIdIdx: index('purchase_items_product_id_idx').on(t.productId),
}));
