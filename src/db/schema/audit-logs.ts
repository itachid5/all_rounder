import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  tenantId: text('tenant_id'),
  action: text('action').notNull(),
  category: text('category').notNull(),
  severity: text('severity').notNull().default('INFO'),
  resource: text('resource'),
  resourceId: text('resource_id'),
  details: text('details'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
});
