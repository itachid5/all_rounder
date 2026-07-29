import { db } from "@/shared/db/database";
import { customerCollections, customers, customerLedgers, accounts, transactions } from "@/templates/egg-tasta/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function deleteCollectionFromRepo(tenantId: string, collectionId: string) {
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
