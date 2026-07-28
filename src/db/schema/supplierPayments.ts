import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const supplierPayments = sqliteTable("supplier_payments", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  paymentNo: text("payment_no").notNull(),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  supplierId: text("supplier_id").notNull(),
  accountId: text("account_id").notNull(), // Bank/Cash account
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method").notNull(), // CASH, CHEQUE, BANK_TRANSFER, MOBILE_BANKING
  referenceNo: text("reference_no"),
  notes: text("notes"),
  status: text("status").default('COMPLETED').notNull(),
  createdBy: text("created_by"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
