import { InferSelectModel } from 'drizzle-orm';
import * as platformSchema from "@/platform/db/schema";

export type User = InferSelectModel<typeof platformSchema.users>;
export type Session = InferSelectModel<typeof platformSchema.sessions>;
export type Tenant = InferSelectModel<typeof platformSchema.tenants>;
export type Role = InferSelectModel<typeof platformSchema.roles>;
export type Permission = InferSelectModel<typeof platformSchema.permissions>;
export type AuditLog = InferSelectModel<typeof platformSchema.auditLogs>;
export type Template = InferSelectModel<typeof platformSchema.templates>;
