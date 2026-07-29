import { db } from "@/shared/db/database";
import { sequences, auditLogs } from "@/platform/db/schema";
import { sales, saleItems, products, productVariants, customers, customerLedgers, inventoryMovements } from "@/templates/egg-tasta/db/schema";

import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class SaleRepository {
  /**
   * Generates a sequential Invoice Number for a given tenant.
   */
  static generateInvoiceNo(tenantId: string, tx: any = db): string {
    const entityType = 'sale_invoice';
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

    return `INV-${String(newValue).padStart(6, '0')}`;
  }

  static createSale(tenantId: string, data: any) {
    return db.transaction((tx) => {
      const invoiceNo = this.generateInvoiceNo(tenantId, tx);
      const saleId = randomUUID();
      const date = data.date ? new Date(data.date) : new Date();
      
      const dueAmount = data.grandTotal - data.paidAmount;

      // 1. Create Sale Record
      const sale = tx.insert(sales).values({
        id: saleId,
        tenantId,
        invoiceNo,
        date,
        customerId: data.customerId,
        subTotal: data.subTotal,
        discount: data.discount,
        otherCharges: data.otherCharges,
        grandTotal: data.grandTotal,
        paidAmount: data.paidAmount,
        dueAmount: dueAmount,
        paymentMethod: data.paymentMethod || null,
        referenceNo: data.referenceNo || null,
        notes: data.notes || null,
        status: 'COMPLETED'
      }).returning().get();

      // 2. Create Sale Items & Decrease Stock
      for (const item of data.items) {
        tx.insert(saleItems).values({
          id: randomUUID(),
          tenantId,
          saleId,
          productId: item.productId,
          variantId: item.variantId || null,
          sellingPrice: item.sellingPrice,
          quantity: item.quantity,
          itemDiscount: item.itemDiscount || 0,
          total: item.total
        }).run();

        // Decrease Product Stock
        const product = tx.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, item.productId))).get();
        if (product) {
          let previousStock = product.currentStock;
          let newStock = previousStock - item.quantity;
          if (product.currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}`);
          }
          tx.update(products)
            .set({ 
              currentStock: product.currentStock - item.quantity,
            })
            .where(eq(products.id, product.id))
            .run();
            
          // Add Inventory Movement
          tx.insert(inventoryMovements).values({
            id: randomUUID(),
            tenantId,
            productId: item.productId,
            variantId: item.variantId || null,
            date,
            type: 'OUT',
            referenceType: 'SALE',
            referenceId: saleId,
            referenceNo: invoiceNo,
            quantity: item.quantity,
            previousStock: previousStock,
            newStock: newStock,
            unitCost: item.sellingPrice,
            totalValue: item.total
          }).run();
        }
      }

      // 3. Update Customer Due
      const customer = tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, data.customerId))).get();
      if (customer) {
        tx.update(customers)
          .set({ previousDue: customer.previousDue + dueAmount })
          .where(eq(customers.id, customer.id))
          .run();
      }

      // 4. Create Customer Ledger Entries
      // Sale increases due (Debit)
      tx.insert(customerLedgers).values({
        id: randomUUID(),
        tenantId,
        customerId: data.customerId,
        date,
        type: 'SALE',
        referenceId: saleId,
        referenceNo: invoiceNo,
        debit: data.grandTotal,
        credit: 0,
        balance: customer ? customer.previousDue + data.grandTotal : data.grandTotal,
        description: `Sales Invoice: ${invoiceNo}`
      }).run();

      // Payment decreases due (Credit)
      if (data.paidAmount > 0) {
        tx.insert(customerLedgers).values({
          id: randomUUID(),
          tenantId,
          customerId: data.customerId,
          date,
          type: 'PAYMENT_RECEIVED',
          referenceId: saleId,
          referenceNo: invoiceNo,
          debit: 0,
          credit: data.paidAmount,
          balance: customer ? customer.previousDue + dueAmount : dueAmount,
          description: `Payment for Invoice: ${invoiceNo}`
        }).run();
      }

      // 5. Create Activity Log
      tx.insert(auditLogs).values({
        id: randomUUID(),
        tenantId,
        action: 'CREATE',
        category: 'SALE',
        resource: 'sales',
        resourceId: saleId,
        details: `Created sale invoice ${invoiceNo} for customer ${data.customerId}`,
      }).run();

      return sale;
    });
  }

  static listSales(tenantId: string, options: { 
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
      eq(sales.tenantId, tenantId)
    ];

    if (search) {
      conditions.push(or(
        like(sales.invoiceNo, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(sales.status, status));
    }

    const whereClause = and(...conditions);

    let orderByColumn;
    switch(sortBy) {
      case 'invoiceNo': orderByColumn = sales.invoiceNo; break;
      case 'date': orderByColumn = sales.date; break;
      case 'grandTotal': orderByColumn = sales.grandTotal; break;
      case 'createdAt': 
      default: orderByColumn = sales.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    // Join with customers to get customer name
    const data = db.select({
        sale: sales,
        customerName: customers.name
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(sales)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static cancelSale(tenantId: string, saleId: string) {
    return db.transaction((tx) => {
      tx.update(sales)
        .set({ status: 'CANCELLED' })
        .where(and(eq(sales.tenantId, tenantId), eq(sales.id, saleId)))
        .run();
    });
  }
}
