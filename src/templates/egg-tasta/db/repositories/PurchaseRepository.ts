import { db } from "@/shared/db/database";
import * as platformSchema from "@/platform/db/schema";
import * as businessSchema from "@/templates/egg-tasta/db/schema";
const schema = { ...platformSchema, ...businessSchema };
const { sequences, purchases, purchaseItems, products, productVariants, suppliers, supplierLedgers } = schema;
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class PurchaseRepository {
  /**
   * Generates a sequential Invoice Number for a given tenant.
   */
  static generateInvoiceNo(tenantId: string, tx: any = db): string {
    const entityType = 'purchase_invoice';
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

    return `PINV-${String(newValue).padStart(6, '0')}`;
  }

  static createPurchase(tenantId: string, userId: string, data: any) {
    return db.transaction((tx) => {
      const invoiceNo = this.generateInvoiceNo(tenantId, tx);
      const purchaseId = randomUUID();
      const date = data.date ? new Date(data.date) : new Date();
      
      const dueAmount = data.grandTotal - data.paidAmount;

      // 1. Create Purchase Record
      const purchase = tx.insert(purchases).values({
        id: purchaseId,
        tenantId,
        invoiceNo,
        date,
        supplierId: data.supplierId,
        subTotal: data.subTotal,
        discount: data.discount,
        transportCost: data.transportCost,
        otherCharges: data.otherCharges,
        grandTotal: data.grandTotal,
        paidAmount: data.paidAmount,
        dueAmount: dueAmount,
        paymentMethod: data.paymentMethod || null,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        status: 'COMPLETED'
      }).returning().get();

      // 2. Create Purchase Items & Update Stock & Create Inventory Movements
      for (const item of data.items) {
        tx.insert(purchaseItems).values({
          id: randomUUID(),
          tenantId,
          purchaseId,
          productId: item.productId,
          variantId: item.variantId || null,
          purchasePrice: item.purchasePrice,
          quantity: item.quantity,
          total: item.total
        }).run();

        const product = tx.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, item.productId))).get();
        if (product) {
          let previousStock = product.currentStock;
          let newStock = previousStock + item.quantity;
          
          if (product.variantInventoryMode === 'VARIANT_LEVEL' && item.variantId) {
            const variant = tx.select().from(productVariants).where(and(eq(productVariants.tenantId, tenantId), eq(productVariants.id, item.variantId))).get();
            if (variant) {
              previousStock = variant.currentStock;
              newStock = previousStock + item.quantity;
              
              tx.update(productVariants)
                .set({ currentStock: newStock })
                .where(eq(productVariants.id, variant.id))
                .run();
            }
          }

          // Increase Product Stock (Total)
          tx.update(products)
            .set({ 
              currentStock: product.currentStock + item.quantity
            })
            .where(eq(products.id, product.id))
            .run();
            
          // Create Inventory Movement
          tx.insert(schema.inventoryMovements).values({
            id: randomUUID(),
            tenantId,
            productId: item.productId,
            variantId: item.variantId || null,
            date,
            type: 'IN',
            referenceType: 'PURCHASE',
            referenceId: purchaseId,
            referenceNo: invoiceNo,
            quantity: item.quantity,
            previousStock: previousStock,
            newStock: newStock,
            unitCost: item.purchasePrice,
            totalValue: item.total,
            notes: `Purchase Invoice: ${invoiceNo}`
          }).run();
        }
      }

      // 3. Update Supplier Due
      const supplier = tx.select().from(suppliers).where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.id, data.supplierId))).get();
      if (supplier) {
        tx.update(suppliers)
          .set({ previousDue: supplier.previousDue + dueAmount })
          .where(eq(suppliers.id, supplier.id))
          .run();
      }

      // 4. Create Supplier Ledger Entries
      // Purchase increases due (Debit)
      tx.insert(supplierLedgers).values({
        id: randomUUID(),
        tenantId,
        supplierId: data.supplierId,
        date,
        type: 'PURCHASE',
        referenceId: purchaseId,
        referenceNo: invoiceNo,
        debit: data.grandTotal,
        credit: 0,
        balance: supplier ? supplier.previousDue + data.grandTotal : data.grandTotal,
        description: `Purchase Invoice: ${invoiceNo}`
      }).run();

      // Payment decreases due (Credit)
      if (data.paidAmount > 0) {
        tx.insert(supplierLedgers).values({
          id: randomUUID(),
          tenantId,
          supplierId: data.supplierId,
          date,
          type: 'PAYMENT',
          referenceId: purchaseId,
          referenceNo: invoiceNo,
          debit: 0,
          credit: data.paidAmount,
          balance: supplier ? supplier.previousDue + dueAmount : dueAmount,
          description: `Payment for Invoice: ${invoiceNo}`
        }).run();
        
        // 5. Update Cash/Bank Account and create Transaction
        const accountId = data.accountId;
        if (accountId) {
          const account = tx.select().from(schema.accounts).where(and(eq(schema.accounts.tenantId, tenantId), eq(schema.accounts.id, accountId))).get();
          if (account) {
            tx.update(schema.accounts)
              .set({ currentBalance: account.currentBalance - data.paidAmount })
              .where(eq(schema.accounts.id, accountId))
              .run();
              
            tx.insert(schema.transactions).values({
              id: randomUUID(),
              tenantId,
              accountId: accountId,
              date,
              type: 'OUT',
              amount: data.paidAmount,
              referenceType: 'PURCHASE',
              referenceId: purchaseId,
              referenceNo: invoiceNo,
              description: `Payment for Purchase Invoice: ${invoiceNo}`
            }).run();
          }
        }
      }
      
      // 6. Create Activity Log
      tx.insert(schema.auditLogs).values({
        id: randomUUID(),
        tenantId,
        userId: userId,
        action: 'CREATE',
        category: 'PURCHASES',
        resource: 'PURCHASE',
        resourceId: purchaseId,
        details: JSON.stringify({ invoiceNo, grandTotal: data.grandTotal }),
        ipAddress: '127.0.0.1' // simplified
      }).run();

      return purchase;
    });
  }

  static listPurchases(tenantId: string, options: { 
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
      eq(purchases.tenantId, tenantId)
    ];

    if (search) {
      conditions.push(or(
        like(purchases.invoiceNo, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(purchases.status, status));
    }

    const whereClause = and(...conditions);

    let orderByColumn;
    switch(sortBy) {
      case 'invoiceNo': orderByColumn = purchases.invoiceNo; break;
      case 'date': orderByColumn = purchases.date; break;
      case 'grandTotal': orderByColumn = purchases.grandTotal; break;
      case 'createdAt': 
      default: orderByColumn = purchases.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    // Join with suppliers to get supplier name
    const data = db.select({
        purchase: purchases,
        supplierName: suppliers.name
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(purchases)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static cancelPurchase(tenantId: string, purchaseId: string) {
    // Advanced: To cancel a purchase, we must reverse stock and supplier ledger.
    // For now, implementing basic cancelation
    return db.transaction((tx) => {
      tx.update(purchases)
        .set({ status: 'CANCELLED' })
        .where(and(eq(purchases.tenantId, tenantId), eq(purchases.id, purchaseId)))
        .run();
    });
  }
}
