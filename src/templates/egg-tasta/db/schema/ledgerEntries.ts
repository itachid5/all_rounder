import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants } from "@/platform/db/schema";
import { customers } from './customers';
import { suppliers } from './suppliers';

export const ledgerEntries = sqliteTable('ledger_entries', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  voucherNo: text('voucher_no').notNull(),
  entryDate: text('entry_date').notNull(),
  transactionType: text('transaction_type').notNull(),
  entityType: text('entity_type'),
  customerId: text('customer_id').references(() => customers.id),
  supplierId: text('supplier_id').references(() => suppliers.id),
  referenceType: text('reference_type'),
  referenceId: text('reference_id'),
  referenceNo: text('reference_no'),
  description: text('description'),
  debit: real('debit').notNull().default(0),
  credit: real('credit').notNull().default(0),
  runningBalance: real('running_balance').notNull().default(0),
  createdBy: text('created_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(strftime('%s', 'now'))`),
}, (t) => ({
  tenantIdIdx: index('ledger_entries_tenant_id_idx').on(t.tenantId),
  tenantDateIdx: index('ledger_entries_tenant_date_idx').on(t.tenantId, t.entryDate),
  customerIdIdx: index('ledger_entries_customer_id_idx').on(t.customerId),
  supplierIdIdx: index('ledger_entries_supplier_id_idx').on(t.supplierId),
}));
