import { db } from "@/shared/db/database";
import { sequences, auditLogs } from "@/platform/db/schema";
import { customers, customerLedgers, sales, customerCollections } from "@/templates/egg-tasta/db/schema";

import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class CustomerRepository {
  /**
   * Generates a sequential 6-digit Customer Code for a given tenant.
   * Utilizes database transactions to guarantee uniqueness across concurrent requests.
   */
  static generateCustomerCode(tenantId: string, tx: any = db): string {
    const entityType = 'customer';
    let seq = tx.select().from(sequences).where(and(eq(sequences.tenantId, tenantId), eq(sequences.entityType, entityType))).get();

    let newValue = 1;
    if (!seq) {
      tx.insert(sequences).values({
        id: randomUUID(),
        tenantId,
        entityType,
        currentValue: 1
      }).run();
    } else {
      const updated = tx.update(sequences)
        .set({ currentValue: seq.currentValue + 1 })
        .where(eq(sequences.id, seq.id))
        .returning()
        .get();
      newValue = updated.currentValue;
    }

    return `CUS-${String(newValue).padStart(6, '0')}`;
  }

  static createCustomer(tenantId: string, data: any) {
    return db.transaction((tx) => {
      const mobileValue = data.mobile ? data.mobile : null;

      if (mobileValue) {
        // Check for duplicate mobile
        const existing = tx.select().from(customers).where(
          and(
            eq(customers.tenantId, tenantId),
            eq(customers.mobile, mobileValue)
          )
        ).get();

        if (existing) {
          throw new Error("A customer with this mobile number already exists.");
        }
      }

      const customerCode = this.generateCustomerCode(tenantId, tx);
      const id = randomUUID();
      
      const customer = tx.insert(customers).values({
        id,
        tenantId,
        customerCode,
        name: data.name,
        mobile: mobileValue,
        alternativeMobile: data.alternativeMobile || null,
        whatsappNumber: data.whatsappNumber || null,
        email: data.email || null,
        address: data.address || null,
        previousDue: data.previousDue || 0,
        notes: data.notes || null,
        status: data.status || 'ACTIVE'
      }).returning().get();

      return customer;
    });
  }

  static updateCustomer(tenantId: string, customerCode: string, data: any, userId?: string) {
    return db.transaction((tx) => {
      const mobileValue = data.mobile ? data.mobile : null;

      if (mobileValue) {
        // Check for duplicate mobile
        const existing = tx.select().from(customers).where(
          and(
            eq(customers.tenantId, tenantId),
            eq(customers.mobile, mobileValue)
          )
        ).get();

        if (existing && existing.customerCode !== customerCode) {
          throw new Error("A customer with this mobile number already exists.");
        }
      }

      const updated = tx.update(customers).set({
        name: data.name,
        mobile: mobileValue,
        alternativeMobile: data.alternativeMobile || null,
        whatsappNumber: data.whatsappNumber || null,
        email: data.email || null,
        address: data.address || null,
        previousDue: data.previousDue !== undefined ? data.previousDue : undefined,
        notes: data.notes !== undefined ? data.notes : undefined,
        status: data.status || 'ACTIVE',
        updatedAt: sql`(unixepoch())`
      }).where(and(eq(customers.tenantId, tenantId), eq(customers.customerCode, customerCode))).returning().get();

      if (!updated) throw new Error("Customer not found.");

      if (userId) {
        tx.insert(auditLogs).values({
          id: randomUUID(),
          tenantId,
          userId,
          action: 'UPDATE',
          category: 'CUSTOMER',
          resource: 'customers',
          resourceId: customerCode,
          details: `Customer Edited`,
        }).run();
      }

      return updated;
    });
  }

  static listCustomers(tenantId: string, options: { 
    search?: string, 
    status?: string, 
    sortBy?: string, 
    sortDir?: 'asc' | 'desc', 
    page?: number, 
    limit?: number 
  } = {}) {
    const { search = "", status, sortBy = "createdAt", sortDir = "desc", page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      eq(customers.tenantId, tenantId)
    ];

    if (search) {
      conditions.push(or(
        like(customers.customerCode, `%${search}%`),
        like(customers.name, `%${search}%`),
        like(customers.mobile, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(customers.status, status));
    }

    const whereClause = and(...conditions);

    // Sorting
    let orderByColumn;
    switch(sortBy) {
      case 'customerCode': orderByColumn = customers.customerCode; break;
      case 'name': orderByColumn = customers.name; break;
      case 'mobile': orderByColumn = customers.mobile; break;
      case 'previousDue': orderByColumn = customers.previousDue; break;
      case 'createdAt': 
      default: orderByColumn = customers.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const data = db.select()
      .from(customers)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(customers)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static updateCustomerStatus(tenantId: string, customerCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED', userId?: string) {
    return db.transaction((tx) => {
      for (const code of customerCodes) {
        tx.update(customers)
          .set({ status, updatedAt: sql`(unixepoch())` })
          .where(and(eq(customers.tenantId, tenantId), eq(customers.customerCode, code)))
          .run();

        if (userId) {
          tx.insert(auditLogs).values({
            id: randomUUID(),
            tenantId,
            userId,
            action: status === 'ARCHIVED' ? 'ARCHIVE' : (status === 'ACTIVE' ? 'RESTORE' : 'UPDATE_STATUS'),
            category: 'CUSTOMER',
            resource: 'customers',
            resourceId: code,
            details: status === 'ARCHIVED' ? 'Customer Archived' : (status === 'ACTIVE' ? 'Customer Restored' : `Customer status changed to ${status}`),
          }).run();
        }
      }
    });
  }

  static adjustCustomerBalance(tenantId: string, customerCode: string, newBalance: number, reason: string, notes: string, userId?: string) {
    return db.transaction((tx) => {
      const customer = tx.select().from(customers).where(
        and(eq(customers.tenantId, tenantId), eq(customers.customerCode, customerCode))
      ).get();

      if (!customer) throw new Error("Customer not found.");

      const oldBalance = customer.previousDue;
      const difference = newBalance - oldBalance;

      // Update customer balance
      tx.update(customers).set({
        previousDue: newBalance,
        updatedAt: sql`(unixepoch())`
      }).where(and(eq(customers.tenantId, tenantId), eq(customers.customerCode, customerCode))).run();

      // Insert ledger entry
      tx.insert(customerLedgers).values({
        id: randomUUID(),
        tenantId,
        customerId: customer.id,
        date: new Date(),
        type: 'ADJUSTMENT',
        debit: difference > 0 ? difference : 0,
        credit: difference < 0 ? Math.abs(difference) : 0,
        balance: newBalance,
        description: `Balance Adjustment. Reason: ${reason}.${notes ? ` Notes: ${notes}` : ''}`,
      }).run();

      // Insert audit log
      if (userId) {
        tx.insert(auditLogs).values({
          id: randomUUID(),
          tenantId,
          userId,
          action: 'ADJUST_BALANCE',
          category: 'CUSTOMER',
          resource: 'customers',
          resourceId: customerCode,
          details: `Customer Balance Adjusted. Old Balance: ${oldBalance}, New Balance: ${newBalance}, Difference: ${difference}, Reason: ${reason}`,
        }).run();
      }

      return { oldBalance, newBalance, difference };
    });
  }

  static getCustomerProfileData(tenantId: string, customerCode: string) {
    const customer = db.select().from(customers).where(
      and(eq(customers.tenantId, tenantId), eq(customers.customerCode, customerCode))
    ).get();

    if (!customer) throw new Error("Customer not found.");

    // Recent Transactions
    const recentTransactions = db.select().from(customerLedgers)
      .where(eq(customerLedgers.customerId, customer.id))
      .orderBy(desc(customerLedgers.date), desc(customerLedgers.createdAt))
      .limit(10)
      .all();

    // Stats
    const salesStats = db.select({
      totalPurchases: sql`sum(${sales.grandTotal})`.mapWith(Number),
      totalPaid: sql`sum(${sales.paidAmount})`.mapWith(Number),
      cashPurchases: sql`sum(case when ${sales.dueAmount} = 0 then 1 else 0 end)`.mapWith(Number),
      creditPurchases: sql`sum(case when ${sales.dueAmount} > 0 then 1 else 0 end)`.mapWith(Number),
      purchaseCount: sql`count(${sales.id})`.mapWith(Number),
      lastPurchaseDate: sql`max(${sales.date})`,
    }).from(sales).where(eq(sales.customerId, customer.id)).get();

    const collectionsStats = db.select({
      totalCollections: sql`sum(${customerCollections.amount})`.mapWith(Number),
      lastCollectionDate: sql`max(${customerCollections.date})`,
    }).from(customerCollections).where(eq(customerCollections.customerId, customer.id)).get();

    // Audit Logs (Timeline)
    const timeline = db.select().from(auditLogs)
      .where(and(
        eq(auditLogs.tenantId, tenantId), 
        eq(auditLogs.resource, 'customers'), 
        eq(auditLogs.resourceId, customerCode)
      ))
      .orderBy(desc(auditLogs.createdAt))
      .limit(15)
      .all();

    return {
      customer,
      stats: {
        totalPurchases: salesStats?.totalPurchases || 0,
        totalPaid: (salesStats?.totalPaid || 0) + (collectionsStats?.totalCollections || 0),
        cashPurchases: salesStats?.cashPurchases || 0,
        creditPurchases: salesStats?.creditPurchases || 0,
        purchaseCount: salesStats?.purchaseCount || 0,
        lastPurchaseDate: salesStats?.lastPurchaseDate || null,
        lastCollectionDate: collectionsStats?.lastCollectionDate || null,
      },
      recentTransactions,
      timeline
    };
  }
}
