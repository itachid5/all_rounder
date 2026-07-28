import { db } from "@/shared/db/database";
import { auditLogs } from "@/platform/db/schema";
import { accounts, transactions } from "@/templates/egg-tasta/db/schema";

import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export class AccountRepository {
  static createAccount(tenantId: string, data: any, userId?: string) {
    return db.transaction((tx) => {
      const accountId = randomUUID();
      const account = tx.insert(accounts).values({
        id: accountId,
        tenantId,
        name: data.name,
        type: data.type,
        accountNumber: data.accountNumber || null,
        bankName: data.bankName || null,
        branch: data.branch || null,
        openingBalance: data.openingBalance || 0,
        currentBalance: data.openingBalance || 0,
        status: data.status || 'ACTIVE'
      }).returning().get();

      if (userId) {
        tx.insert(auditLogs).values({
          id: randomUUID(),
          tenantId,
          userId,
          action: 'CREATE',
          category: 'ACCOUNT',
          resource: 'accounts',
          resourceId: accountId,
          details: `Created account ${data.name}`
        }).run();
      }

      return account;
    });
  }

  static listAccounts(tenantId: string, options: { search?: string, type?: string, status?: string, page?: number, limit?: number } = {}) {
    const { search = "", type, status, page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(accounts.tenantId, tenantId)];
    if (search) conditions.push(or(like(accounts.name, `%${search}%`), like(accounts.accountNumber, `%${search}%`)));
    if (type) conditions.push(eq(accounts.type, type));
    if (status) conditions.push(eq(accounts.status, status));

    const whereClause = and(...conditions);

    const data = db.select()
      .from(accounts)
      .where(whereClause)
      .orderBy(desc(accounts.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(accounts)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static getAccount(tenantId: string, accountId: string) {
    return db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, accountId))).get();
  }

  static listTransactions(tenantId: string, options: { accountId?: string, search?: string, type?: string, accountType?: string, page?: number, limit?: number } = {}) {
    const { accountId, search = "", type, accountType, page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(transactions.tenantId, tenantId)];
    if (accountId) conditions.push(eq(transactions.accountId, accountId));
    if (search) conditions.push(or(like(transactions.description, `%${search}%`), like(transactions.referenceNo, `%${search}%`)));
    if (type) conditions.push(eq(transactions.type, type));
    if (accountType) conditions.push(eq(accounts.type, accountType));

    const whereClause = and(...conditions);

    const data = db.select({
      transaction: transactions,
      accountName: accounts.name,
      accountType: accounts.type
    })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(whereClause)
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(transactions)
      .leftJoin(accounts, eq(transactions.accountId, accounts.id))
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }
}
