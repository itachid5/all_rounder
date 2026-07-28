import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import fs from 'fs';
import path from 'path';

const dbUrl = process.env.DATABASE_URL?.replace('file:', '') || './data/erp.db';
const dbDir = path.dirname(dbUrl);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbUrl);
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
export type DatabaseType = typeof db; // Rename to avoid conflict with better-sqlite3 Database
