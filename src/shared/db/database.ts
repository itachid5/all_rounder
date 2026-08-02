import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
      throw new Error("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in environment variables");
    }
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
      fetch: (url: RequestInfo | URL, init?: RequestInit) => {
        return fetch(url, { ...init, cache: 'no-store' });
      }
    });
    _db = drizzle(client);
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get: (target, prop) => {
    const actualDb = getDb();
    const value = (actualDb as any)[prop];
    if (typeof value === 'function') {
      return value.bind(actualDb);
    }
    return value;
  }
});

export type DatabaseType = ReturnType<typeof drizzle>;
