import { sqliteTable, text, integer, real, unique } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { tenants  } from "@/platform/db/schema";

export const suppliers = sqliteTable(
  'suppliers',
  {
    id: text('id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenants.id),
    supplierCode: text('supplier_code').notNull(),
    name: text('name').notNull(),
    mobile: text('mobile'),
    alternativeMobile: text('alternative_mobile'),
    whatsappNumber: text('whatsapp_number'),
    email: text('email'),
    address: text('address'),
    previousDue: real('previous_due').notNull().default(0),
    notes: text('notes'),
    status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, ARCHIVED
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    // Ensure mobile is unique within a tenant
    tenantMobileUnique: unique('tenant_mobile_unique').on(table.tenantId, table.mobile),
    // Ensure supplierCode is unique within a tenant
    tenantSupplierCodeUnique: unique('tenant_supplier_code_unique').on(table.tenantId, table.supplierCode),
  })
);
