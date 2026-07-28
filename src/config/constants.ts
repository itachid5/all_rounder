/**
 * Platform Constants
 *
 * Immutable values used across the platform.
 * No magic strings anywhere else in the codebase.
 */

// ─── Route Prefixes ────────────────────────────
export const ROUTES = {
  PUBLIC: "/",
  AUTH: "/auth",
  PLATFORM: "/platform",
  BUSINESS: "/app",
} as const;

export const PLATFORM_ROUTES = {
  LOGIN: `${ROUTES.PLATFORM}/login`,
  DASHBOARD: `${ROUTES.PLATFORM}/dashboard`,
  BUSINESSES: `${ROUTES.PLATFORM}/businesses`,
  USERS: `${ROUTES.PLATFORM}/users`,
  ROLES: `${ROUTES.PLATFORM}/roles`,
  PERMISSIONS: `${ROUTES.PLATFORM}/permissions`,
  TEMPLATES: `${ROUTES.PLATFORM}/templates`,
  SETTINGS: `${ROUTES.PLATFORM}/settings`,
  LOGS: `${ROUTES.PLATFORM}/logs`,
  PROFILE: `${ROUTES.PLATFORM}/profile`,
} as const;

export const BUSINESS_ROUTES = {
  LOGIN: `${ROUTES.BUSINESS}/login`,
  DASHBOARD: `${ROUTES.BUSINESS}/dashboard`,
} as const;

// ─── User Types ────────────────────────────────
export const USER_TYPE = {
  PLATFORM: "PLATFORM",
  BUSINESS: "BUSINESS",
} as const;

export type UserType = (typeof USER_TYPE)[keyof typeof USER_TYPE];

// ─── User Status ───────────────────────────────
export const USER_STATUS = {
  ACTIVE: "ACTIVE",
  DISABLED: "DISABLED",
  LOCKED: "LOCKED",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

// ─── Business Status ───────────────────────────
export const BUSINESS_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  PENDING: "PENDING",
  DELETED: "DELETED",
} as const;

export type BusinessStatus = (typeof BUSINESS_STATUS)[keyof typeof BUSINESS_STATUS];

// ─── Role Scope ────────────────────────────────
export const ROLE_SCOPE = {
  PLATFORM: "PLATFORM",
  BUSINESS: "BUSINESS",
} as const;

export type RoleScope = (typeof ROLE_SCOPE)[keyof typeof ROLE_SCOPE];

// ─── Default Platform Roles ────────────────────
export const PLATFORM_ROLES = {
  SUPER_ADMIN: "super_admin",
  PLATFORM_ADMIN: "platform_admin",
  PLATFORM_MANAGER: "platform_manager",
  SUPPORT: "support",
  VIEWER: "viewer",
} as const;

// ─── Log Severity ──────────────────────────────
export const LOG_SEVERITY = {
  DEBUG: "DEBUG",
  INFO: "INFO",
  WARN: "WARN",
  ERROR: "ERROR",
  CRITICAL: "CRITICAL",
} as const;

export type LogSeverity = (typeof LOG_SEVERITY)[keyof typeof LOG_SEVERITY];

// ─── Log Category ──────────────────────────────
export const LOG_CATEGORY = {
  APP: "APP",
  AUDIT: "AUDIT",
  SECURITY: "SECURITY",
  DATABASE: "DATABASE",
  AUTH: "AUTH",
} as const;

export type LogCategory = (typeof LOG_CATEGORY)[keyof typeof LOG_CATEGORY];

// ─── Pagination ────────────────────────────────
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// ─── Session ───────────────────────────────────
export const SESSION = {
  COOKIE_NAME: "erp_session",
  DEFAULT_MAX_AGE: 86400,         // 24 hours
  REMEMBER_ME_MAX_AGE: 2592000,   // 30 days
} as const;

// ─── Template Status ───────────────────────────
export const TEMPLATE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  DEPRECATED: "DEPRECATED",
} as const;

export type TemplateStatus = (typeof TEMPLATE_STATUS)[keyof typeof TEMPLATE_STATUS];
