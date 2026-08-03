import { db } from "../shared/db/database";
import * as schema from "../platform/db/schema";
import { eq, or, inArray } from "drizzle-orm";
import crypto from "crypto";

async function run() {
  console.log("Updating Sales and Sales Return navigation in DB...");
  const templatesList = await db.select().from(schema.templates).all();

  for (const tRecord of templatesList) {
    // Find existing Sales and Sales Return parents
    const existingNavs = await db
      .select()
      .from(schema.templateNavigations)
      .where(eq(schema.templateNavigations.templateId, tRecord.id))
      .all();

    const parentIdsToDelete: string[] = [];
    for (const nav of existingNavs) {
      if (nav.name === "Sales" || nav.name === "Sales Return" || nav.slug === "sales" || nav.slug === "sales-return") {
        parentIdsToDelete.push(nav.id);
      }
    }

    if (parentIdsToDelete.length > 0) {
      // Delete children first
      await db
        .delete(schema.templateNavigations)
        .where(inArray(schema.templateNavigations.parentId, parentIdsToDelete))
        .execute();

      // Delete parents
      await db
        .delete(schema.templateNavigations)
        .where(inArray(schema.templateNavigations.id, parentIdsToDelete))
        .execute();
    }

    // Insert new Sales menu
    const salesParentId = crypto.randomUUID();
    await db.insert(schema.templateNavigations).values({
      id: salesParentId,
      templateId: tRecord.id,
      name: "Sales",
      slug: "sales",
      route: "#",
      icon: "DollarSign",
      parentId: null,
      sortOrder: 8,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();

    const salesChildren = [
      { name: "Add Sale", route: "/app/sales/new", sortOrder: 1 },
      { name: "Manage Sales", route: "/app/sales/manage", sortOrder: 2 },
      { name: "Sales Report", route: "/app/sales/report", sortOrder: 3 },
    ];

    for (const child of salesChildren) {
      const childSlug = child.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(schema.templateNavigations).values({
        id: crypto.randomUUID(),
        templateId: tRecord.id,
        name: child.name,
        slug: childSlug,
        route: child.route,
        icon: null,
        parentId: salesParentId,
        sortOrder: child.sortOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).execute();
    }

    // Insert new Sales Return menu
    const returnsParentId = crypto.randomUUID();
    await db.insert(schema.templateNavigations).values({
      id: returnsParentId,
      templateId: tRecord.id,
      name: "Sales Return",
      slug: "sales-return",
      route: "#",
      icon: "MoveRight",
      parentId: null,
      sortOrder: 9,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();

    const returnsChildren = [
      { name: "Add Sales Return", route: "/app/sales-return/new", sortOrder: 1 },
      { name: "Manage Sales Return", route: "/app/sales-return/manage", sortOrder: 2 },
      { name: "Sales Return Report", route: "/app/sales-return/report", sortOrder: 3 },
    ];

    for (const child of returnsChildren) {
      const childSlug = child.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(schema.templateNavigations).values({
        id: crypto.randomUUID(),
        templateId: tRecord.id,
        name: child.name,
        slug: childSlug,
        route: child.route,
        icon: null,
        parentId: returnsParentId,
        sortOrder: child.sortOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).execute();
    }
  }

  console.log("Sales and Sales Return navigation updated successfully.");
}

run().catch(console.error);
