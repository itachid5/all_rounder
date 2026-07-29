import { db } from "@/shared/db/database";
import { supplierPayments, suppliers, supplierLedgers, accounts, transactions } from "@/templates/egg-tasta/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function deletePaymentHelper(tenantId: string, paymentId: string) {
  return await db.transaction(async (tx) => {
    // 1. Fetch payment
    const payment = await tx.select().from(supplierPayments).where(and(eq(supplierPayments.tenantId, tenantId), eq(supplierPayments.id, paymentId))).get();
    if (!payment) throw new Error("Payment not found");

    const amount = payment.amount;

    // 2. Update Supplier Due (Increase Due since payment is deleted)
    const supplier = await tx.select().from(suppliers).where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, payment.supplierId))).get();
    if (supplier) {
      await tx.update(suppliers)
        .set({ previousDue: supplier.previousDue + amount })
        .where(eq(suppliers.id, supplier.id))
        .run();
    }

    // 3. Delete Supplier Ledger Entry
    await tx.delete(supplierLedgers).where(and(eq(supplierLedgers.tenantId, tenantId), eq(supplierLedgers.referenceId, paymentId))).run();

    // 4. Update Cash/Bank Account & Add Reversing Transaction
    if (payment.accountId) {
      const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, payment.accountId))).get();
      if (account) {
        await tx.update(accounts)
          .set({ currentBalance: account.currentBalance + amount }) // Adding back money to our account
          .where(eq(accounts.id, account.id))
          .run();

        await tx.insert(transactions).values({
          id: randomUUID(),
          tenantId,
          accountId: account.id,
          date: new Date(),
          type: 'IN', // Reversing OUT payment
          amount: amount,
          referenceType: 'PAYMENT_DELETE',
          referenceId: paymentId,
          referenceNo: payment.paymentNo,
          description: `Deleted Supplier Payment ${payment.paymentNo}`
        }).run();
      }
    }

    // 5. Delete Payment
    await tx.delete(supplierPayments).where(and(eq(supplierPayments.tenantId, tenantId), eq(supplierPayments.id, paymentId))).run();

    return true;
  });
}
