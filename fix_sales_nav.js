const Database = require('better-sqlite3');
const db = new Database('./data/erp.db');

const salesParentId = '6baae79d-3e7e-4afe-ad9f-9c39f584d9ee';

// 1. Rename 'New Sale' to 'Add Sale'
db.prepare(`UPDATE template_navigations SET name = 'Add Sale' WHERE parent_id = ? AND name = 'New Sale';`).run(salesParentId);

// 2. Hide 'Cash Sale'
db.prepare(`UPDATE template_navigations SET is_active = 0 WHERE parent_id = ? AND name = 'Cash Sale';`).run(salesParentId);

// 3. Update sort orders
db.prepare(`UPDATE template_navigations SET sort_order = 30 WHERE parent_id = ? AND name = 'Sales Report';`).run(salesParentId);
db.prepare(`UPDATE template_navigations SET sort_order = 40 WHERE parent_id = ? AND name = 'Sales Item Report';`).run(salesParentId);

console.log('Sales navigation updated successfully!');
