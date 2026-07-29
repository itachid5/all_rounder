const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('./data/erp.db');

const templateId = '13967390-11ce-438c-8c45-3356983622f5';

// 1. Get Parents
const salesParent = db.prepare(`SELECT * FROM template_navigations WHERE template_id = ? AND name = 'Sales' AND parent_id IS NULL;`).get(templateId);
const collectionParent = db.prepare(`SELECT * FROM template_navigations WHERE template_id = ? AND name = 'Customer Collection' AND parent_id IS NULL;`).get(templateId);

console.log('Sales Parent:', salesParent.id);
console.log('Collection Parent:', collectionParent.id);

// Delete existing 'Sales Return' parent if it exists (for clean slate)
db.prepare(`DELETE FROM template_navigations WHERE template_id = ? AND name = 'Sales Return' AND parent_id IS NULL;`).run(templateId);

// 2. Create 'Sales Return' Parent
const salesReturnParentId = randomUUID();
db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Sales Return', 'sales-return', '#', 'HandCoins', NULL, 85, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(salesReturnParentId, templateId);

// 3. Fix Sales Children
// Remove 'Sales Return' and 'Customer Collection' from Sales
db.prepare(`DELETE FROM template_navigations WHERE template_id = ? AND parent_id = ? AND name IN ('Sales Return', 'Customer Collection');`).run(templateId, salesParent.id);

// Add 'Sales Item Report' to Sales if not exist
const salesItemReport = db.prepare(`SELECT * FROM template_navigations WHERE template_id = ? AND parent_id = ? AND name = 'Sales Item Report';`).get(templateId, salesParent.id);
if (!salesItemReport) {
  db.prepare(`
    INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
    VALUES (?, ?, 'Sales Item Report', 'sales-item-report', '/app/sales/item-report', NULL, ?, 70, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `).run(randomUUID(), templateId, salesParent.id);
}

// 4. Setup Sales Return Children
db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Add Sales Return', 'add-sales-return', '/app/sales-return/new', NULL, ?, 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, salesReturnParentId);

db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Manage Sales Returns', 'manage-sales-returns', '/app/sales-return/manage', NULL, ?, 20, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, salesReturnParentId);

db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Sales Return Report', 'sales-return-report', '/app/sales-return/report', NULL, ?, 30, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, salesReturnParentId);

// 5. Setup Customer Collection Children
// Clear existing children to rebuild cleanly
db.prepare(`DELETE FROM template_navigations WHERE template_id = ? AND parent_id = ?;`).run(templateId, collectionParent.id);

db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Receive Collection', 'receive-collection', '/app/customer-collection/new', NULL, ?, 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, collectionParent.id);

db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Manage Collections', 'manage-collections', '/app/customer-collection/manage', NULL, ?, 20, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, collectionParent.id);

db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Collection Report', 'collection-report', '/app/customer-collection/report', NULL, ?, 30, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, collectionParent.id);

console.log('Navigation updated successfully!');
