import { db } from "@/shared/db/database";
import { sequences } from "@/platform/db/schema";
import { products, productVariants, productCategories, productUnits } from "@/templates/egg-tasta/db/schema";

import { eq, and, like, or, desc, asc, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ProductRepository {
  /**
   * Generates a sequential 6-digit Product Code for a given tenant.
   * Utilizes database transactions to guarantee uniqueness across concurrent requests.
   * Note: With better-sqlite3, this is completely synchronous.
   */
  static async generateProductCode(tenantId: string, tx: any = db): Promise<string> {
    const entityType = 'product';
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

    return String(newValue).padStart(6, '0');
  }

  /**
   * Syncs the sequence to the maximum imported product code to prevent future collisions
   */
  static async syncSequence(tenantId: string, maxCode: number, tx: any = db) {
    const entityType = 'product';
    let seq = await tx.select().from(sequences).where(and(eq(sequences.tenantId, tenantId), eq(sequences.entityType, entityType))).get();

    if (!seq) {
      await tx.insert(sequences).values({
                id: randomUUID(),
                tenantId,
                entityType,
                currentValue: maxCode
              }).run();
    } else if (seq.currentValue < maxCode) {
      await tx.update(sequences)
                .set({ currentValue: maxCode })
                .where(eq(sequences.id, seq.id))
                .run();
    }
  }

  static async createProduct(tenantId: string, data: any) {
    // better-sqlite3 transactions MUST be synchronous
    return await db.transaction(async (tx) => {
          let productCode = data.productCode;
          
          if (!productCode) {
            productCode = await this.generateProductCode(tenantId, tx);
          } else {
            // If a code was provided (e.g., from an import), we should ensure our sequence stays ahead of it
            const numericCode = parseInt(productCode, 10);
            if (!isNaN(numericCode)) {
              this.syncSequence(tenantId, numericCode, tx);
            }
          }

          const id = randomUUID();
          const product = await tx.insert(products).values({
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
                      notes: data.notes,
                      variantInventoryMode: data.variantInventoryMode || 'PRODUCT_LEVEL',
                      hasVariants: data.variants && data.variants.length > 0
                    }).returning().get();

          if (data.variants && data.variants.length > 0) {
            for (let i = 0; i < data.variants.length; i++) {
              const v = data.variants[i];
              await tx.insert(productVariants).values({
                                id: randomUUID(),
                                tenantId,
                                productId: id,
                                name: v.name,
                                sku: v.sku || null,
                                openingStock: v.openingStock || 0,
                                currentStock: v.openingStock || 0,
                                sortOrder: i
                              }).run();
            }
          }

          return product;
        });
  }

  static async getProductByCode(tenantId: string, productCode: string) {
    const product = await db.select()
          .from(products)
          .where(and(
            eq(products.tenantId, tenantId), 
            eq(products.productCode, productCode),
            eq(products.isDeleted, false)
          ))
          .get();
      
    if (product) {
      const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id)).all();
      (product as any).variants = variants || [];
    }
    
    return product;
  }

  static async listProducts(tenantId: string, options: { 
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

    const [data, countResult] = await Promise.all([
      db.select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset)
        .all(),
      db.select({ count: sql`count(*)`.mapWith(Number) })
        .from(products)
        .where(whereClause)
        .get()
    ]);

    // Fetch variants for these products
    if (data.length > 0) {
      const productIds = data.map(p => p.id);
      const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, productIds)).all();
      
      const variantsByProductId = variants.reduce((acc: any, v: any) => {
        if (!acc[v.productId]) acc[v.productId] = [];
        acc[v.productId].push(v);
        return acc;
      }, {});

      data.forEach((p: any) => {
        p.variants = variantsByProductId[p.id] || [];
      });
    }

    return { data, total: countResult?.count || 0 };
  }

  static async softDeleteProduct(tenantId: string, productCode: string) {
    return await db.update(products)
          .set({ isDeleted: true })
          .where(and(
            eq(products.tenantId, tenantId),
            eq(products.productCode, productCode)
          ))
          .run(); // use .run() for better-sqlite3 sync update without returning
  }

  static async bulkUpdateStatus(tenantId: string, productCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
    return await db.transaction(async (tx) => {
          for (const code of productCodes) {
            if (status === 'ARCHIVED') {
              await tx.update(products)
                                .set({ isDeleted: true })
                                .where(and(eq(products.tenantId, tenantId), eq(products.productCode, code)))
                                .run();
            } else {
              await tx.update(products)
                                .set({ status })
                                .where(and(eq(products.tenantId, tenantId), eq(products.productCode, code)))
                                .run();
            }
          }
        });
  }
}
