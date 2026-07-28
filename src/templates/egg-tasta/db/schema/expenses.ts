import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { tenants  } from "@/platform/db/schema";
import { expenseCategories } from "./expenseCategories";

export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  expenseNo: text("expense_no").notNull(),
  expenseDate: text("expense_date").notNull(),
  categoryId: text("category_id").notNull().references(() => expenseCategories.id),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method", { enum: ["CASH", "BANK", "MOBILE_BANKING"] }).notNull(),
  referenceNo: text("reference_no"),
  paidTo: text("paid_to"),
  notes: text("notes"),
  status: text("status", { enum: ["COMPLETED", "CANCELLED"] }).default("COMPLETED").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(strftime('%s', 'now'))`),
});
