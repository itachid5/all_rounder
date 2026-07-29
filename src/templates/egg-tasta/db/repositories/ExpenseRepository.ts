import { db } from "@/shared/db/database";
import { sequences, auditLogs } from "@/platform/db/schema";
import { expenses, accounts, transactions, expenseCategories } from "@/templates/egg-tasta/db/schema";

import { eq, and, desc, asc, like, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ExpenseRepository {
  static async generateExpenseNo(tenantId: string, tx: any = db): Promise<string> {
    const entityType = 'expense';
    let seq = await tx.select().from(sequences).where(and(eq(sequences.tenantId, tenantId), eq(sequences.entityType, entityType))).get();

    let newValue = 1;
    if (!seq) {
      await tx.insert(sequences).values({
                id: randomUUID(),
                tenantId,
                entityType,
                currentValue: 1
              }).run();
    } else {
      const updated = await tx.update(sequences)
              .set({ currentValue: seq.currentValue + 1 })
              .where(eq(sequences.id, seq.id))
              .returning()
              .get();
      newValue = updated.currentValue;
    }

    return `EXP-${String(newValue).padStart(6, '0')}`;
  }

  static async createExpense(tenantId: string, data: any, userId?: string) {
    return await db.transaction(async (tx) => {
          const expenseNo = await this.generateExpenseNo(tenantId, tx);
          const expenseId = randomUUID();
          const date = data.expenseDate ? new Date(data.expenseDate) : new Date();

          // 1. Create Expense Record
          const expense = await tx.insert(expenses).values({
                      id: expenseId,
                      tenantId,
                      expenseNo,
                      expenseDate: date.toISOString(),
                      categoryId: data.categoryId,
                      amount: data.amount,
                      paymentMethod: data.paymentMethod,
                      referenceNo: data.referenceNo || null,
                      paidTo: data.paidTo || null,
                      notes: data.notes || null,
                      status: 'COMPLETED'
                    }).returning().get();

          // 2. Update Account & Create Transaction
          if (data.accountId) {
            const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, data.accountId))).get();
            if (account) {
              await tx.update(accounts)
                                .set({ currentBalance: account.currentBalance - data.amount })
                                .where(eq(accounts.id, account.id))
                                .run();

              await tx.insert(transactions).values({
                                id: randomUUID(),
                                tenantId,
                                accountId: data.accountId,
                                date: date,
                                type: 'OUT',
                                amount: data.amount,
                                referenceType: 'EXPENSE',
                                referenceId: expenseId,
                                referenceNo: expenseNo,
                                description: `Expense: ${expenseNo}`
                              }).run();
            }
          }

          // 3. Create Activity Log
          if (userId) {
            await tx.insert(auditLogs).values({
                            id: randomUUID(),
                            tenantId,
                            userId,
                            action: 'CREATE',
                            category: 'EXPENSE',
                            resource: 'expenses',
                            resourceId: expenseId,
                            details: `Created expense ${expenseNo} for amount ${data.amount}`
                          }).run();
          }

          return expense;
        });
  }

  static async listExpenses(tenantId: string, options: { search?: string, status?: string, page?: number, limit?: number } = {}) {
    const { search = "", status, page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(expenses.tenantId, tenantId)];
    if (search) conditions.push(or(like(expenses.expenseNo, `%${search}%`), like(expenses.notes, `%${search}%`)));
    if (status) conditions.push(eq(expenses.status, status as "COMPLETED" | "CANCELLED"));

    const whereClause = and(...conditions);

    const data = await db.select({
          expense: expenses,
          categoryName: expenseCategories.name
        })
        .from(expenses)
        .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
        .where(whereClause)
        .orderBy(desc(expenses.createdAt))
        .limit(limit)
        .offset(offset)
        .all();

    const countResult = await db.select({ count: sql`count(*)`.mapWith(Number) })
          .from(expenses)
          .where(whereClause)
          .get();
      
    return { data, total: countResult?.count || 0 };
  }
}
