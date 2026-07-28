import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // CASH, BANK, MOBILE
  accountNumber: text("account_number"),
  bankName: text("bank_name"),
  branch: text("branch"),
  openingBalance: real("opening_balance").default(0).notNull(),
  currentBalance: real("current_balance").default(0).notNull(),
  status: text("status").default('ACTIVE').notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  accountId: text("account_id").notNull(),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  type: text("type").notNull(), // IN, OUT
  amount: real("amount").notNull(),
  referenceType: text("reference_type"), // PURCHASE, SALE, EXPENSE, COLLECTION, PAYMENT, TRANSFER
  referenceId: text("reference_id"),
  referenceNo: text("reference_no"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
