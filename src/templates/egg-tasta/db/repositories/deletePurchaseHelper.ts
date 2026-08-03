import { db } from "@/shared/db/database";
import { purchases, purchaseItems, products, suppliers, supplierLedgers, accounts, transactions } from "@/templates/egg-tasta/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function deletePurchaseHelper(tenantId: string, purchaseId: string) {
  return await db.transaction(async (tx) => {
    const purchase = await tx.select().from(purchases).where(and(eq(purchases.tenantId, tenantId), eq(purchases.id, purchaseId))).get();
    if (!purchase) throw new Error("Purchase not found");

    const items = await tx.select().from(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId)).all();

    // 1. Restore Stock (Decrease)
    for (const item of items) {
      const product = await tx.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, item.productId))).get();
      if (product) {
        await tx.update(products)
          .set({ currentStock: product.currentStock - item.quantity })
          .where(eq(products.id, item.productId))
          .run();
      }
    }

    // 2. Update Supplier Due (Decrease due since purchase is deleted)
    const supplier = await tx.select().from(suppliers).where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, purchase.supplierId))).get();
    if (supplier) {
      await tx.update(suppliers)
        .set({ previousDue: supplier.previousDue - purchase.dueAmount })
        .where(eq(suppliers.id, supplier.id))
        .run();
    }

    // 3. Delete Supplier Ledger Entries (both PURCHASE and PAYMENT) & Central Ledger Entries
    await tx.delete(supplierLedgers).where(and(eq(supplierLedgers.tenantId, tenantId), eq(supplierLedgers.referenceId, purchaseId))).run();
    const { LedgerService } = await import("@/templates/egg-tasta/services/LedgerService");
    await LedgerService.deleteEntryByReference(tenantId, "PURCHASE", purchaseId, tx);
    await LedgerService.deleteEntryByReference(tenantId, "PURCHASE_PAYMENT", purchaseId, tx);

    // 4. Update Cash/Bank Account if paid
    if (purchase.paidAmount > 0) {
      const transaction = await tx.select().from(transactions).where(and(eq(transactions.tenantId, tenantId), eq(transactions.referenceId, purchaseId), eq(transactions.referenceType, 'PURCHASE'))).get();
      
      if (transaction) {
        const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, transaction.accountId))).get();
        if (account) {
          // Reverse payment OUT -> add to currentBalance
          await tx.update(accounts)
            .set({ currentBalance: account.currentBalance + purchase.paidAmount })
            .where(eq(accounts.id, account.id))
            .run();
          
          await tx.insert(transactions).values({
            id: randomUUID(),
            tenantId,
            accountId: account.id,
            date: new Date(),
            type: 'IN',
            amount: purchase.paidAmount,
            referenceType: 'PURCHASE_DELETE',
            referenceId: purchaseId,
            referenceNo: purchase.invoiceNo,
            description: `Deleted Purchase Invoice ${purchase.invoiceNo} (Payment Reversed)`
          }).run();
        }
      }
    }

    // 5. Delete Purchase Items and Purchase
    await tx.delete(purchaseItems).where(eq(purchaseItems.purchaseId, purchaseId)).run();
    await tx.delete(purchases).where(and(eq(purchases.tenantId, tenantId), eq(purchases.id, purchaseId))).run();

    return true;
  });
}
