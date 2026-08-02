import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables");
}

const client = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
  fetch: (url: RequestInfo | URL, init?: RequestInit) => {
    return fetch(url, { ...init, cache: 'no-store' });
  }
});

export const db = drizzle(client);
export type DatabaseType = typeof db;
