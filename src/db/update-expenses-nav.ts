import { db } from "../shared/db/database";
import * as schema from "../platform/db/schema";
import { eq, inArray } from "drizzle-orm";
import crypto from "crypto";

async function run() {
  console.log("Updating Expenses navigation in DB...");
  const templatesList = await db.select().from(schema.templates).all();

  for (const tRecord of templatesList) {
    const existingNavs = await db
      .select()
      .from(schema.templateNavigations)
      .where(eq(schema.templateNavigations.templateId, tRecord.id))
      .all();

    const parentIdsToDelete: string[] = [];
    for (const nav of existingNavs) {
      if (nav.name === "Expenses" || nav.slug === "expenses") {
        parentIdsToDelete.push(nav.id);
      }
    }

    if (parentIdsToDelete.length > 0) {
      await db
        .delete(schema.templateNavigations)
        .where(inArray(schema.templateNavigations.parentId, parentIdsToDelete))
        .execute();

      await db
        .delete(schema.templateNavigations)
        .where(inArray(schema.templateNavigations.id, parentIdsToDelete))
        .execute();
    }

    const expensesParentId = crypto.randomUUID();
    await db.insert(schema.templateNavigations).values({
      id: expensesParentId,
      templateId: tRecord.id,
      name: "Expenses",
      slug: "expenses",
      route: "#",
      icon: "DollarSign",
      parentId: null,
      sortOrder: 11,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).execute();

    const children = [
      { name: "Add Expense Head", route: "/app/expenses/heads", sortOrder: 1 },
      { name: "Add Expense", route: "/app/expenses/new", sortOrder: 2 },
      { name: "Manage Expenses", route: "/app/expenses/manage", sortOrder: 3 },
      { name: "Expense Report", route: "/app/expenses/report", sortOrder: 4 },
    ];

    for (const child of children) {
      const childSlug = child.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await db.insert(schema.templateNavigations).values({
        id: crypto.randomUUID(),
        templateId: tRecord.id,
        name: child.name,
        slug: childSlug,
        route: child.route,
        icon: null,
        parentId: expensesParentId,
        sortOrder: child.sortOrder,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).execute();
    }
  }

  console.log("Expenses navigation updated successfully in database.");
}

run().catch(console.error);
