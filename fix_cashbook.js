const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

const db = new Database('./data/erp.db');

const templateId = '13967390-11ce-438c-8c45-3356983622f5';

// Create 'Cashbook' Parent
const cashbookParentId = randomUUID();
db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Cashbook', 'cashbook-parent', '#', 'WalletCards', NULL, 125, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(cashbookParentId, templateId);

// Create 'Cashbook' Child
db.prepare(`
  INSERT INTO template_navigations (id, template_id, name, slug, route, icon, parent_id, sort_order, is_active, created_at, updated_at)
  VALUES (?, ?, 'Cashbook', 'cashbook', '/app/cashbook', NULL, ?, 10, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
`).run(randomUUID(), templateId, cashbookParentId);

console.log('Cashbook navigation added successfully!');
