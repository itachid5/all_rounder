import { db } from "@/shared/db/database";
import * as platformSchema from "@/platform/db/schema";
import * as businessSchema from "@/templates/egg-tasta/db/schema";
const schema = { ...platformSchema, ...businessSchema };
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const { sequences, supplierPayments, suppliers, supplierLedgers, transactions, accounts, auditLogs } = schema;

export class SupplierPaymentRepository {
  static async generatePaymentNo(tenantId: string, tx: any = db): Promise<string> {
    const entityType = 'supplier_payment';
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

    return `SPAY-${String(newValue).padStart(6, '0')}`;
  }

  static async createPayment(tenantId: string, userId: string, data: any) {
    return await db.transaction(async (tx) => {
          const paymentNo = await this.generatePaymentNo(tenantId, tx);
          const paymentId = randomUUID();
          const date = data.date ? new Date(data.date) : new Date();

          // 1. Create Payment Record
          const payment = await tx.insert(supplierPayments).values({
                      id: paymentId,
                      tenantId,
                      paymentNo,
                      date,
                      supplierId: data.supplierId,
                      accountId: data.accountId,
                      amount: data.amount,
                      paymentMethod: data.paymentMethod || 'CASH',
                      referenceNo: data.referenceNo || null,
                      notes: data.notes || null,
                      status: 'COMPLETED',
                      createdBy: userId,
                    }).returning().get();

          // 2. Update Supplier Due
          const supplier = await tx.select().from(suppliers).where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, data.supplierId))).get();
          if (supplier) {
            await tx.update(suppliers)
                            .set({ previousDue: supplier.previousDue - data.amount })
                            .where(eq(suppliers.id, supplier.id))
                            .run();
          }

          // 3. Create Supplier Ledger Entry (Credit)
          await tx.insert(supplierLedgers).values({
                    id: randomUUID(),
                    tenantId,
                    supplierId: data.supplierId,
                    date,
                    type: 'PAYMENT',
                    referenceId: paymentId,
                    referenceNo: paymentNo,
                    debit: 0,
                    credit: data.amount,
                    balance: supplier ? supplier.previousDue - data.amount : -data.amount,
                    description: `Supplier Payment: ${paymentNo}`
                  }).run();

          // 4. Update Cash/Bank Account and create Transaction
          const accountId = data.accountId;
          if (accountId) {
            const account = await tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, accountId))).get();
            if (account) {
              await tx.update(accounts)
                                .set({ currentBalance: account.currentBalance - data.amount })
                                .where(eq(accounts.id, accountId))
                                .run();
                
              await tx.insert(transactions).values({
                                id: randomUUID(),
                                tenantId,
                                accountId: accountId,
                                date,
                                type: 'OUT',
                                amount: data.amount,
                                referenceType: 'SUPPLIER_PAYMENT',
                                referenceId: paymentId,
                                referenceNo: paymentNo,
                                description: `Payment to Supplier: ${paymentNo}`
                              }).run();
            }
          }

          // 5. Create Activity Log
          await tx.insert(auditLogs).values({
                    id: randomUUID(),
                    tenantId,
                    userId: userId,
                    action: 'CREATE',
                    category: 'SUPPLIER_PAYMENT',
                    resource: 'supplier_payments',
                    resourceId: paymentId,
                    details: JSON.stringify({ paymentNo, amount: data.amount }),
                    ipAddress: '127.0.0.1' // simplified
                  }).run();

          return payment;
        });
  }

  static async listPayments(tenantId: string, options: { 
    search?: string, 
    sortBy?: string, 
    sortDir?: 'asc' | 'desc', 
    page?: number, 
    limit?: number 
  } = {}) {
    const { search = "", sortBy = "createdAt", sortDir = "desc", page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      eq(supplierPayments.tenantId, tenantId)
    ];

    // search placeholder if needed

    const whereClause = and(...conditions);

    let orderByColumn;
    switch(sortBy) {
      case 'paymentNo': orderByColumn = supplierPayments.paymentNo; break;
      case 'date': orderByColumn = supplierPayments.date; break;
      case 'amount': orderByColumn = supplierPayments.amount; break;
      case 'createdAt': 
      default: orderByColumn = supplierPayments.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const data = await db.select({
            payment: supplierPayments,
            supplierName: suppliers.name,
            accountName: accounts.name,
          })
          .from(supplierPayments)
          .leftJoin(suppliers, eq(supplierPayments.supplierId, suppliers.id))
          .leftJoin(accounts, eq(supplierPayments.accountId, accounts.id))
          .where(whereClause)
          .orderBy(orderBy)
          .limit(limit)
          .offset(offset)
          .all();

    const countResult = await db.select({ count: sql`count(*)`.mapWith(Number) })
          .from(supplierPayments)
          .where(whereClause)
          .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static async deletePayment(tenantId: string, paymentId: string) {
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
}
