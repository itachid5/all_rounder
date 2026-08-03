import { db } from "../shared/db/database";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Creating ledger_entries table if not exists...");
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY NOT NULL,
      tenant_id TEXT NOT NULL REFERENCES tenants(id),
      voucher_no TEXT NOT NULL,
      entry_date TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      entity_type TEXT,
      customer_id TEXT REFERENCES customers(id),
      supplier_id TEXT REFERENCES suppliers(id),
      reference_type TEXT,
      reference_id TEXT,
      reference_no TEXT,
      description TEXT,
      debit REAL NOT NULL DEFAULT 0,
      credit REAL NOT NULL DEFAULT 0,
      running_balance REAL NOT NULL DEFAULT 0,
      created_by TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);
  console.log("ledger_entries table created successfully.");
}

run().catch(console.error);
