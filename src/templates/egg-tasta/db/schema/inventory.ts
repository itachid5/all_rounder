import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const inventoryMovements = sqliteTable("inventory_movements", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  productId: text("product_id").notNull(),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  type: text("type").notNull(), // IN, OUT
  referenceType: text("reference_type").notNull(), // PURCHASE, SALE, ADJUSTMENT, RETURN
  referenceId: text("reference_id"),
  referenceNo: text("reference_no"),
  quantity: real("quantity").notNull(),
  previousStock: real("previous_stock").notNull(),
  newStock: real("new_stock").notNull(),
  unitCost: real("unit_cost").notNull(),
  totalValue: real("total_value").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const stockAdjustments = sqliteTable("stock_adjustments", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  adjustmentNo: text("adjustment_no").notNull(),
  date: integer("date", { mode: 'timestamp' }).notNull(),
  productId: text("product_id").notNull(),
  type: text("type").notNull(), // ADDITION, DEDUCTION
  systemStock: real("system_stock").notNull(),
  actualStock: real("actual_stock").notNull(),
  difference: real("difference").notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  status: text("status").default('COMPLETED').notNull(),
  createdBy: text("created_by"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});
