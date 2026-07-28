import { InferSelectModel } from 'drizzle-orm';
import * as schema from '../db/schema';

export type User = InferSelectModel<typeof schema.users>;
export type Session = InferSelectModel<typeof schema.sessions>;
export type Tenant = InferSelectModel<typeof schema.tenants>;
export type Role = InferSelectModel<typeof schema.roles>;
export type Permission = InferSelectModel<typeof schema.permissions>;
export type AuditLog = InferSelectModel<typeof schema.auditLogs>;
export type Template = InferSelectModel<typeof schema.templates>;
