import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, gte, lt, sum, count, desc, sql } from "drizzle-orm";

const { sales, purchases, customerCollections, supplierPayments, expenses, customers, suppliers, products, accounts, auditLogs } = schema;

export class DashboardRepository {
  static async getSummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Today's Stats
    const todaySales = await db.select({ total: sum(sales.grandTotal), count: count() })
      .from(sales).where(and(eq(sales.tenantId, tenantId), gte(sales.date, today), lt(sales.date, tomorrow))).get();
    
    const todayPurchase = await db.select({ total: sum(purchases.grandTotal), count: count() })
      .from(purchases).where(and(eq(purchases.tenantId, tenantId), gte(purchases.date, today), lt(purchases.date, tomorrow))).get();
    
    const todayCollection = await db.select({ total: sum(customerCollections.amount) })
      .from(customerCollections).where(and(eq(customerCollections.tenantId, tenantId), gte(customerCollections.date, today), lt(customerCollections.date, tomorrow))).get();
    
    const todayPayment = await db.select({ total: sum(supplierPayments.amount) })
      .from(supplierPayments).where(and(eq(supplierPayments.tenantId, tenantId), gte(supplierPayments.date, today), lt(supplierPayments.date, tomorrow))).get();
    
    const todayExpense = await db.select({ total: sum(expenses.amount) })
      .from(expenses).where(and(eq(expenses.tenantId, tenantId), gte(expenses.expenseDate, today.toISOString()), lt(expenses.expenseDate, tomorrow.toISOString()))).get();

    // All-time Stats
    const totalCustomers = await db.select({ count: count() }).from(customers).where(eq(customers.tenantId, tenantId)).get();
    const totalSuppliers = await db.select({ count: count() }).from(suppliers).where(eq(suppliers.tenantId, tenantId)).get();
    const totalProducts = await db.select({ count: count() }).from(products).where(eq(products.tenantId, tenantId)).get();
    
    const totalSales = await db.select({ total: sum(sales.grandTotal) }).from(sales).where(eq(sales.tenantId, tenantId)).get();
    const totalPurchase = await db.select({ total: sum(purchases.grandTotal) }).from(purchases).where(eq(purchases.tenantId, tenantId)).get();
    const totalCollection = await db.select({ total: sum(customerCollections.amount) }).from(customerCollections).where(eq(customerCollections.tenantId, tenantId)).get();
    const totalExpense = await db.select({ total: sum(expenses.amount) }).from(expenses).where(eq(expenses.tenantId, tenantId)).get();

    // Balances
    const cashAccounts = await db.select({ total: sum(accounts.currentBalance) }).from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, 'CASH'))).get();
    const bankAccounts = await db.select({ total: sum(accounts.currentBalance) }).from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, 'BANK'))).get();
    const mobileAccounts = await db.select({ total: sum(accounts.currentBalance) }).from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.type, 'MOBILE'))).get();

    // Dues
    const totalReceivable = await db.select({ total: sum(customers.previousDue) }).from(customers).where(eq(customers.tenantId, tenantId)).get();
    const totalPayable = await db.select({ total: sum(suppliers.previousDue) }).from(suppliers).where(eq(suppliers.tenantId, tenantId)).get();

    // Low stock
    const lowStockCount = await db.select({ count: count() })
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId),
        sql`${products.currentStock} <= ${products.minimumStockAlert}`,
        sql`${products.currentStock} > 0`
      )).get();

    const outOfStockCount = await db.select({ count: count() })
      .from(products)
      .where(and(eq(products.tenantId, tenantId), sql`${products.currentStock} <= 0`)).get();

    // Activities
    const activities = await db.select()
      .from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(5)
      .all();

    return {
      today: {
        sales: Number(todaySales?.total || 0),
        salesCount: Number(todaySales?.count || 0),
        purchase: Number(todayPurchase?.total || 0),
        purchaseCount: Number(todayPurchase?.count || 0),
        collection: Number(todayCollection?.total || 0),
        payment: Number(todayPayment?.total || 0),
        expense: Number(todayExpense?.total || 0)
      },
      counts: {
        customers: Number(totalCustomers?.count || 0),
        suppliers: Number(totalSuppliers?.count || 0),
        products: Number(totalProducts?.count || 0),
        lowStock: Number(lowStockCount?.count || 0),
        outOfStock: Number(outOfStockCount?.count || 0)
      },
      allTime: {
        sales: Number(totalSales?.total || 0),
        purchase: Number(totalPurchase?.total || 0),
        collection: Number(totalCollection?.total || 0),
        expense: Number(totalExpense?.total || 0)
      },
      balances: {
        cash: Number(cashAccounts?.total || 0),
        bank: Number(bankAccounts?.total || 0),
        mobile: Number(mobileAccounts?.total || 0),
        receivable: Number(totalReceivable?.total || 0),
        payable: Number(totalPayable?.total || 0)
      },
      activities
    };
  }
}
