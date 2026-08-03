import { db } from "@/shared/db/database";
import { sequences } from "@/platform/db/schema";
import { ledgerEntries, sales, purchases, customerCollections, supplierPayments, expenses, customers, suppliers } from "@/templates/egg-tasta/db/schema";
import { eq, and, desc, asc, like, or, sql, gte, lte, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface PostLedgerInput {
  transactionType:
    | "PURCHASE"
    | "PURCHASE_PAYMENT"
    | "PURCHASE_RETURN"
    | "SALES"
    | "SALES_RETURN"
    | "CUSTOMER_COLLECTION"
    | "EXPENSE"
    | "SUPPLIER_PAYMENT"
    | "OPENING_BALANCE"
    | "ADJUSTMENT"
    | "CASH_IN"
    | "CASH_OUT";
  debit: number;
  credit: number;
  customerId?: string | null;
  supplierId?: string | null;
  entityType?: "CUSTOMER" | "SUPPLIER" | "BANK" | "CASH" | "EXPENSE" | "GENERAL" | null;
  referenceType?: string | null;
  referenceId?: string | null;
  referenceNo?: string | null;
  voucherNo?: string | null;
  entryDate?: string | Date | null;
  description?: string | null;
  createdBy?: string | null;
}

export interface LedgerListOptions {
  search?: string;
  transactionType?: string;
  customerId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "entryDate" | "voucherNo" | "debit" | "credit" | "runningBalance";
  sortOrder?: "asc" | "desc";
}

export class LedgerService {
  /**
   * Generates a sequential Voucher No for a given tenant.
   */
  static async generateVoucherNo(tenantId: string, tx: any = db): Promise<string> {
    const entityType = 'voucher';
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

    return `VCH-${String(newValue).padStart(6, '0')}`;
  }

  /**
   * Recalculates running balances for all entries of a tenant chronologically.
   * Balance formula per prompt example:
   * Opening = 10,000; Purchase Debit 2,000 -> Running = 8,000; Customer Collection Credit 5,000 -> Running = 13,000.
   * Formula: Running = Previous - Debit + Credit
   */
  static async recalculateRunningBalances(tenantId: string, tx: any = db): Promise<void> {
    const entries = await tx
      .select({
        id: ledgerEntries.id,
        debit: ledgerEntries.debit,
        credit: ledgerEntries.credit,
      })
      .from(ledgerEntries)
      .where(eq(ledgerEntries.tenantId, tenantId))
      .orderBy(asc(ledgerEntries.entryDate), asc(ledgerEntries.createdAt))
      .all();

    let running = 0;
    for (const entry of entries) {
      const d = Number(entry.debit) || 0;
      const c = Number(entry.credit) || 0;
      running = running - d + c;
      await tx
        .update(ledgerEntries)
        .set({ runningBalance: running })
        .where(eq(ledgerEntries.id, entry.id))
        .run();
    }
  }

  /**
   * Central entry insertion method used by all ERP modules.
   */
  static async postEntry(tenantId: string, input: PostLedgerInput, tx: any = db) {
    const voucherNo = input.voucherNo || (await this.generateVoucherNo(tenantId, tx));
    const entryId = randomUUID();
    
    let entryDateStr: string;
    if (input.entryDate) {
      entryDateStr = typeof input.entryDate === 'string' 
        ? new Date(input.entryDate).toISOString() 
        : input.entryDate.toISOString();
    } else {
      entryDateStr = new Date().toISOString();
    }

    const debit = Number(input.debit) || 0;
    const credit = Number(input.credit) || 0;

    const newEntry = await tx
      .insert(ledgerEntries)
      .values({
        id: entryId,
        tenantId,
        voucherNo,
        entryDate: entryDateStr,
        transactionType: input.transactionType,
        entityType: input.entityType || null,
        customerId: input.customerId || null,
        supplierId: input.supplierId || null,
        referenceType: input.referenceType || null,
        referenceId: input.referenceId || null,
        referenceNo: input.referenceNo || null,
        description: input.description || null,
        debit,
        credit,
        runningBalance: 0,
        createdBy: input.createdBy || "System",
      })
      .returning()
      .get();

    // Recalculate balances across chronological entries
    await this.recalculateRunningBalances(tenantId, tx);

    return newEntry;
  }

  /**
   * Remove ledger entry associated with a deleted transaction reference.
   */
  static async deleteEntryByReference(tenantId: string, referenceType: string, referenceId: string, tx: any = db) {
    await tx
      .delete(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.tenantId, tenantId),
          eq(ledgerEntries.referenceType, referenceType),
          eq(ledgerEntries.referenceId, referenceId)
        )
      )
      .run();

    await this.recalculateRunningBalances(tenantId, tx);
  }

  /**
   * Central query service for Ledger Page.
   */
  static async listLedgerEntries(tenantId: string, options: LedgerListOptions = {}) {
    await this.ensureLedgerSynced(tenantId);

    const {
      search = "",
      transactionType,
      customerId,
      supplierId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "entryDate",
      sortOrder = "desc",
    } = options;

    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(ledgerEntries.tenantId, tenantId)];

    if (search) {
      conditions.push(
        or(
          like(ledgerEntries.voucherNo, `%${search}%`),
          like(ledgerEntries.referenceNo, `%${search}%`),
          like(ledgerEntries.description, `%${search}%`),
          like(customers.name, `%${search}%`),
          like(suppliers.name, `%${search}%`)
        )
      );
    }

    if (transactionType && transactionType !== "ALL") {
      conditions.push(eq(ledgerEntries.transactionType, transactionType));
    }
    if (customerId && customerId !== "ALL") {
      conditions.push(eq(ledgerEntries.customerId, customerId));
    }
    if (supplierId && supplierId !== "ALL") {
      conditions.push(eq(ledgerEntries.supplierId, supplierId));
    }
    if (startDate) {
      conditions.push(gte(ledgerEntries.entryDate, new Date(startDate).toISOString()));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(ledgerEntries.entryDate, end.toISOString()));
    }

    const whereClause = and(...conditions);

    // Determine sorting column
    let sortColumn: any = ledgerEntries.entryDate;
    if (sortBy === "voucherNo") sortColumn = ledgerEntries.voucherNo;
    else if (sortBy === "debit") sortColumn = ledgerEntries.debit;
    else if (sortBy === "credit") sortColumn = ledgerEntries.credit;
    else if (sortBy === "runningBalance") sortColumn = ledgerEntries.runningBalance;

    const orderFn = sortOrder === "asc" ? asc : desc;

    const data = await db
      .select({
        id: ledgerEntries.id,
        tenantId: ledgerEntries.tenantId,
        voucherNo: ledgerEntries.voucherNo,
        entryDate: ledgerEntries.entryDate,
        transactionType: ledgerEntries.transactionType,
        entityType: ledgerEntries.entityType,
        customerId: ledgerEntries.customerId,
        supplierId: ledgerEntries.supplierId,
        referenceType: ledgerEntries.referenceType,
        referenceId: ledgerEntries.referenceId,
        referenceNo: ledgerEntries.referenceNo,
        description: ledgerEntries.description,
        debit: ledgerEntries.debit,
        credit: ledgerEntries.credit,
        runningBalance: ledgerEntries.runningBalance,
        createdBy: ledgerEntries.createdBy,
        createdAt: ledgerEntries.createdAt,
        customerName: customers.name,
        supplierName: suppliers.name,
      })
      .from(ledgerEntries)
      .leftJoin(customers, eq(ledgerEntries.customerId, customers.id))
      .leftJoin(suppliers, eq(ledgerEntries.supplierId, suppliers.id))
      .where(whereClause)
      .orderBy(orderFn(sortColumn), desc(ledgerEntries.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(ledgerEntries)
      .leftJoin(customers, eq(ledgerEntries.customerId, customers.id))
      .leftJoin(suppliers, eq(ledgerEntries.supplierId, suppliers.id))
      .where(whereClause)
      .get();

    const summary = await this.getLedgerSummary(tenantId, { customerId, supplierId, startDate, endDate });

    return {
      data,
      total: countResult?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((countResult?.count || 0) / limit),
      summary,
    };
  }

  /**
   * Top summary metrics calculation
   */
  static async getLedgerSummary(
    tenantId: string,
    options: { customerId?: string; supplierId?: string; startDate?: string; endDate?: string } = {}
  ) {
    const { customerId, supplierId, startDate, endDate } = options;

    const baseConditions: any[] = [eq(ledgerEntries.tenantId, tenantId)];
    if (customerId && customerId !== "ALL") baseConditions.push(eq(ledgerEntries.customerId, customerId));
    if (supplierId && supplierId !== "ALL") baseConditions.push(eq(ledgerEntries.supplierId, supplierId));

    // 1. Calculate Opening Balance (prior to startDate)
    let openingBalance = 0;
    if (startDate) {
      const priorConditions = [...baseConditions, lte(ledgerEntries.entryDate, new Date(startDate).toISOString())];
      const priorResult = await db
        .select({
          totalDebit: sql`SUM(${ledgerEntries.debit})`.mapWith(Number),
          totalCredit: sql`SUM(${ledgerEntries.credit})`.mapWith(Number),
        })
        .from(ledgerEntries)
        .where(and(...priorConditions))
        .get();

      if (priorResult) {
        openingBalance = (priorResult.totalCredit || 0) - (priorResult.totalDebit || 0);
      }
    } else {
      // If no start date filter, get opening balance from initial state or 0
      openingBalance = 0;
    }

    // 2. Period totals
    const periodConditions = [...baseConditions];
    if (startDate) periodConditions.push(gte(ledgerEntries.entryDate, new Date(startDate).toISOString()));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      periodConditions.push(lte(ledgerEntries.entryDate, end.toISOString()));
    }

    const periodResult = await db
      .select({
        totalDebit: sql`SUM(${ledgerEntries.debit})`.mapWith(Number),
        totalCredit: sql`SUM(${ledgerEntries.credit})`.mapWith(Number),
      })
      .from(ledgerEntries)
      .where(and(...periodConditions))
      .get();

    const totalDebit = periodResult?.totalDebit || 0;
    const totalCredit = periodResult?.totalCredit || 0;
    const currentBalance = openingBalance - totalDebit + totalCredit;

    return {
      openingBalance,
      totalDebit,
      totalCredit,
      currentBalance,
    };
  }

  /**
   * Fetch single ledger entry for Detail Modal
   */
  static async getLedgerEntryById(tenantId: string, entryId: string) {
    const result = await db
      .select({
        entry: ledgerEntries,
        customerName: customers.name,
        supplierName: suppliers.name,
      })
      .from(ledgerEntries)
      .leftJoin(customers, eq(ledgerEntries.customerId, customers.id))
      .leftJoin(suppliers, eq(ledgerEntries.supplierId, suppliers.id))
      .where(and(eq(ledgerEntries.tenantId, tenantId), eq(ledgerEntries.id, entryId)))
      .get();

    return result;
  }

  /**
   * Backfill / Sync existing Sales, Purchases, Collections, Payments, Expenses, Dues into central ledger
   */
  static async ensureLedgerSynced(tenantId: string, tx: any = db) {
    // 1. Dues / Opening balances for Customers
    const allCustomers = await tx.select().from(customers).where(eq(customers.tenantId, tenantId)).all();
    for (const cust of allCustomers) {
      if (cust.previousDue && cust.previousDue !== 0) {
        const existingOB = await tx
          .select()
          .from(ledgerEntries)
          .where(
            and(
              eq(ledgerEntries.tenantId, tenantId),
              eq(ledgerEntries.transactionType, "OPENING_BALANCE"),
              eq(ledgerEntries.customerId, cust.id)
            )
          )
          .get();

        if (!existingOB) {
          const voucherNo = await this.generateVoucherNo(tenantId, tx);
          await tx.insert(ledgerEntries).values({
            id: randomUUID(),
            tenantId,
            voucherNo,
            entryDate: cust.createdAt ? new Date(cust.createdAt).toISOString() : new Date().toISOString(),
            transactionType: "OPENING_BALANCE",
            entityType: "CUSTOMER",
            customerId: cust.id,
            referenceType: "CUSTOMER_OPENING_BALANCE",
            referenceId: cust.id,
            referenceNo: cust.customerCode,
            description: `Opening Due Balance for Customer ${cust.name}`,
            debit: 0,
            credit: Number(cust.previousDue) || 0,
            runningBalance: 0,
            createdBy: "System",
          }).run();
        }
      }
    }

    // 2. Dues / Opening balances for Suppliers
    const allSuppliers = await tx.select().from(suppliers).where(eq(suppliers.tenantId, tenantId)).all();
    for (const supp of allSuppliers) {
      if (supp.previousDue && supp.previousDue !== 0) {
        const existingOB = await tx
          .select()
          .from(ledgerEntries)
          .where(
            and(
              eq(ledgerEntries.tenantId, tenantId),
              eq(ledgerEntries.transactionType, "OPENING_BALANCE"),
              eq(ledgerEntries.supplierId, supp.id)
            )
          )
          .get();

        if (!existingOB) {
          const voucherNo = await this.generateVoucherNo(tenantId, tx);
          await tx.insert(ledgerEntries).values({
            id: randomUUID(),
            tenantId,
            voucherNo,
            entryDate: supp.createdAt ? new Date(supp.createdAt).toISOString() : new Date().toISOString(),
            transactionType: "OPENING_BALANCE",
            entityType: "SUPPLIER",
            supplierId: supp.id,
            referenceType: "SUPPLIER_OPENING_BALANCE",
            referenceId: supp.id,
            referenceNo: supp.supplierCode,
            description: `Opening Due Balance for Supplier ${supp.name}`,
            debit: Number(supp.previousDue) || 0,
            credit: 0,
            runningBalance: 0,
            createdBy: "System",
          }).run();
        }
      }
    }

    // 3. Sales
    const existingSales = await tx.select().from(sales).where(eq(sales.tenantId, tenantId)).all();
    for (const s of existingSales) {
      const existingSaleEntry = await tx
        .select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenantId),
            eq(ledgerEntries.referenceType, "SALE"),
            eq(ledgerEntries.referenceId, s.id)
          )
        )
        .get();

      if (!existingSaleEntry) {
        const voucherNo = await this.generateVoucherNo(tenantId, tx);
        await tx.insert(ledgerEntries).values({
          id: randomUUID(),
          tenantId,
          voucherNo,
          entryDate: s.date ? new Date(s.date).toISOString() : new Date().toISOString(),
          transactionType: "SALES",
          entityType: "CUSTOMER",
          customerId: s.customerId,
          referenceType: "SALE",
          referenceId: s.id,
          referenceNo: s.invoiceNo,
          description: `Sales Invoice #${s.invoiceNo}`,
          debit: Number(s.grandTotal) || 0,
          credit: 0,
          runningBalance: 0,
          createdBy: "System",
        }).run();
      }

      if (s.paidAmount && s.paidAmount > 0) {
        const existingSalePaymentEntry = await tx
          .select()
          .from(ledgerEntries)
          .where(
            and(
              eq(ledgerEntries.tenantId, tenantId),
              eq(ledgerEntries.referenceType, "SALE_PAYMENT"),
              eq(ledgerEntries.referenceId, s.id)
            )
          )
          .get();

        if (!existingSalePaymentEntry) {
          const voucherNo = await this.generateVoucherNo(tenantId, tx);
          await tx.insert(ledgerEntries).values({
            id: randomUUID(),
            tenantId,
            voucherNo,
            entryDate: s.date ? new Date(s.date).toISOString() : new Date().toISOString(),
            transactionType: "CUSTOMER_COLLECTION",
            entityType: "CUSTOMER",
            customerId: s.customerId,
            referenceType: "SALE_PAYMENT",
            referenceId: s.id,
            referenceNo: s.invoiceNo,
            description: `Payment received for Sales Invoice #${s.invoiceNo}`,
            debit: 0,
            credit: Number(s.paidAmount) || 0,
            runningBalance: 0,
            createdBy: "System",
          }).run();
        }
      }
    }

    // 4. Customer Collections
    const existingCollections = await tx.select().from(customerCollections).where(eq(customerCollections.tenantId, tenantId)).all();
    for (const c of existingCollections) {
      const existingColEntry = await tx
        .select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenantId),
            eq(ledgerEntries.referenceType, "COLLECTION"),
            eq(ledgerEntries.referenceId, c.id)
          )
        )
        .get();

      if (!existingColEntry) {
        const voucherNo = await this.generateVoucherNo(tenantId, tx);
        await tx.insert(ledgerEntries).values({
          id: randomUUID(),
          tenantId,
          voucherNo,
          entryDate: c.date ? new Date(c.date).toISOString() : new Date().toISOString(),
          transactionType: "CUSTOMER_COLLECTION",
          entityType: "CUSTOMER",
          customerId: c.customerId,
          referenceType: "COLLECTION",
          referenceId: c.id,
          referenceNo: c.collectionNo,
          description: `Customer Collection #${c.collectionNo} (${c.paymentMethod || 'CASH'})`,
          debit: 0,
          credit: Number(c.amount) || 0,
          runningBalance: 0,
          createdBy: "System",
        }).run();
      }
    }

    // 5. Purchases
    const existingPurchases = await tx.select().from(purchases).where(eq(purchases.tenantId, tenantId)).all();
    for (const p of existingPurchases) {
      const existingPurchaseEntry = await tx
        .select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenantId),
            eq(ledgerEntries.referenceType, "PURCHASE"),
            eq(ledgerEntries.referenceId, p.id)
          )
        )
        .get();

      if (!existingPurchaseEntry) {
        const voucherNo = await this.generateVoucherNo(tenantId, tx);
        await tx.insert(ledgerEntries).values({
          id: randomUUID(),
          tenantId,
          voucherNo,
          entryDate: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
          transactionType: "PURCHASE",
          entityType: "SUPPLIER",
          supplierId: p.supplierId,
          referenceType: "PURCHASE",
          referenceId: p.id,
          referenceNo: p.invoiceNo,
          description: `Purchase Invoice #${p.invoiceNo}`,
          debit: Number(p.grandTotal) || 0,
          credit: 0,
          runningBalance: 0,
          createdBy: "System",
        }).run();
      }

      if (p.paidAmount && p.paidAmount > 0) {
        const existingPurchasePaymentEntry = await tx
          .select()
          .from(ledgerEntries)
          .where(
            and(
              eq(ledgerEntries.tenantId, tenantId),
              eq(ledgerEntries.referenceType, "PURCHASE_PAYMENT"),
              eq(ledgerEntries.referenceId, p.id)
            )
          )
          .get();

        if (!existingPurchasePaymentEntry) {
          const voucherNo = await this.generateVoucherNo(tenantId, tx);
          await tx.insert(ledgerEntries).values({
            id: randomUUID(),
            tenantId,
            voucherNo,
            entryDate: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
            transactionType: "PURCHASE_PAYMENT",
            entityType: "SUPPLIER",
            supplierId: p.supplierId,
            referenceType: "PURCHASE_PAYMENT",
            referenceId: p.id,
            referenceNo: p.invoiceNo,
            description: `Payment for Purchase Invoice #${p.invoiceNo}`,
            debit: 0,
            credit: Number(p.paidAmount) || 0,
            runningBalance: 0,
            createdBy: "System",
          }).run();
        }
      }
    }

    // 6. Supplier Payments
    const existingPayments = await tx.select().from(supplierPayments).where(eq(supplierPayments.tenantId, tenantId)).all();
    for (const sp of existingPayments) {
      const existingPayEntry = await tx
        .select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenantId),
            eq(ledgerEntries.referenceType, "SUPPLIER_PAYMENT"),
            eq(ledgerEntries.referenceId, sp.id)
          )
        )
        .get();

      if (!existingPayEntry) {
        const voucherNo = await this.generateVoucherNo(tenantId, tx);
        await tx.insert(ledgerEntries).values({
          id: randomUUID(),
          tenantId,
          voucherNo,
          entryDate: sp.date ? new Date(sp.date).toISOString() : new Date().toISOString(),
          transactionType: "SUPPLIER_PAYMENT",
          entityType: "SUPPLIER",
          supplierId: sp.supplierId,
          referenceType: "SUPPLIER_PAYMENT",
          referenceId: sp.id,
          referenceNo: sp.paymentNo,
          description: `Supplier Payment #${sp.paymentNo} (${sp.paymentMethod || 'CASH'})`,
          debit: 0,
          credit: Number(sp.amount) || 0,
          runningBalance: 0,
          createdBy: "System",
        }).run();
      }
    }

    // 7. Expenses
    const existingExpenses = await tx.select().from(expenses).where(eq(expenses.tenantId, tenantId)).all();
    for (const e of existingExpenses) {
      const existingExpEntry = await tx
        .select()
        .from(ledgerEntries)
        .where(
          and(
            eq(ledgerEntries.tenantId, tenantId),
            eq(ledgerEntries.referenceType, "EXPENSE"),
            eq(ledgerEntries.referenceId, e.id)
          )
        )
        .get();

      if (!existingExpEntry) {
        const voucherNo = await this.generateVoucherNo(tenantId, tx);
        await tx.insert(ledgerEntries).values({
          id: randomUUID(),
          tenantId,
          voucherNo,
          entryDate: e.expenseDate ? new Date(e.expenseDate).toISOString() : new Date().toISOString(),
          transactionType: "EXPENSE",
          entityType: "EXPENSE",
          referenceType: "EXPENSE",
          referenceId: e.id,
          referenceNo: e.expenseNo,
          description: `Expense #${e.expenseNo} - ${e.notes || e.paidTo || "General"}`,
          debit: Number(e.amount) || 0,
          credit: 0,
          runningBalance: 0,
          createdBy: "System",
        }).run();
      }
    }

    // Recalculate balances
    await this.recalculateRunningBalances(tenantId, tx);
  }
}
