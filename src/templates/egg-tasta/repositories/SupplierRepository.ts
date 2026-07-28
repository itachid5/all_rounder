import { db } from "@/db";
import { sequences, suppliers } from "@/db/schema";
import { eq, and, like, or, desc, asc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export class SupplierRepository {
  /**
   * Generates a sequential 6-digit Supplier Code for a given tenant.
   * Utilizes database transactions to guarantee uniqueness across concurrent requests.
   */
  static generateSupplierCode(tenantId: string, tx: any = db): string {
    const entityType = 'supplier';
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

    return `SUP-${String(newValue).padStart(6, '0')}`;
  }

  static createSupplier(tenantId: string, data: any) {
    return db.transaction((tx) => {
      const mobileValue = data.mobile ? data.mobile : null;

      if (mobileValue) {
        // Check for duplicate mobile
        const existing = tx.select().from(suppliers).where(
          and(
            eq(suppliers.tenantId, tenantId),
            eq(suppliers.mobile, mobileValue)
          )
        ).get();

        if (existing) {
          throw new Error("A supplier with this mobile number already exists.");
        }
      }

      const supplierCode = this.generateSupplierCode(tenantId, tx);
      const id = randomUUID();
      
      const supplier = tx.insert(suppliers).values({
        id,
        tenantId,
        supplierCode,
        name: data.name,
        mobile: mobileValue,
        alternativeMobile: data.alternativeMobile || null,
        whatsappNumber: data.whatsappNumber || null,
        email: data.email || null,
        address: data.address || null,
        previousDue: data.previousDue || 0,
        notes: data.notes || null,
        status: data.status || 'ACTIVE'
      }).returning().get();

      return supplier;
    });
  }

  static listSuppliers(tenantId: string, options: { 
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
      eq(suppliers.tenantId, tenantId)
    ];

    if (search) {
      conditions.push(or(
        like(suppliers.supplierCode, `%${search}%`),
        like(suppliers.name, `%${search}%`),
        like(suppliers.mobile, `%${search}%`)
      ));
    }

    if (status) {
      conditions.push(eq(suppliers.status, status));
    }

    const whereClause = and(...conditions);

    // Sorting
    let orderByColumn;
    switch(sortBy) {
      case 'supplierCode': orderByColumn = suppliers.supplierCode; break;
      case 'name': orderByColumn = suppliers.name; break;
      case 'mobile': orderByColumn = suppliers.mobile; break;
      case 'previousDue': orderByColumn = suppliers.previousDue; break;
      case 'createdAt': 
      default: orderByColumn = suppliers.createdAt; break;
    }
    
    const orderBy = sortDir === 'asc' ? asc(orderByColumn) : desc(orderByColumn);

    const data = db.select()
      .from(suppliers)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = db.select({ count: sql`count(*)`.mapWith(Number) })
      .from(suppliers)
      .where(whereClause)
      .get();
      
    return { data, total: countResult?.count || 0 };
  }

  static updateSupplierStatus(tenantId: string, supplierCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
    return db.transaction((tx) => {
      for (const code of supplierCodes) {
        tx.update(suppliers)
          .set({ status })
          .where(and(eq(suppliers.tenantId, tenantId), eq(suppliers.supplierCode, code)))
          .run();
      }
    });
  }
}
