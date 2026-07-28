import { db } from "@/shared/db/database";
import { sequences } from "@/platform/db/schema";
import { products, productCategories, productUnits } from "@/templates/egg-tasta/db/schema";

import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ProductRepository {
  /**
   * Generates a sequential 6-digit Product Code for a given tenant.
   * Utilizes database transactions to guarantee uniqueness across concurrent requests.
   * Note: With better-sqlite3, this is completely synchronous.
   */
  static generateProductCode(tenantId: string, tx: any = db): string {
    const entityType = 'product';
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

    return String(newValue).padStart(6, '0');
  }

  /**
   * Syncs the sequence to the maximum imported product code to prevent future collisions
   */
  static syncSequence(tenantId: string, maxCode: number, tx: any = db) {
    const entityType = 'product';
    let seq = tx.select().from(sequences).where(and(eq(sequences.tenantId, tenantId), eq(sequences.entityType, entityType))).get();

    if (!seq) {
      tx.insert(sequences).values({
        id: randomUUID(),
        tenantId,
        entityType,
        currentValue: maxCode
      }).run();
    } else if (seq.currentValue < maxCode) {
      tx.update(sequences)
        .set({ currentValue: maxCode })
        .where(eq(sequences.id, seq.id))
        .run();
    }
  }

  static createProduct(tenantId: string, data: any) {
    // better-sqlite3 transactions MUST be synchronous
    return db.transaction((tx) => {
      let productCode = data.productCode;
      
      if (!productCode) {
        productCode = this.generateProductCode(tenantId, tx);
      } else {
        // If a code was provided (e.g., from an import), we should ensure our sequence stays ahead of it
        const numericCode = parseInt(productCode, 10);
        if (!isNaN(numericCode)) {
          this.syncSequence(tenantId, numericCode, tx);
        }
      }

      const id = randomUUID();
      const product = tx.insert(products).values({
        id,
        tenantId,
        productCode,
        name: data.name,
        categoryId: data.categoryId,
        unitId: data.unitId,
        purchasePrice: data.purchasePrice || 0,
        sellingPrice: data.sellingPrice || 0,
        wholesalePrice: data.wholesalePrice || 0,
        minimumSellingPrice: data.minimumSellingPrice || 0,
        openingStock: data.openingStock || 0,
        minimumStockAlert: data.minimumStockAlert || 0,
        status: data.status || 'ACTIVE',
        notes: data.notes
      }).returning().get();

      return product;
    });
  }

  static getProductByCode(tenantId: string, productCode: string) {
    return db.select()
      .from(products)
      .where(and(
        eq(products.tenantId, tenantId), 
        eq(products.productCode, productCode),
        eq(products.isDeleted, false)
      ))
      .get();
  }

  static listProducts(tenantId: string, options: { 
    search?: string, 
    status?: string, 
    lowStock?: boolean, 
    sortBy?: string, 
    sortDir?: 'asc' | 'desc', 
    page?: number, 
    limit?: number 
  } = {}) {
    const { search = "", status, lowStock, sortBy = "createdAt", sortDir = "desc", page = 1, limit = 50 } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [
      eq(products.tenantId, tenantId),
      eq(products.isDeleted, false)
    ];

    if (search) {
      conditions.push(or(
        like(products.productCode, `%${search}%`),
        like(products.name, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(products.status, status));
    }

    if (lowStock) {
      // In a real ERP, current stock = openingStock + IN - OUT. For now, we use openingStock as current stock representation.
      conditions.push(sql`${products.openingStock} <= ${products.minimumStockAlert}`);
    }

    const whereClause = and(...conditions);

    // Sorting
    let orderByColumn;
    switch(sortBy) {
      case 'productCode': orderByColumn = products.productCode; break;
      case 'name': orderByColumn = products.name; break;
      case 'purchasePrice': orderByColumn = products.purchasePrice; break;
      case 'sellingPrice': orderByColumn = products.sellingPrice; break;
      case 'currentStock': orderByColumn = products.openingStock; break;
      case 'createdAt': 
      default: orderByColumn = products.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const data = db.select()
      .from(products)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(products)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static softDeleteProduct(tenantId: string, productCode: string) {
    return db.update(products)
      .set({ isDeleted: true })
      .where(and(
        eq(products.tenantId, tenantId),
        eq(products.productCode, productCode)
      ))
      .run(); // use .run() for better-sqlite3 sync update without returning
  }

  static bulkUpdateStatus(tenantId: string, productCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
    return db.transaction((tx) => {
      for (const code of productCodes) {
        if (status === 'ARCHIVED') {
          tx.update(products)
            .set({ isDeleted: true })
            .where(and(eq(products.tenantId, tenantId), eq(products.productCode, code)))
            .run();
        } else {
          tx.update(products)
            .set({ status })
            .where(and(eq(products.tenantId, tenantId), eq(products.productCode, code)))
            .run();
        }
      }
    });
  }
}
