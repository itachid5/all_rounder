import { db } from "@/shared/db/database";
import { sequences, auditLogs } from "@/platform/db/schema";
import { expenses, accounts, transactions, expenseCategories } from "@/templates/egg-tasta/db/schema";
import { eq, and, desc, asc, like, or, sql, gte, lte, inArray, ne } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ExpenseRepository {
  // ─── EXPENSE HEADS (CATEGORIES) ─────────────────────────

  static async createExpenseHead(tenantId: string, data: { name: string; description?: string; status?: "ACTIVE" | "INACTIVE" }) {
    const existing = await db
      .select()
      .from(expenseCategories)
      .where(
        and(
          eq(expenseCategories.tenantId, tenantId),
          sql`LOWER(${expenseCategories.name}) = LOWER(${data.name.trim()})`,
          ne(expenseCategories.status, "ARCHIVED")
        )
      )
      .get();

    if (existing) {
      throw new Error(`An Expense Head with the name "${data.name.trim()}" already exists.`);
    }

    const id = randomUUID();
    const head = await db
      .insert(expenseCategories)
      .values({
        id,
        tenantId,
        name: data.name.trim(),
        description: data.description || null,
        status: data.status || "ACTIVE",
      })
      .returning()
      .get();

    return head;
  }

  static async updateExpenseHead(tenantId: string, id: string, data: { name?: string; description?: string; status?: "ACTIVE" | "INACTIVE" }) {
    if (data.name) {
      const existing = await db
        .select()
        .from(expenseCategories)
        .where(
          and(
            eq(expenseCategories.tenantId, tenantId),
            sql`LOWER(${expenseCategories.name}) = LOWER(${data.name.trim()})`,
            ne(expenseCategories.id, id),
            ne(expenseCategories.status, "ARCHIVED")
          )
        )
        .get();

      if (existing) {
        throw new Error(`An Expense Head with the name "${data.name.trim()}" already exists.`);
      }
    }

    const updated = await db
      .update(expenseCategories)
      .set({
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description || null } : {}),
        ...(data.status ? { status: data.status } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(expenseCategories.tenantId, tenantId), eq(expenseCategories.id, id)))
      .returning()
      .get();

    return updated;
  }

  static async softDeleteExpenseHead(tenantId: string, id: string) {
    const updated = await db
      .update(expenseCategories)
      .set({
        status: "ARCHIVED",
        updatedAt: new Date(),
      })
      .where(and(eq(expenseCategories.tenantId, tenantId), eq(expenseCategories.id, id)))
      .returning()
      .get();

    return updated;
  }

  static async listExpenseHeads(tenantId: string, options: { search?: string; status?: string; page?: number; limit?: number } = {}) {
    const { search = "", status, page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(expenseCategories.tenantId, tenantId), ne(expenseCategories.status, "ARCHIVED")];

    if (search) {
      conditions.push(or(like(expenseCategories.name, `%${search}%`), like(expenseCategories.description, `%${search}%`)));
    }
    if (status) {
      conditions.push(eq(expenseCategories.status, status as any));
    }

    const whereClause = and(...conditions);

    const data = await db
      .select()
      .from(expenseCategories)
      .where(whereClause)
      .orderBy(asc(expenseCategories.name))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(expenseCategories)
      .where(whereClause)
      .get();

    return { data, total: countResult?.count || 0 };
  }

  // ─── EXPENSES ──────────────────────────────────────────

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
    if (!data.categoryId) {
      throw new Error("Expense Head is required.");
    }
    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Expense amount must be greater than zero.");
    }

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
        amount: Number(data.amount),
        paymentMethod: data.paymentMethod || "CASH",
        referenceNo: data.referenceNo || null,
        paidTo: data.paidTo || data.createdBy || null,
        notes: data.notes || null,
        status: 'COMPLETED'
      }).returning().get();

      // 2. Update Account & Create Transaction if account selected
      if (data.accountId) {
        const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, data.accountId))).get();
        if (account) {
          await tx.update(accounts)
            .set({ currentBalance: account.currentBalance - Number(data.amount) })
            .where(eq(accounts.id, account.id))
            .run();

          await tx.insert(transactions).values({
            id: randomUUID(),
            tenantId,
            accountId: data.accountId,
            date: date,
            type: 'OUT',
            amount: Number(data.amount),
            referenceType: 'EXPENSE',
            referenceId: expenseId,
            referenceNo: expenseNo,
            description: `Expense: ${expenseNo}`
          }).run();
        }
      }

      // 2.5 Central Ledger Entry
      const { LedgerService } = await import("@/templates/egg-tasta/services/LedgerService");
      await LedgerService.postEntry(tenantId, {
        transactionType: "EXPENSE",
        debit: Number(data.amount),
        credit: 0,
        entityType: "EXPENSE",
        referenceType: "EXPENSE",
        referenceId: expenseId,
        referenceNo: expenseNo,
        entryDate: date,
        description: `Expense #${expenseNo} - ${data.notes || data.paidTo || "General"}`,
      }, tx);

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

  static async updateExpense(tenantId: string, id: string, data: any) {
    if (data.amount !== undefined && Number(data.amount) <= 0) {
      throw new Error("Expense amount must be greater than zero.");
    }

    const updated = await db
      .update(expenses)
      .set({
        ...(data.categoryId ? { categoryId: data.categoryId } : {}),
        ...(data.amount !== undefined ? { amount: Number(data.amount) } : {}),
        ...(data.expenseDate ? { expenseDate: new Date(data.expenseDate).toISOString() } : {}),
        ...(data.paymentMethod ? { paymentMethod: data.paymentMethod } : {}),
        ...(data.referenceNo !== undefined ? { referenceNo: data.referenceNo || null } : {}),
        ...(data.paidTo !== undefined ? { paidTo: data.paidTo || null } : {}),
        ...(data.notes !== undefined ? { notes: data.notes || null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.tenantId, tenantId), eq(expenses.id, id)))
      .returning()
      .get();

    return updated;
  }

  static async deleteExpense(tenantId: string, id: string) {
    return await db.delete(expenses).where(and(eq(expenses.tenantId, tenantId), eq(expenses.id, id))).execute();
  }

  static async bulkDeleteExpenses(tenantId: string, ids: string[]) {
    if (!ids || ids.length === 0) return { count: 0 };
    return await db.delete(expenses).where(and(eq(expenses.tenantId, tenantId), inArray(expenses.id, ids))).execute();
  }

  static async listExpenses(
    tenantId: string, 
    options: { 
      search?: string; 
      categoryId?: string; 
      paymentMethod?: string; 
      startDate?: string; 
      endDate?: string; 
      minAmount?: number; 
      maxAmount?: number; 
      status?: string; 
      page?: number; 
      limit?: number 
    } = {}
  ) {
    const { 
      search = "", 
      categoryId, 
      paymentMethod, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount, 
      status, 
      page = 1, 
      limit = 50 
    } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(expenses.tenantId, tenantId)];
    if (search) {
      conditions.push(or(like(expenses.expenseNo, `%${search}%`), like(expenses.notes, `%${search}%`), like(expenses.referenceNo, `%${search}%`), like(expenses.paidTo, `%${search}%`)));
    }
    if (categoryId) conditions.push(eq(expenses.categoryId, categoryId));
    if (paymentMethod) conditions.push(eq(expenses.paymentMethod, paymentMethod as any));
    if (status) conditions.push(eq(expenses.status, status as any));
    if (startDate) conditions.push(gte(expenses.expenseDate, startDate));
    if (endDate) conditions.push(lte(expenses.expenseDate, endDate));
    if (minAmount !== undefined && !isNaN(minAmount)) conditions.push(gte(expenses.amount, minAmount));
    if (maxAmount !== undefined && !isNaN(maxAmount)) conditions.push(lte(expenses.amount, maxAmount));

    const whereClause = and(...conditions);

    const data = await db
      .select({
        expense: expenses,
        categoryName: expenseCategories.name
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(whereClause)
      .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(expenses)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  // ─── EXPENSE REPORTS & ANALYTICS ──────────────────────────

  static async getExpenseReportSummary(tenantId: string, period = "this_month") {
    const now = new Date();
    
    // Calculate Date Ranges
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    const dayOfWeek = now.getDay();
    const firstDayOfWeek = new Date(now);
    firstDayOfWeek.setDate(now.getDate() - dayOfWeek);
    firstDayOfWeek.setHours(0, 0, 0, 0);
    const weekStart = firstDayOfWeek.toISOString();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

    const allExpenses = await db
      .select({
        amount: expenses.amount,
        expenseDate: expenses.expenseDate,
        categoryId: expenses.categoryId,
        paymentMethod: expenses.paymentMethod,
        categoryName: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(eq(expenses.tenantId, tenantId))
      .all();

    let totalExpense = 0;
    let todayExpense = 0;
    let weekExpense = 0;
    let monthExpense = 0;
    let yearExpense = 0;

    const categoryMap: Record<string, { name: string; amount: number; count: number }> = {};
    const monthlyTrendMap: Record<string, number> = {};

    for (const exp of allExpenses) {
      const amt = Number(exp.amount) || 0;
      const d = exp.expenseDate;
      
      totalExpense += amt;

      if (d >= todayStart && d <= todayEnd) todayExpense += amt;
      if (d >= weekStart) weekExpense += amt;
      if (d >= monthStart) monthExpense += amt;
      if (d >= yearStart) yearExpense += amt;

      const catName = exp.categoryName || "Uncategorized";
      if (!categoryMap[catName]) {
        categoryMap[catName] = { name: catName, amount: 0, count: 0 };
      }
      categoryMap[catName].amount += amt;
      categoryMap[catName].count += 1;

      const monthKey = d.substring(0, 7); // YYYY-MM
      monthlyTrendMap[monthKey] = (monthlyTrendMap[monthKey] || 0) + amt;
    }

    const categoriesList = Object.values(categoryMap).sort((a, b) => b.amount - a.amount);
    const trendList = Object.entries(monthlyTrendMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([month, amount]) => ({ month, amount }));

    return {
      totalExpense,
      todayExpense,
      weekExpense,
      monthExpense,
      yearExpense,
      categoriesList,
      topCategories: categoriesList.slice(0, 5),
      trendList,
      totalCount: allExpenses.length,
    };
  }
}
