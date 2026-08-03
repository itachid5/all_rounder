import { db } from "@/shared/db/database";
import { sales, saleItems, customerCollections, purchases, purchaseItems, expenses, expenseCategories, customers, suppliers, ledgerEntries, accounts } from "@/templates/egg-tasta/db/schema";
import { eq, and, desc, sql, gte, lte, inArray } from "drizzle-orm";

export interface CashbookOptions {
  preset?: "TODAY" | "YESTERDAY" | "CUSTOM" | "RANGE";
  startDate?: string;
  endDate?: string;
}

export class CashbookService {
  static async getCashbookData(tenantId: string, options: CashbookOptions = {}) {
    const preset = options.preset || "TODAY";
    const now = new Date();

    let start: Date;
    let end: Date;

    if (preset === "YESTERDAY") {
      const y = new Date(now.valueOf() - 86400000);
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0, 0);
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
    } else if (preset === "CUSTOM" && options.startDate) {
      const d = new Date(options.startDate);
      start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    } else if (preset === "RANGE" && options.startDate && options.endDate) {
      const s = new Date(options.startDate);
      start = new Date(s.getFullYear(), s.getMonth(), s.getDate(), 0, 0, 0, 0);
      const e = new Date(options.endDate);
      end = new Date(e.getFullYear(), e.getMonth(), e.getDate(), 23, 59, 59, 999);
    } else {
      // TODAY
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    }

    const startIso = start.toISOString();
    const endIso = end.toISOString();

    const formattedDateRange =
      start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) ===
      end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        ? start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

    // 1. Calculate Opening Cash (Prior to start date)
    const priorSales = await db
      .select({ paid: sql`SUM(${sales.paidAmount})`.mapWith(Number) })
      .from(sales)
      .where(and(eq(sales.tenantId, tenantId), lte(sales.date, start)))
      .get();

    const priorCol = await db
      .select({ amount: sql`SUM(${customerCollections.amount})`.mapWith(Number) })
      .from(customerCollections)
      .where(and(eq(customerCollections.tenantId, tenantId), lte(customerCollections.date, start)))
      .get();

    const priorPurch = await db
      .select({ paid: sql`SUM(${purchases.paidAmount})`.mapWith(Number) })
      .from(purchases)
      .where(and(eq(purchases.tenantId, tenantId), lte(purchases.date, start)))
      .get();

    const priorExp = await db
      .select({ amount: sql`SUM(${expenses.amount})`.mapWith(Number) })
      .from(expenses)
      .where(and(eq(expenses.tenantId, tenantId), lte(expenses.expenseDate, startIso)))
      .get();

    const cashAccount = await db
      .select({ openingBalance: accounts.openingBalance })
      .from(accounts)
      .where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, "CASH")))
      .get();

    const accountOB = Number(cashAccount?.openingBalance) || 0;
    const pSales = Number(priorSales?.paid) || 0;
    const pCol = Number(priorCol?.amount) || 0;
    const pPurch = Number(priorPurch?.paid) || 0;
    const pExp = Number(priorExp?.amount) || 0;

    const openingCash = Math.max(0, accountOB + pSales + pCol - pPurch - pExp);

    // 2. Query Period Sales
    const rawSales = await db
      .select({
        id: sales.id,
        invoiceNo: sales.invoiceNo,
        date: sales.date,
        grandTotal: sales.grandTotal,
        paidAmount: sales.paidAmount,
        dueAmount: sales.dueAmount,
        paymentMethod: sales.paymentMethod,
        customerName: customers.name,
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(and(eq(sales.tenantId, tenantId), gte(sales.date, start), lte(sales.date, end)))
      .orderBy(desc(sales.date))
      .all();

    const saleItemsData = await db
      .select({
        saleId: saleItems.saleId,
        productCount: sql`count(distinct ${saleItems.productId})`.mapWith(Number),
        totalQuantity: sql`sum(${saleItems.quantity})`.mapWith(Number),
      })
      .from(saleItems)
      .where(eq(saleItems.tenantId, tenantId))
      .groupBy(saleItems.saleId)
      .all();

    const saleItemsMap = new Map();
    saleItemsData.forEach((si) => saleItemsMap.set(si.saleId, si));

    let cashSales = 0;
    let creditSales = 0;
    let totalSales = 0;

    const formattedSales = rawSales.map((s) => {
      const itemInfo = saleItemsMap.get(s.id) || { productCount: 1, totalQuantity: 1 };
      const gTotal = Number(s.grandTotal) || 0;
      const paid = Number(s.paidAmount) || 0;
      const due = Number(s.dueAmount) || 0;

      totalSales += gTotal;
      cashSales += paid;
      creditSales += due;

      const dateObj = s.date ? new Date(s.date) : new Date();
      const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return {
        id: s.id,
        invoiceNo: s.invoiceNo,
        date: s.date,
        time: timeStr,
        customer: s.customerName || "Walk-in Customer",
        productCount: itemInfo.productCount || 1,
        totalQuantity: itemInfo.totalQuantity || 1,
        totalAmount: gTotal,
        paid,
        due,
        paymentMethod: s.paymentMethod || (due > 0 ? (paid > 0 ? "PARTIAL" : "CREDIT") : "CASH"),
      };
    });

    // 3. Query Period Customer Collections
    const rawCollections = await db
      .select({
        id: customerCollections.id,
        collectionNo: customerCollections.collectionNo,
        date: customerCollections.date,
        amount: customerCollections.amount,
        paymentMethod: customerCollections.paymentMethod,
        customerName: customers.name,
      })
      .from(customerCollections)
      .leftJoin(customers, eq(customerCollections.customerId, customers.id))
      .where(and(eq(customerCollections.tenantId, tenantId), gte(customerCollections.date, start), lte(customerCollections.date, end)))
      .orderBy(desc(customerCollections.date))
      .all();

    let customerCollection = 0;
    const formattedCollections = rawCollections.map((c) => {
      const amt = Number(c.amount) || 0;
      customerCollection += amt;

      const dateObj = c.date ? new Date(c.date) : new Date();
      const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return {
        id: c.id,
        receiptNo: c.collectionNo,
        date: c.date,
        time: timeStr,
        customer: c.customerName || "General Customer",
        collectedAmount: amt,
        paymentMethod: c.paymentMethod || "CASH",
        collectedBy: "Admin",
      };
    });

    // 4. Query Period Purchases
    const rawPurchases = await db
      .select({
        id: purchases.id,
        invoiceNo: purchases.invoiceNo,
        date: purchases.date,
        grandTotal: purchases.grandTotal,
        paidAmount: purchases.paidAmount,
        dueAmount: purchases.dueAmount,
        paymentMethod: purchases.paymentMethod,
        supplierName: suppliers.name,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .where(and(eq(purchases.tenantId, tenantId), gte(purchases.date, start), lte(purchases.date, end)))
      .orderBy(desc(purchases.date))
      .all();

    const purchaseItemsData = await db
      .select({
        purchaseId: purchaseItems.purchaseId,
        productCount: sql`count(distinct ${purchaseItems.productId})`.mapWith(Number),
      })
      .from(purchaseItems)
      .where(eq(purchaseItems.tenantId, tenantId))
      .groupBy(purchaseItems.purchaseId)
      .all();

    const purchaseItemsMap = new Map();
    purchaseItemsData.forEach((pi) => purchaseItemsMap.set(pi.purchaseId, pi));

    let totalPurchases = 0;
    let cashPurchases = 0;
    let duePurchases = 0;

    const formattedPurchases = rawPurchases.map((p) => {
      const pInfo = purchaseItemsMap.get(p.id) || { productCount: 1 };
      const gTotal = Number(p.grandTotal) || 0;
      const paid = Number(p.paidAmount) || 0;
      const due = Number(p.dueAmount) || 0;

      totalPurchases += gTotal;
      cashPurchases += paid;
      duePurchases += due;

      const dateObj = p.date ? new Date(p.date) : new Date();
      const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return {
        id: p.id,
        purchaseNo: p.invoiceNo,
        date: p.date,
        time: timeStr,
        supplier: p.supplierName || "General Supplier",
        productCount: pInfo.productCount || 1,
        totalAmount: gTotal,
        paid,
        due,
        paymentMethod: p.paymentMethod || (due > 0 ? "CREDIT" : "CASH"),
      };
    });

    // 5. Query Period Expenses
    const rawExpenses = await db
      .select({
        id: expenses.id,
        expenseNo: expenses.expenseNo,
        expenseDate: expenses.expenseDate,
        amount: expenses.amount,
        paymentMethod: expenses.paymentMethod,
        notes: expenses.notes,
        paidTo: expenses.paidTo,
        categoryName: expenseCategories.name,
      })
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .where(and(eq(expenses.tenantId, tenantId), gte(expenses.expenseDate, startIso), lte(expenses.expenseDate, endIso)))
      .orderBy(desc(expenses.expenseDate))
      .all();

    let totalExpenses = 0;
    const formattedExpenses = rawExpenses.map((e) => {
      const amt = Number(e.amount) || 0;
      totalExpenses += amt;

      const dateObj = e.expenseDate ? new Date(e.expenseDate) : new Date();
      const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      return {
        id: e.id,
        expenseNo: e.expenseNo,
        time: timeStr,
        expenseHead: e.categoryName || "General Expense",
        description: e.notes || e.paidTo || `Expense #${e.expenseNo}`,
        amount: amt,
        paymentMethod: e.paymentMethod || "CASH",
        createdBy: e.paidTo || "Admin",
      };
    });

    // 6. Query Other Cash In & Other Cash Out from central ledger
    const otherEntries = await db
      .select()
      .from(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.tenantId, tenantId),
          inArray(ledgerEntries.transactionType, ["CASH_IN", "CASH_OUT"]),
          gte(ledgerEntries.entryDate, startIso),
          lte(ledgerEntries.entryDate, endIso)
        )
      )
      .all();

    let otherCashIn = 0;
    let otherCashOut = 0;

    otherEntries.forEach((entry) => {
      if (entry.transactionType === "CASH_IN") {
        otherCashIn += Number(entry.credit) || Number(entry.debit) || 0;
      } else if (entry.transactionType === "CASH_OUT") {
        otherCashOut += Number(entry.debit) || Number(entry.credit) || 0;
      }
    });

    // Closing Cash in Hand formula:
    // Opening Cash + Cash Sales + Customer Collection + Other Cash In - Cash Purchases - Expenses - Other Cash Out
    const closingCash = openingCash + cashSales + customerCollection + otherCashIn - cashPurchases - totalExpenses - otherCashOut;

    return {
      preset,
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      formattedDateRange,
      summary: {
        openingCash,
        cashSales,
        creditSales,
        totalSales,
        customerCollection,
        totalPurchases,
        cashPurchases,
        duePurchases,
        totalExpenses,
        otherCashIn,
        otherCashOut,
        closingCash,
      },
      sales: formattedSales,
      collections: formattedCollections,
      purchases: formattedPurchases,
      expenses: formattedExpenses,
    };
  }
}
