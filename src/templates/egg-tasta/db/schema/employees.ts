import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { tenants } from "@/platform/db/schema/tenants";
import { users } from "@/platform/db/schema/users";

export const employees = sqliteTable("employees", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  empId: text("emp_id").notNull(),
  fullName: text("full_name").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email"),
  designation: text("designation").notNull(),
  joinDate: text("join_date").notNull(),
  status: text("status").notNull().default("ACTIVE"),
  isInternal: integer("is_internal", { mode: "boolean" }).notNull().default(false),
  userId: text("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
}, (t) => ({
  tenantIdIdx: index("employees_tenant_id_idx").on(t.tenantId),
  userIdIdx: index("employees_user_id_idx").on(t.userId),
}));
