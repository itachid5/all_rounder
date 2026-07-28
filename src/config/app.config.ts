/**
 * Application Configuration
 *
 * Derived settings computed from environment variables.
 * Business logic configuration that is not a raw env var.
 */

import { env } from "./env";
import { SESSION } from "./constants";

export const appConfig = {
  name: env.NEXT_PUBLIC_APP_NAME,
  url: env.NEXT_PUBLIC_APP_URL,
  isDev: env.NODE_ENV === "development",
  isProd: env.NODE_ENV === "production",
  isTest: env.NODE_ENV === "test",

  session: {
    secret: env.SESSION_SECRET,
    maxAge: env.SESSION_MAX_AGE || SESSION.DEFAULT_MAX_AGE,
    rememberMeMaxAge: SESSION.REMEMBER_ME_MAX_AGE,
    cookieName: SESSION.COOKIE_NAME,
    secure: env.NODE_ENV === "production",
  },

  database: {
    url: env.DATABASE_URL,
  },

  logging: {
    level: env.LOG_LEVEL,
  },
} as const;
