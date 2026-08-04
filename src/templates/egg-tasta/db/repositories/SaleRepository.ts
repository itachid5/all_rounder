import { db } from "@/shared/db/database";
import { sequences, auditLogs } from "@/platform/db/schema";
import { sales, saleItems, products, productVariants, customers, customerLedgers, inventoryMovements } from "@/templates/egg-tasta/db/schema";

import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class SaleRepository {
  /**
   * Generates a sequential Invoice Number for a given tenant.
   */
  static async generateInvoiceNo(tenantId: string, tx: any = db): Promise<string> {
    const entityType = 'sale_invoice';
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

    return `INV-${String(newValue).padStart(6, '0')}`;
  }

  static async createSale(tenantId: string, data: any) {
    return await db.transaction(async (tx) => {
          const invoiceNo = await this.generateInvoiceNo(tenantId, tx);
          const saleId = randomUUID();
          const date = data.date ? new Date(data.date) : new Date();
          
          const dueAmount = data.grandTotal - data.paidAmount;

          // 1. Create Sale Record
          const sale = await tx.insert(sales).values({
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
            await tx.insert(saleItems).values({
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
            const product = await tx.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, item.productId))).get();
            if (product) {
              let previousStock = product.currentStock || 0;
              let newStock = previousStock - item.quantity;
              const isSalesOnly = item.isSalesOnly || product.variantInventoryMode === 'SALES_ONLY' || product.variantInventoryMode === 'NONE';

              if (!isSalesOnly) {
                if (product.variantInventoryMode === 'VARIANT_LEVEL' && item.variantId) {
                  const variant = await tx.select().from(productVariants).where(and(eq(productVariants.tenantId, tenantId), eq(productVariants.id, item.variantId))).get();
                  if (variant) {
                    previousStock = variant.currentStock;
                    newStock = previousStock - item.quantity;
                    
                    if (newStock < 0) {
                      throw new Error(`Insufficient stock for variant ${variant.name} of product ${product.name}`);
                    }
                    
                    await tx.update(productVariants)
                      .set({ currentStock: newStock })
                      .where(eq(productVariants.id, variant.id))
                      .run();
                  }
                } else if (product.variantInventoryMode === 'PRODUCT_LEVEL') {
                  if (product.currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for product ${product.name}`);
                  }
                  await tx.update(products)
                    .set({ 
                      currentStock: product.currentStock - item.quantity,
                    })
                    .where(eq(products.id, product.id))
                    .run();
                }
              }

              // Add Inventory Movement
              await tx.insert(inventoryMovements).values({
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
          const customer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, data.customerId))).get();
          if (customer) {
            await tx.update(customers)
                            .set({ previousDue: customer.previousDue + dueAmount })
                            .where(eq(customers.id, customer.id))
                            .run();
          }

          // 4. Create Customer Ledger Entries & Central Ledger Entries
          await tx.insert(customerLedgers).values({
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

          const { LedgerService } = await import("@/templates/egg-tasta/services/LedgerService");
          await LedgerService.postEntry(tenantId, {
            transactionType: "SALES",
            debit: data.grandTotal,
            credit: 0,
            customerId: data.customerId,
            entityType: "CUSTOMER",
            referenceType: "SALE",
            referenceId: saleId,
            referenceNo: invoiceNo,
            entryDate: date,
            description: `Sales Invoice #${invoiceNo}`,
          }, tx);

          // Payment decreases due (Credit)
          if (data.paidAmount > 0) {
            await tx.insert(customerLedgers).values({
                            id: randomUUID(),
                            tenantId,
                            customerId: data.customerId,
                            date,
                            type: 'PAYMENT_RECEIVED',
                            referenceId: saleId,
                            referenceNo: invoiceNo,
                            debit: 0,
                            credit: data.paidAmount,
                            balance: customer ? customer.previousDue + data.grandTotal - data.paidAmount : data.grandTotal - data.paidAmount,
                            description: `Payment Received for Invoice: ${invoiceNo}`
                          }).run();

            await LedgerService.postEntry(tenantId, {
              transactionType: "CUSTOMER_COLLECTION",
              debit: 0,
              credit: data.paidAmount,
              customerId: data.customerId,
              entityType: "CUSTOMER",
              referenceType: "SALE_PAYMENT",
              referenceId: saleId,
              referenceNo: invoiceNo,
              entryDate: date,
              description: `Payment received for Invoice #${invoiceNo}`,
            }, tx);
          }

          // 5. Create Activity Log
          await tx.insert(auditLogs).values({
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

  static async listSales(tenantId: string, options: { 
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
    const [data, countResult] = await Promise.all([
      db.select({
        sale: sales,
        customerName: customers.name
      })
      .from(sales)
      .leftJoin(customers, eq(sales.customerId, customers.id))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all(),
      db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(sales)
      .where(whereClause)
      .get()
    ]);

    return { data, total: countResult?.count || 0 };
  }

  static async deleteSale(tenantId: string, saleId: string) {
    return await db.transaction(async (tx) => {
      // 1. Fetch sale
      const sale = await tx.select().from(sales).where(and(eq(sales.tenantId, tenantId), eq(sales.id, saleId))).get();
      if (!sale) throw new Error("Sale not found");
  
      // 2. Fetch sale items
      const items = await tx.select().from(saleItems).where(eq(saleItems.saleId, saleId)).all();
  
      // 3. Restore Stock
      for (const item of items) {
        const product = await tx.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, item.productId))).get();
        if (product) {
          let previousStock = product.currentStock;
          let newStock = previousStock + item.quantity;
          
          if (product.variantInventoryMode === 'VARIANT_LEVEL' && item.variantId) {
            const variant = await tx.select().from(productVariants).where(and(eq(productVariants.tenantId, tenantId), eq(productVariants.id, item.variantId))).get();
            if (variant) {
              previousStock = variant.currentStock;
              newStock = previousStock + item.quantity;
              await tx.update(productVariants)
                .set({ currentStock: newStock })
                .where(eq(productVariants.id, variant.id))
                .run();
            }
          }
          
          await tx.update(products)
            .set({ currentStock: product.currentStock + item.quantity })
            .where(eq(products.id, product.id))
            .run();
  
          // Add Inventory Movement to log the restoration
          await tx.insert(inventoryMovements).values({
            id: randomUUID(),
            tenantId,
            productId: item.productId,
            variantId: item.variantId || null,
            date: new Date(),
            type: 'IN',
            referenceType: 'SALE_DELETE',
            referenceId: saleId,
            referenceNo: sale.invoiceNo,
            quantity: item.quantity,
            previousStock: previousStock,
            newStock: newStock,
            unitCost: item.sellingPrice,
            totalValue: item.total
          }).run();
        }
      }
  
      // 4. Update Customer Due
      if (sale.customerId) {
        const customer = await tx.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.id, sale.customerId))).get();
        if (customer) {
          const dueAmount = sale.dueAmount !== null ? sale.dueAmount : (sale.grandTotal - (sale.paidAmount || 0));
          await tx.update(customers)
            .set({ previousDue: customer.previousDue - dueAmount })
            .where(eq(customers.id, customer.id))
            .run();
        }
      }
  
      // 5. Delete Customer Ledger Entries
      await tx.delete(customerLedgers).where(and(eq(customerLedgers.tenantId, tenantId), eq(customerLedgers.referenceId, saleId))).run();
  
      // 6. Delete Sale Items
      await tx.delete(saleItems).where(eq(saleItems.saleId, saleId)).run();
  
      // 7. Delete Sale
      await tx.delete(sales).where(and(eq(sales.tenantId, tenantId), eq(sales.id, saleId))).run();
  
      return true;
    });
  }
}
