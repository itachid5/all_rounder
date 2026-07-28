import { db } from "@/db";
import { sequences, stockAdjustments, inventoryMovements, products, auditLogs } from "@/db/schema";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import { randomUUID } from "crypto";

export class InventoryRepository {
  static generateAdjustmentNo(tenantId: string, tx: any = db): string {
    const entityType = 'stock_adjustment';
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

    return `ADJ-${String(newValue).padStart(6, '0')}`;
  }

  static createStockAdjustment(tenantId: string, data: any, userId?: string) {
    return db.transaction((tx) => {
      const adjustmentNo = this.generateAdjustmentNo(tenantId, tx);
      const adjustmentId = randomUUID();
      const date = data.date ? new Date(data.date) : new Date();

      const product = tx.select().from(products).where(and(eq(products.tenantId, tenantId), eq(products.id, data.productId))).get();
      if (!product) throw new Error("Product not found");

      const systemStock = product.currentStock;
      const actualStock = data.actualStock;
      const difference = actualStock - systemStock;
      const type = difference >= 0 ? 'ADDITION' : 'DEDUCTION';

      // 1. Create Stock Adjustment Record
      const adjustment = tx.insert(stockAdjustments).values({
        id: adjustmentId,
        tenantId,
        adjustmentNo,
        date: date,
        productId: data.productId,
        type,
        systemStock,
        actualStock,
        difference: Math.abs(difference),
        reason: data.reason,
        notes: data.notes,
        status: 'COMPLETED',
        createdBy: userId
      }).returning().get();

      // 2. Update Product Stock
      tx.update(products)
        .set({ currentStock: actualStock })
        .where(eq(products.id, product.id))
        .run();

      // 3. Create Inventory Movement
      if (difference !== 0) {
        tx.insert(inventoryMovements).values({
          id: randomUUID(),
          tenantId,
          productId: data.productId,
          date: date,
          type: type === 'ADDITION' ? 'IN' : 'OUT',
          referenceType: 'ADJUSTMENT',
          referenceId: adjustmentId,
          referenceNo: adjustmentNo,
          quantity: Math.abs(difference),
          previousStock: systemStock,
          newStock: actualStock,
          unitCost: product.purchasePrice,
          totalValue: Math.abs(difference) * product.purchasePrice,
          notes: data.reason
        }).run();
      }

      // 4. Create Activity Log
      if (userId) {
        tx.insert(auditLogs).values({
          id: randomUUID(),
          tenantId,
          userId,
          action: 'CREATE',
          category: 'INVENTORY',
          resource: 'stock_adjustments',
          resourceId: adjustmentId,
          details: `Created stock adjustment ${adjustmentNo} for product ${product.name}`
        }).run();
      }

      return adjustment;
    });
  }

  static listStockAdjustments(tenantId: string, options: { search?: string, page?: number, limit?: number } = {}) {
    const { search = "", page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(stockAdjustments.tenantId, tenantId)];
    if (search) conditions.push(or(like(stockAdjustments.adjustmentNo, `%${search}%`)));

    const whereClause = and(...conditions);

    const data = db.select({
      adjustment: stockAdjustments,
      productName: products.name
    })
    .from(stockAdjustments)
    .leftJoin(products, eq(stockAdjustments.productId, products.id))
    .where(whereClause)
    .orderBy(desc(stockAdjustments.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(stockAdjustments)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }
}
