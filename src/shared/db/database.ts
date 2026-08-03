import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (!_db) {
    const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;

    if (!url) {
      throw new Error("DATABASE_URL / TURSO_DATABASE_URL must be set in environment variables");
    }
    const client = createClient({
      url,
      authToken,
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
