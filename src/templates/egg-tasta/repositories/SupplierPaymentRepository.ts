import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

const { sequences, supplierPayments, suppliers, supplierLedgers, transactions, accounts, auditLogs } = schema;

export class SupplierPaymentRepository {
  static generatePaymentNo(tenantId: string, tx: any = db): string {
    const entityType = 'supplier_payment';
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

    return `SPAY-${String(newValue).padStart(6, '0')}`;
  }

  static createPayment(tenantId: string, userId: string, data: any) {
    return db.transaction((tx) => {
      const paymentNo = this.generatePaymentNo(tenantId, tx);
      const paymentId = randomUUID();
      const date = data.date ? new Date(data.date) : new Date();

      // 1. Create Payment Record
      const payment = tx.insert(supplierPayments).values({
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
      const supplier = tx.select().from(suppliers).where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, data.supplierId))).get();
      if (supplier) {
        tx.update(suppliers)
          .set({ previousDue: supplier.previousDue - data.amount })
          .where(eq(suppliers.id, supplier.id))
          .run();
      }

      // 3. Create Supplier Ledger Entry (Credit)
      tx.insert(supplierLedgers).values({
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
        const account = tx.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.id, accountId))).get();
        if (account) {
          tx.update(accounts)
            .set({ currentBalance: account.currentBalance - data.amount })
            .where(eq(accounts.id, accountId))
            .run();
            
          tx.insert(transactions).values({
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
      tx.insert(auditLogs).values({
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

  static listPayments(tenantId: string, options: { 
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

    const data = db.select({
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

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(supplierPayments)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }
}
