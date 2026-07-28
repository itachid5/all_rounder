import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants } from './tenants';
import { suppliers } from './suppliers';

export const supplierLedgers = sqliteTable('supplier_ledgers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  supplierId: text('supplier_id').notNull().references(() => suppliers.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  type: text('type').notNull(), // PURCHASE, PAYMENT, RETURN, ADJUSTMENT, OPENING
  referenceId: text('reference_id'), // purchase.id, payment.id
  referenceNo: text('reference_no'), // invoice_no, receipt_no
  debit: real('debit').notNull().default(0), // increases due (purchases)
  credit: real('credit').notNull().default(0), // decreases due (payments/returns)
  balance: real('balance').notNull().default(0), // running balance
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
