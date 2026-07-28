import { db } from "@/db";
import { sequences, customers } from "@/db/schema";
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

  static updateCustomerStatus(tenantId: string, customerCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
    return db.transaction((tx) => {
      for (const code of customerCodes) {
        tx.update(customers)
          .set({ status })
          .where(and(eq(customers.tenantId, tenantId), eq(customers.customerCode, code)))
          .run();
      }
    });
  }
}
