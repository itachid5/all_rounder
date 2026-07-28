import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants  } from "@/platform/db/schema";
import { customers } from './customers';

export const customerLedgers = sqliteTable('customer_ledgers', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  type: text('type').notNull(), // SALE, PAYMENT_RECEIVED, RETURN, ADJUSTMENT, OPENING
  referenceId: text('reference_id'), // sale.id, payment.id
  referenceNo: text('reference_no'), // invoice_no, receipt_no
  debit: real('debit').notNull().default(0), // increases due (sales)
  credit: real('credit').notNull().default(0), // decreases due (payments/returns)
  balance: real('balance').notNull().default(0), // running balance
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
