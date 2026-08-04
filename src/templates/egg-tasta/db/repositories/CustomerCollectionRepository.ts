import { db } from "@/shared/db/database";
import { sequences, auditLogs } from "@/platform/db/schema";
import { customerCollections, customers, customerLedgers, accounts, transactions } from "@/templates/egg-tasta/db/schema";

import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class CustomerCollectionRepository {
  static async generateCollectionNo(tenantId: string, tx: any = db): Promise<string> {
    const entityType = 'customer_collection';
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

    return `COL-${String(newValue).padStart(6, '0')}`;
  }

  static async createCollection(tenantId: string, data: any) {
    return await db.transaction(async (tx) => {
          const collectionNo = await this.generateCollectionNo(tenantId, tx);
          const collectionId = randomUUID();
          const date = data.date ? new Date(data.date) : new Date();
          const amount = parseFloat(data.amount);

          if (amount <= 0) throw new Error("Amount must be greater than 0");

          // 1. Get or pick an account
          let accountId = data.accountId;
          if (!accountId) {
            // Fallback: Pick the first active account if not provided
            const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.status, 'ACTIVE'))).get();
            if (!account) throw new Error("No active account found to receive the collection");
            accountId = account.id;
          }

          // 2. Insert Collection Record
          const collection = await tx.insert(customerCollections).values({
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
          const customer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, data.customerId))).get();
          if (!customer) throw new Error("Customer not found");

          await tx.update(customers)
                    .set({ previousDue: customer.previousDue - amount })
                    .where(eq(customers.id, customer.id))
                    .run();

          // 4. Create Customer Ledger Entry (Payment decreases due -> Credit)
          await tx.insert(customerLedgers).values({
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

          const { LedgerService } = await import("@/templates/egg-tasta/services/LedgerService");
          await LedgerService.postEntry(tenantId, {
            transactionType: "CUSTOMER_COLLECTION",
            debit: 0,
            credit: amount,
            customerId: data.customerId,
            entityType: "CUSTOMER",
            referenceType: "COLLECTION",
            referenceId: collectionId,
            referenceNo: collectionNo,
            entryDate: date,
            description: `Customer Collection #${collectionNo} (${data.paymentMethod || 'CASH'})`,
          }, tx);

          // 5. Update Cash/Bank Account & Add Transaction
          const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, accountId))).get();
          if (account) {
            await tx.update(accounts)
                            .set({ currentBalance: account.currentBalance + amount })
                            .where(eq(accounts.id, accountId))
                            .run();

            await tx.insert(transactions).values({
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
          await tx.insert(auditLogs).values({
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

  static async listCollections(tenantId: string, options: { 
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

    const [data, countResult] = await Promise.all([
      db.select({
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
      .all(),
      db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(customerCollections)
      .where(whereClause)
      .get()
    ]);

    return { data, total: countResult?.count || 0 };
  }

  static async deleteCollection(tenantId: string, collectionId: string) {
    return await db.transaction(async (tx) => {
      // 1. Fetch collection
      const collection = await tx.select().from(customerCollections).where(and(eq(customerCollections.tenantId, tenantId), eq(customerCollections.id, collectionId))).get();
      if (!collection) throw new Error("Collection not found");
  
      const amount = collection.amount;
  
      // 2. Update Customer Due (Increase Due since payment is deleted)
      const customer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, collection.customerId))).get();
      if (customer) {
        await tx.update(customers)
          .set({ previousDue: customer.previousDue + amount })
          .where(eq(customers.id, customer.id))
          .run();
      }
  
      // 3. Delete Customer Ledger Entry
      await tx.delete(customerLedgers).where(and(eq(customerLedgers.tenantId, tenantId), eq(customerLedgers.referenceId, collectionId))).run();
  
      // 4. Update Cash/Bank Account & Add Reversing Transaction
      if (collection.accountId) {
        const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, collection.accountId))).get();
        if (account) {
          await tx.update(accounts)
            .set({ currentBalance: account.currentBalance - amount })
            .where(eq(accounts.id, account.id))
            .run();
  
          await tx.insert(transactions).values({
            id: randomUUID(),
            tenantId,
            accountId: account.id,
            date: new Date(),
            type: 'OUT',
            amount: amount,
            referenceType: 'COLLECTION_DELETE',
            referenceId: collectionId,
            referenceNo: collection.collectionNo,
            description: `Deleted Collection ${collection.collectionNo}`
          }).run();
        }
      }
  
      // 5. Delete Collection
      await tx.delete(customerCollections).where(and(eq(customerCollections.tenantId, tenantId), eq(customerCollections.id, collectionId))).run();
  
      return true;
    });
  }
  static async updateCollection(tenantId: string, collectionId: string, data: any) {
    return await db.transaction(async (tx) => {
      const oldCollection = await tx.select().from(customerCollections).where(and(eq(customerCollections.tenantId, tenantId), eq(customerCollections.id, collectionId))).get();
      if (!oldCollection) throw new Error("Collection not found");

      const oldAmount = oldCollection.amount;
      const newAmount = parseFloat(data.amount);
      if (newAmount <= 0) throw new Error("Amount must be greater than 0");

      const oldCustomerId = oldCollection.customerId;
      const newCustomerId = data.customerId;
      
      const oldAccountId = oldCollection.accountId;
      const newAccountId = data.accountId || oldAccountId;
      
      const newDate = data.date ? new Date(data.date) : oldCollection.date;

      // 1. Reverse old Customer Due
      if (oldCustomerId) {
        const oldCustomer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, oldCustomerId))).get();
        if (oldCustomer) {
          await tx.update(customers)
            .set({ previousDue: oldCustomer.previousDue + oldAmount })
            .where(eq(customers.id, oldCustomer.id))
            .run();
        }
      }

      // 2. Reverse old Account Balance
      if (oldAccountId) {
        const oldAccount = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, oldAccountId))).get();
        if (oldAccount) {
          await tx.update(accounts)
            .set({ currentBalance: oldAccount.currentBalance - oldAmount })
            .where(eq(accounts.id, oldAccount.id))
            .run();
        }
      }

      // 3. Apply new Customer Due
      if (newCustomerId) {
        const newCustomer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, newCustomerId))).get();
        if (newCustomer) {
          await tx.update(customers)
            .set({ previousDue: newCustomer.previousDue - newAmount })
            .where(eq(customers.id, newCustomer.id))
            .run();
        }
      }

      // 4. Apply new Account Balance
      if (newAccountId) {
        const newAccount = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, newAccountId))).get();
        if (newAccount) {
          await tx.update(accounts)
            .set({ currentBalance: newAccount.currentBalance + newAmount })
            .where(eq(accounts.id, newAccount.id))
            .run();
        }
      }

      // 5. Update Collection Record
      const updatedCollection = await tx.update(customerCollections).set({
        date: newDate,
        customerId: newCustomerId,
        accountId: newAccountId,
        amount: newAmount,
        paymentMethod: data.paymentMethod || oldCollection.paymentMethod,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null
      }).where(and(eq(customerCollections.tenantId, tenantId), eq(customerCollections.id, collectionId))).returning().get();

      // 6. Update Customer Ledger
      const ledgerEntry = await tx.select().from(customerLedgers).where(and(eq(customerLedgers.tenantId, tenantId), eq(customerLedgers.referenceId, collectionId))).get();
      if (ledgerEntry) {
        // We recalculate balance assuming the latest due. This is an approximation since ledger is a running balance.
        const currentCustomer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, newCustomerId))).get();
        await tx.update(customerLedgers).set({
          customerId: newCustomerId,
          date: newDate,
          credit: newAmount,
          balance: currentCustomer ? currentCustomer.previousDue : 0,
        }).where(eq(customerLedgers.id, ledgerEntry.id)).run();
      }

      // 7. Update Transaction
      const transactionEntry = await tx.select().from(transactions).where(and(eq(transactions.tenantId, tenantId), eq(transactions.referenceId, collectionId))).get();
      if (transactionEntry) {
        await tx.update(transactions).set({
          accountId: newAccountId,
          date: newDate,
          amount: newAmount,
        }).where(eq(transactions.id, transactionEntry.id)).run();
      }

      // 8. Create Audit Log
      await tx.insert(auditLogs).values({
        id: randomUUID(),
        tenantId,
        action: 'UPDATE',
        category: 'CUSTOMER_COLLECTION',
        resource: 'customer_collections',
        resourceId: collectionId,
        details: `Updated collection ${oldCollection.collectionNo}. Amount: ${oldAmount} -> ${newAmount}`,
      }).run();

      return updatedCollection;
    });
  }
}
