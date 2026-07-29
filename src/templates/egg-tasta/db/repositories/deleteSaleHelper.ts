import { db } from "@/shared/db/database";
import { sales, saleItems, products, productVariants, customers, customerLedgers, inventoryMovements } from "@/templates/egg-tasta/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function deleteSaleFromRepo(tenantId: string, saleId: string) {
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
          type: 'IN', // Restore stock is an IN movement
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
        // We previously added dueAmount. Now we subtract it.
        const dueAmount = sale.dueAmount || (sale.grandTotal - (sale.paidAmount || 0));
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
