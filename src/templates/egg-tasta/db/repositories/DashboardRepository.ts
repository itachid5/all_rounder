import { db } from "@/shared/db/database";
import * as platformSchema from "@/platform/db/schema";
import * as businessSchema from "@/templates/egg-tasta/db/schema";
const schema = { ...platformSchema, ...businessSchema };
import { eq, and, gte, lte, sum, count } from "drizzle-orm";
import { computeDateBoundaries, DateFilterOptions } from "@/templates/egg-tasta/utils/date-filters";

const { sales, purchases, customerCollections, supplierPayments, expenses, tenants } = schema;

export class DashboardRepository {
  static async getSummary(tenantId: string, filterOptions: DateFilterOptions = {}) {
    // 1. Fetch tenant settings for timezone & language
    const tenant = await db.select({ settings: tenants.settings }).from(tenants).where(eq(tenants.id, tenantId)).get();
    let timezone = 'Asia/Dhaka';
    let language = 'en';

    if (tenant?.settings) {
      try {
        const parsed = JSON.parse(tenant.settings);
        if (parsed.timezone) timezone = parsed.timezone;
        if (parsed.language) language = parsed.language;
      } catch (e) {
        // Fallback to defaults
      }
    }

    // 2. Compute date boundaries in business timezone
    const boundaries = computeDateBoundaries(filterOptions, timezone);
    const { activeRange, displayFrom, displayTo, startDate, endDate } = boundaries;

    // Helper for table date range conditions
    const makeWhere = (tableCol: any, isIsoString: boolean = false) => {
      const conds = [eq(tableCol.tenantId, tenantId)];
      if (startDate && endDate) {
        const startVal = isIsoString ? startDate.toISOString() : startDate;
        const endVal = isIsoString ? endDate.toISOString() : endDate;
        conds.push(gte(tableCol.date || tableCol.expenseDate, startVal));
        conds.push(lte(tableCol.date || tableCol.expenseDate, endVal));
      }
      return and(...conds);
    };

    // Period Stats
    const periodSales = await db.select({ total: sum(sales.grandTotal), count: count() })
      .from(sales).where(makeWhere(sales)).get();
    
    const periodPurchase = await db.select({ total: sum(purchases.grandTotal), count: count() })
      .from(purchases).where(makeWhere(purchases)).get();
    
    const periodCollection = await db.select({ total: sum(customerCollections.amount) })
      .from(customerCollections).where(makeWhere(customerCollections)).get();
    
    const periodPayment = await db.select({ total: sum(supplierPayments.amount) })
      .from(supplierPayments).where(makeWhere(supplierPayments)).get();
    
    const expConds = [eq(expenses.tenantId, tenantId)];
    if (startDate && endDate) {
      expConds.push(gte(expenses.expenseDate, startDate.toISOString()));
      expConds.push(lte(expenses.expenseDate, endDate.toISOString()));
    }
    const periodExpense = await db.select({ total: sum(expenses.amount) })
      .from(expenses).where(and(...expConds)).get();

    // All-time Stats
    const totalSales = await db.select({ total: sum(sales.grandTotal) }).from(sales).where(eq(sales.tenantId, tenantId)).get();
    const totalPurchase = await db.select({ total: sum(purchases.grandTotal) }).from(purchases).where(eq(purchases.tenantId, tenantId)).get();
    const totalCollection = await db.select({ total: sum(customerCollections.amount) }).from(customerCollections).where(eq(customerCollections.tenantId, tenantId)).get();
    const totalExpense = await db.select({ total: sum(expenses.amount) }).from(expenses).where(eq(expenses.tenantId, tenantId)).get();

    return {
      period: {
        sales: Number(periodSales?.total || 0),
        salesCount: Number(periodSales?.count || 0),
        purchase: Number(periodPurchase?.total || 0),
        purchaseCount: Number(periodPurchase?.count || 0),
        collection: Number(periodCollection?.total || 0),
        payment: Number(periodPayment?.total || 0),
        expense: Number(periodExpense?.total || 0)
      },
      allTime: {
        sales: Number(totalSales?.total || 0),
        purchase: Number(totalPurchase?.total || 0),
        collection: Number(totalCollection?.total || 0),
        expense: Number(totalExpense?.total || 0)
      },
      filter: {
        activeRange,
        displayFrom,
        displayTo,
        timezone,
        language
      }
    };
  }
}
