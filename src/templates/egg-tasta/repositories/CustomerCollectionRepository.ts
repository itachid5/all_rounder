import { db } from "@/db";
import { sequences, customerCollections, customers, customerLedgers, accounts, transactions, auditLogs } from "@/db/schema";
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class CustomerCollectionRepository {
  static generateCollectionNo(tenantId: string, tx: any = db): string {
    const entityType = 'customer_collection';
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

    return `COL-${String(newValue).padStart(6, '0')}`;
  }

  static createCollection(tenantId: string, data: any) {
    return db.transaction((tx) => {
      const collectionNo = this.generateCollectionNo(tenantId, tx);
      const collectionId = randomUUID();
      const date = data.date ? new Date(data.date) : new Date();
      const amount = parseFloat(data.amount);

      if (amount <= 0) throw new Error("Amount must be greater than 0");

      // 1. Get or pick an account
      let accountId = data.accountId;
      if (!accountId) {
        // Fallback: Pick the first active account if not provided
        const account = tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.status, 'ACTIVE'))).get();
        if (!account) throw new Error("No active account found to receive the collection");
        accountId = account.id;
      }

      // 2. Insert Collection Record
      const collection = tx.insert(customerCollections).values({
        id: collectionId,
        tenantId,
        collectionNo,
        date,
        customerId: data.customerId,
        accountId: accountId,
        amount: amount,
        paymentMethod: data.paymentMethod || 'CASH',
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        status: 'COMPLETED'
      }).returning().get();

      // 3. Update Customer Due (Reduce Due)
      const customer = tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, data.customerId))).get();
      if (!customer) throw new Error("Customer not found");

      tx.update(customers)
        .set({ previousDue: customer.previousDue - amount })
        .where(eq(customers.id, customer.id))
        .run();

      // 4. Create Customer Ledger Entry (Payment decreases due -> Credit)
      tx.insert(customerLedgers).values({
        id: randomUUID(),
        tenantId,
        customerId: data.customerId,
        date,
        type: 'PAYMENT_RECEIVED',
        referenceId: collectionId,
        referenceNo: collectionNo,
        debit: 0,
        credit: amount,
        balance: customer.previousDue - amount,
        description: `Collection Received: ${collectionNo}`
      }).run();

      // 5. Update Cash/Bank Account & Add Transaction
      const account = tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, accountId))).get();
      if (account) {
        tx.update(accounts)
          .set({ currentBalance: account.currentBalance + amount })
          .where(eq(accounts.id, accountId))
          .run();

        tx.insert(transactions).values({
          id: randomUUID(),
          tenantId,
          accountId: accountId,
          date,
          type: 'IN',
          amount: amount,
          referenceType: 'COLLECTION',
          referenceId: collectionId,
          referenceNo: collectionNo,
          description: `Customer Collection from ${customer.name}`
        }).run();
      }

      // 6. Create Activity Log
      tx.insert(auditLogs).values({
        id: randomUUID(),
        tenantId,
        action: 'CREATE',
        category: 'CUSTOMER_COLLECTION',
        resource: 'customer_collections',
        resourceId: collectionId,
        details: `Received collection ${collectionNo} of amount ${amount} from customer ${customer.name}`,
      }).run();

      return collection;
    });
  }

  static listCollections(tenantId: string, options: { 
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
      eq(customerCollections.tenantId, tenantId)
    ];

    if (search) {
      conditions.push(or(
        like(customerCollections.collectionNo, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(customerCollections.status, status));
    }

    const whereClause = and(...conditions);

    let orderByColumn;
    switch(sortBy) {
      case 'collectionNo': orderByColumn = customerCollections.collectionNo; break;
      case 'date': orderByColumn = customerCollections.date; break;
      case 'amount': orderByColumn = customerCollections.amount; break;
      case 'createdAt': 
      default: orderByColumn = customerCollections.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const data = db.select({
        collection: customerCollections,
        customerName: customers.name,
        accountName: accounts.name
      })
      .from(customerCollections)
      .leftJoin(customers, eq(customerCollections.customerId, customers.id))
      .leftJoin(accounts, eq(customerCollections.accountId, accounts.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(customerCollections)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }
}
