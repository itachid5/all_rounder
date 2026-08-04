import { db } from "@/shared/db/database";
import { sequences } from "@/platform/db/schema";
import { products, productVariants, productCategories, productUnits, inventoryMovements, saleItems, purchaseItems } from "@/templates/egg-tasta/db/schema";
import { eq, and, like, or, desc, asc, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";

export class ProductRepository {
  /**
   * Generates a sequential 6-digit Product Code for a given tenant.
   */
  static async generateProductCode(tenantId: string, tx: any = db): Promise<string> {
    const entityType = "product";
    let seq = await tx
      .select()
      .from(sequences)
      .where(and(eq(sequences.tenantId, tenantId), eq(sequences.entityType, entityType)))
      .get();

    let newValue = 1;
    if (!seq) {
      await tx
        .insert(sequences)
        .values({
          id: randomUUID(),
          tenantId,
          entityType,
          currentValue: 1,
        })
        .run();
    } else {
      const updated = await tx
        .update(sequences)
        .set({ currentValue: seq.currentValue + 1 })
        .where(eq(sequences.id, seq.id))
        .returning()
        .get();
      newValue = updated.currentValue;
    }

    return String(newValue).padStart(6, "0");
  }

  static async syncSequence(tenantId: string, maxCode: number, tx: any = db) {
    const entityType = "product";
    let seq = await tx
      .select()
      .from(sequences)
      .where(and(eq(sequences.tenantId, tenantId), eq(sequences.entityType, entityType)))
      .get();

    if (!seq) {
      await tx
        .insert(sequences)
        .values({
          id: randomUUID(),
          tenantId,
          entityType,
          currentValue: maxCode,
        })
        .run();
    } else if (seq.currentValue < maxCode) {
      await tx
        .update(sequences)
        .set({ currentValue: maxCode })
        .where(eq(sequences.id, seq.id))
        .run();
    }
  }

  /**
   * Create Product with full Opening Stock & initial Inventory Movement tracking
   */
  static async createProduct(tenantId: string, data: any) {
    return await db.transaction(async (tx) => {
      let productCode = data.productCode;

      if (!productCode) {
        productCode = await this.generateProductCode(tenantId, tx);
      } else {
        const numericCode = parseInt(productCode, 10);
        if (!isNaN(numericCode)) {
          await this.syncSequence(tenantId, numericCode, tx);
        }
      }

      const openingStock = data.openingStock || 0;
      const purchasePrice = data.purchasePrice || 0;
      const sellingPrice = data.sellingPrice || 0;
      const unitCost = purchasePrice > 0 ? purchasePrice : sellingPrice;

      const id = randomUUID();
      const product = await tx
        .insert(products)
        .values({
          id,
          tenantId,
          productCode,
          name: data.name,
          categoryId: data.categoryId || null,
          unitId: data.unitId || null,
          purchasePrice,
          sellingPrice,
          wholesalePrice: data.wholesalePrice || 0,
          minimumSellingPrice: data.minimumSellingPrice || 0,
          openingStock,
          currentStock: openingStock, // Initialize currentStock to openingStock
          minimumStockAlert: data.minimumStockAlert || 0,
          status: data.status || "ACTIVE",
          notes: data.notes || null,
          variantInventoryMode: data.variantInventoryMode || "PRODUCT_LEVEL",
          hasVariants: data.variants && data.variants.length > 0,
          isDeleted: false,
        })
        .returning()
        .get();

      // Record Initial Opening Stock Inventory Movement if openingStock > 0
      if (openingStock > 0) {
        await tx
          .insert(inventoryMovements)
          .values({
            id: randomUUID(),
            tenantId,
            productId: id,
            variantId: null,
            date: new Date(),
            type: "IN",
            referenceType: "OPENING_STOCK",
            referenceId: id,
            referenceNo: `OPENING-${productCode}`,
            quantity: openingStock,
            previousStock: 0,
            newStock: openingStock,
            unitCost,
            totalValue: openingStock * unitCost,
            notes: "Initial Opening Stock",
          })
          .run();
      }

      // Process Variants
      if (data.variants && data.variants.length > 0) {
        let totalVariantStock = 0;
        for (let i = 0; i < data.variants.length; i++) {
          const v = data.variants[i];
          const vStock = v.openingStock || 0;
          totalVariantStock += vStock;
          const variantId = randomUUID();

          await tx
            .insert(productVariants)
            .values({
              id: variantId,
              tenantId,
              productId: id,
              name: v.name,
              sku: v.sku || null,
              openingStock: vStock,
              currentStock: vStock,
              sortOrder: i,
            })
            .run();

          if (vStock > 0) {
            await tx
              .insert(inventoryMovements)
              .values({
                id: randomUUID(),
                tenantId,
                productId: id,
                variantId: variantId,
                date: new Date(),
                type: "IN",
                referenceType: "OPENING_STOCK",
                referenceId: variantId,
                referenceNo: `OPENING-${productCode}-${v.name.replace(/\s+/g, "-")}`,
                quantity: vStock,
                previousStock: 0,
                newStock: vStock,
                unitCost,
                totalValue: vStock * unitCost,
                notes: `Initial Opening Stock for variant ${v.name}`,
              })
              .run();
          }
        }

        // If VARIANT_LEVEL, update product total stock
        if (data.variantInventoryMode === "VARIANT_LEVEL") {
          await tx
            .update(products)
            .set({ currentStock: totalVariantStock, openingStock: totalVariantStock })
            .where(eq(products.id, id))
            .run();
        }
      }

      return product;
    });
  }

  /**
   * Get Product by Code including variants
   */
  static async getProductByCode(tenantId: string, productCode: string) {
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.tenantId, tenantId), eq(products.productCode, productCode)))
      .get();

    if (product) {
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .all();
      (product as any).variants = variants || [];
    }

    return product;
  }

  /**
   * Update Product details without corrupting existing accumulated stock
   */
  static async updateProduct(tenantId: string, productCode: string, data: any) {
    return await db.transaction(async (tx) => {
      const product = await tx
        .select()
        .from(products)
        .where(and(eq(products.tenantId, tenantId), eq(products.productCode, productCode)))
        .get();

      if (!product) throw new Error("Product not found");

      const hasVariants = data.variants && data.variants.length > 0;

      await tx
        .update(products)
        .set({
          name: data.name,
          categoryId: data.categoryId || null,
          unitId: data.unitId || null,
          purchasePrice: data.purchasePrice || 0,
          sellingPrice: data.sellingPrice || 0,
          wholesalePrice: data.wholesalePrice || 0,
          minimumSellingPrice: data.minimumSellingPrice || 0,
          minimumStockAlert: data.minimumStockAlert || 0,
          status: data.status || "ACTIVE",
          notes: data.notes || null,
          variantInventoryMode: data.variantInventoryMode || "PRODUCT_LEVEL",
          hasVariants,
          updatedAt: new Date(),
        })
        .where(eq(products.id, product.id))
        .run();

      // Update Variants: delete old and re-create updated set (preserving existing variant currentStock where possible)
      const existingVariants = await tx
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, product.id))
        .all();

      const existingVarMap = new Map<string, any>();
      existingVariants.forEach((v) => existingVarMap.set(v.name.toLowerCase(), v));

      await tx
        .delete(productVariants)
        .where(eq(productVariants.productId, product.id))
        .run();

      if (hasVariants) {
        for (let i = 0; i < data.variants.length; i++) {
          const v = data.variants[i];
          const prevVar = existingVarMap.get(v.name.toLowerCase());
          const currentStock = prevVar ? prevVar.currentStock : v.openingStock || 0;

          await tx
            .insert(productVariants)
            .values({
              id: randomUUID(),
              tenantId,
              productId: product.id,
              name: v.name,
              sku: v.sku || null,
              openingStock: v.openingStock || 0,
              currentStock,
              sortOrder: i,
            })
            .run();
        }
      }

      return await this.getProductByCode(tenantId, productCode);
    });
  }

  /**
   * Duplicate Product
   */
  static async duplicateProduct(tenantId: string, productCode: string) {
    const orig = await this.getProductByCode(tenantId, productCode);
    if (!orig) throw new Error("Original product not found");

    const copyData = {
      name: `${orig.name} (Copy)`,
      categoryId: orig.categoryId,
      unitId: orig.unitId,
      purchasePrice: orig.purchasePrice,
      sellingPrice: orig.sellingPrice,
      wholesalePrice: orig.wholesalePrice,
      minimumSellingPrice: orig.minimumSellingPrice,
      openingStock: orig.openingStock,
      minimumStockAlert: orig.minimumStockAlert,
      status: "ACTIVE",
      variantInventoryMode: orig.variantInventoryMode,
      notes: orig.notes,
      variants: ((orig as any).variants || []).map((v: any) => ({
        name: v.name,
        sku: v.sku ? `${v.sku}-COPY` : null,
        openingStock: v.openingStock || 0,
      })),
    };

    return await this.createProduct(tenantId, copyData);
  }

  /**
   * List Products with optional soft deleted inclusion
   */
  static async listProducts(
    tenantId: string,
    options: {
      search?: string;
      status?: string;
      lowStock?: boolean;
      includeDeleted?: boolean;
      sortBy?: string;
      sortDir?: "asc" | "desc";
      page?: number;
      limit?: number;
    } = {}
  ) {
    const {
      search = "",
      status,
      lowStock,
      includeDeleted = false,
      sortBy = "createdAt",
      sortDir = "desc",
      page = 1,
      limit = 50,
    } = options;
    const offset = (page - 1) * limit;

    const conditions: any[] = [eq(products.tenantId, tenantId)];

    if (status === "SOFT_DELETED") {
      conditions.push(eq(products.isDeleted, true));
    } else {
      if (!includeDeleted) {
        conditions.push(eq(products.isDeleted, false));
      }
      if (status) {
        conditions.push(eq(products.status, status));
      }
    }

    if (search) {
      conditions.push(
        or(like(products.productCode, `%${search}%`), like(products.name, `%${search}%`))
      );
    }

    if (lowStock) {
      conditions.push(sql`${products.currentStock} <= ${products.minimumStockAlert}`);
    }

    const whereClause = and(...conditions);

    let orderByColumn;
    switch (sortBy) {
      case "productCode":
        orderByColumn = products.productCode;
        break;
      case "name":
        orderByColumn = products.name;
        break;
      case "purchasePrice":
        orderByColumn = products.purchasePrice;
        break;
      case "sellingPrice":
        orderByColumn = products.sellingPrice;
        break;
      case "currentStock":
        orderByColumn = products.currentStock;
        break;
      case "createdAt":
      default:
        orderByColumn = products.createdAt;
        break;
    }

    const orderBy = sortDir === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    const [data, countResult] = await Promise.all([
      db
        .select()
        .from(products)
        .where(whereClause)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset)
        .all(),
      db.select({ count: sql`count(*)`.mapWith(Number) }).from(products).where(whereClause).get(),
    ]);

    if (data.length > 0) {
      const productIds = data.map((p) => p.id);
      const variants = await db
        .select()
        .from(productVariants)
        .where(inArray(productVariants.productId, productIds))
        .all();

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

  /**
   * Soft Delete Product
   */
  static async softDeleteProduct(tenantId: string, productCode: string) {
    return await db
      .update(products)
      .set({ isDeleted: true, status: "SOFT_DELETED" })
      .where(and(eq(products.tenantId, tenantId), eq(products.productCode, productCode)))
      .run();
  }

  /**
   * Restore Soft Deleted Product
   */
  static async restoreProduct(tenantId: string, productCode: string) {
    return await db
      .update(products)
      .set({ isDeleted: false, status: "ACTIVE" })
      .where(and(eq(products.tenantId, tenantId), eq(products.productCode, productCode)))
      .run();
  }

  /**
   * Hard Delete Product with Transaction Integrity Guard
   */
  static async hardDeleteProduct(tenantId: string, productCode: string) {
    return await db.transaction(async (tx) => {
      const product = await tx
        .select()
        .from(products)
        .where(and(eq(products.tenantId, tenantId), eq(products.productCode, productCode)))
        .get();

      if (!product) throw new Error("Product not found.");

      // Check transaction existence: Sales, Purchases, or Non-Opening-Stock Inventory Movements
      const [salesCount, purchasesCount, movementsCount] = await Promise.all([
        tx
          .select({ count: sql`count(*)`.mapWith(Number) })
          .from(saleItems)
          .where(eq(saleItems.productId, product.id))
          .get(),
        tx
          .select({ count: sql`count(*)`.mapWith(Number) })
          .from(purchaseItems)
          .where(eq(purchaseItems.productId, product.id))
          .get(),
        tx
          .select({ count: sql`count(*)`.mapWith(Number) })
          .from(inventoryMovements)
          .where(
            and(
              eq(inventoryMovements.productId, product.id),
              sql`${inventoryMovements.referenceType} != 'OPENING_STOCK'`
            )
          )
          .get(),
      ]);

      const hasSales = (salesCount?.count || 0) > 0;
      const hasPurchases = (purchasesCount?.count || 0) > 0;
      const hasMovements = (movementsCount?.count || 0) > 0;

      if (hasSales || hasPurchases || hasMovements) {
        const reasons = [];
        if (hasSales) reasons.push("Sales Records");
        if (hasPurchases) reasons.push("Purchase Records");
        if (hasMovements) reasons.push("Inventory Movements");

        throw new Error(
          `Cannot hard delete "${product.name}" because it has existing ${reasons.join(
            ", "
          )}. Use Soft Delete to preserve business history.`
        );
      }

      // Safe to hard delete: delete opening stock movements, variants, and product
      await tx
        .delete(inventoryMovements)
        .where(eq(inventoryMovements.productId, product.id))
        .run();

      await tx
        .delete(productVariants)
        .where(eq(productVariants.productId, product.id))
        .run();

      await tx
        .delete(products)
        .where(eq(products.id, product.id))
        .run();

      return { success: true };
    });
  }

  static async bulkUpdateStatus(
    tenantId: string,
    productCodes: string[],
    status: "ACTIVE" | "INACTIVE" | "SOFT_DELETED"
  ) {
    return await db.transaction(async (tx) => {
      for (const code of productCodes) {
        if (status === "SOFT_DELETED") {
          await tx
            .update(products)
            .set({ isDeleted: true, status: "SOFT_DELETED" })
            .where(and(eq(products.tenantId, tenantId), eq(products.productCode, code)))
            .run();
        } else {
          await tx
            .update(products)
            .set({ status, isDeleted: false })
            .where(and(eq(products.tenantId, tenantId), eq(products.productCode, code)))
            .run();
        }
      }
    });
  }
}
