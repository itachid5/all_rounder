import { db } from './src/db';
import { templates, templateNavigations } from './src/db/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

const eggShopNav = [
  { name: "Dashboard", slug: "dashboard", route: "/app/dashboard", icon: "dashboard", subItems: [] },
  { 
    name: "Products", slug: "products", route: "/app/products", icon: "layers",
    subItems: [
      { name: "Add Product", slug: "add-product", route: "/app/products/new" },
      { name: "Manage Products", slug: "manage-products", route: "/app/products/manage" },
      { name: "Product List", slug: "product-list", route: "/app/products" },
    ]
  },
  { 
    name: "Suppliers", slug: "suppliers", route: "/app/suppliers", icon: "users",
    subItems: [
      { name: "Add Supplier", slug: "add-supplier", route: "/app/suppliers/new" },
      { name: "Manage Suppliers", slug: "manage-suppliers", route: "/app/suppliers/manage" },
      { name: "Supplier Ledger", slug: "supplier-ledger", route: "/app/suppliers/ledger" },
      { name: "Supplier Due List", slug: "supplier-due", route: "/app/suppliers/due" },
    ]
  },
  {
    name: "Supplier Payments",
    slug: "supplier-payments",
    icon: "HandCoins",
    route: "/app/supplier-payments",
    subItems: [
      { name: "Supplier Payment", slug: "supplier-payment", route: "/app/supplier-payments/new" },
      { name: "Manage Payments", slug: "manage-payments", route: "/app/supplier-payments/manage" },
      { name: "Payment Report", slug: "payment-report", route: "/app/supplier-payments/report" },
    ]
  },
  { 
    name: "Customers", slug: "customers", route: "/app/customers", icon: "users",
    subItems: [
      { name: "Add Customer", slug: "add-customer", route: "/app/customers/new" },
      { name: "Manage Customers", slug: "manage-customers", route: "/app/customers/manage" },
      { name: "Customer Ledger", slug: "customer-ledger", route: "/app/customers/ledger" },
      { name: "Customer Due List", slug: "customer-due", route: "/app/customers/due" },
    ]
  },
  {
    name: "Customer Collection",
    slug: "customer-collection",
    icon: "WalletCards",
    route: "/app/customer-collection",
    subItems: [
      { name: "Receive Collection", slug: "receive-collection", route: "/app/customer-collection/new" },
      { name: "Manage Collections", slug: "manage-collections", route: "/app/customer-collection/manage" },
      { name: "Collection Report", slug: "collection-report", route: "/app/customer-collection/report" },
    ]
  },
  { 
    name: "Purchases", slug: "purchases", route: "/app/purchases", icon: "shield",
    subItems: [
      { name: "New Purchase", slug: "new-purchase", route: "/app/purchases/new" },
      { name: "Manage Purchases", slug: "manage-purchases", route: "/app/purchases/manage" },
      { name: "Purchase Return", slug: "purchase-return", route: "/app/purchases/returns" },
      { name: "Purchase Report", slug: "purchase-report", route: "/app/purchases/report" },
    ]
  },
  { 
    name: "Sales", slug: "sales", route: "/app/sales", icon: "activity",
    subItems: [
      { name: "New Sale", slug: "new-sale", route: "/app/sales/new" },
      { name: "Manage Sales", slug: "manage-sales", route: "/app/sales/manage" },
      { name: "Sales Return", slug: "sales-return", route: "/app/sales/returns" },
      { name: "Customer Collection", slug: "customer-collection", route: "/app/sales/payments" },
      { name: "Cash Sale", slug: "cash-sale", route: "/app/sales/cash" },
      { name: "Sales Report", slug: "sales-report", route: "/app/sales/report" },
    ]
  },
  { 
    name: "Inventory", slug: "inventory", route: "/app/inventory", icon: "layers",
    subItems: [
      { name: "Current Stock", slug: "current-stock", route: "/app/inventory" },
      { name: "Stock Movement", slug: "stock-movement", route: "/app/inventory/movement" },
      { name: "Stock Adjustment", slug: "stock-adjustment", route: "/app/inventory/adjustment" },
      { name: "Low Stock", slug: "low-stock", route: "/app/inventory/low" },
      { name: "Stock Valuation", slug: "stock-valuation", route: "/app/inventory/valuation" },
      { name: "Adjustment Report", slug: "adjustment-report", route: "/app/inventory/report" },
    ]
  },
  { 
    name: "Tray Management", slug: "tray-management", route: "/app/trays", icon: "layers",
    subItems: [
      { name: "Tray In", slug: "tray-in", route: "/app/trays/in" },
      { name: "Tray Out", slug: "tray-out", route: "/app/trays/out" },
      { name: "Tray Balance", slug: "tray-balance", route: "/app/trays/balance" },
      { name: "Tray Ledger", slug: "tray-ledger", route: "/app/trays/ledger" },
    ]
  },
  { 
    name: "Expenses", slug: "expenses", route: "/app/expenses", icon: "activity",
    subItems: [
      { name: "Add Expense", slug: "add-expense", route: "/app/expenses/new" },
      { name: "Manage Expenses", slug: "manage-expenses", route: "/app/expenses/manage" },
      { name: "Expense Categories", slug: "expense-categories", route: "/app/expenses/categories" },
      { name: "Expense Report", slug: "expense-report", route: "/app/expenses/report" },
    ]
  },
  { 
    name: "Accounts", slug: "accounts", route: "/app/accounts", icon: "DollarSign",
    subItems: [
      { name: "Cash Book", slug: "cash-book", route: "/app/accounts/cash" },
      { name: "Bank Accounts", slug: "bank-accounts", route: "/app/accounts/bank" },
      { name: "Bank Transactions", slug: "bank-transactions", route: "/app/accounts/bank/transactions" },
      { name: "Mobile Banking", slug: "mobile-banking", route: "/app/accounts/mobile" },
      { name: "Fund Transfer", slug: "fund-transfer", route: "/app/accounts/transfer" },
      { name: "Account Ledger", slug: "account-ledger", route: "/app/accounts/ledger" },
      { name: "Account Report", slug: "account-report", route: "/app/accounts/report" },
    ]
  },
  { 
    name: "Reports", slug: "reports", route: "/app/reports", icon: "activity",
    subItems: [
      { name: "Dashboard Report", slug: "dashboard-report", route: "/app/reports/dashboard" },
      { name: "Sales Report", slug: "sales-report", route: "/app/reports/sales" },
      { name: "Purchase Report", slug: "purchases-report", route: "/app/reports/purchases" },
      { name: "Stock Report", slug: "stock-report", route: "/app/reports/stock" },
      { name: "Customer Report", slug: "customer-report", route: "/app/reports/customer" },
      { name: "Supplier Report", slug: "supplier-report", route: "/app/reports/supplier" },
      { name: "Collection Report", slug: "collection-report", route: "/app/reports/collection" },
      { name: "Payment Report", slug: "payment-report", route: "/app/reports/payment" },
      { name: "Expense Report", slug: "expense-report", route: "/app/reports/expense" },
      { name: "Profit & Loss", slug: "pnl-report", route: "/app/reports/pnl" },
    ]
  },
  { 
    name: "Notifications", slug: "notifications", route: "/app/notifications", icon: "bell",
    subItems: [
      { name: "Notification Center", slug: "notification-center", route: "/app/notifications/center" },
      { name: "Due Reminders", slug: "due-reminders", route: "/app/notifications/dues" },
      { name: "Low Stock Alerts", slug: "low-stock", route: "/app/notifications/low-stock" },
      { name: "Expiry Alerts", slug: "expiry-alerts", route: "/app/notifications/expiry" },
      { name: "SMS Templates", slug: "sms-templates", route: "/app/notifications/sms" },
      { name: "Email Templates", slug: "email-templates", route: "/app/notifications/email" },
      { name: "WhatsApp Templates", slug: "whatsapp-templates", route: "/app/notifications/whatsapp" },
      { name: "Automation Rules", slug: "automation-rules", route: "/app/notifications/automation" },
    ]
  },
  { 
    name: "User Management", slug: "user-management", route: "/app/users", icon: "Users",
    subItems: [
      { name: "Add Employee", slug: "add-employee", route: "/app/users/new" },
      { name: "Manage Employees", slug: "manage-employees", route: "/app/users/manage" },
      { name: "Roles & Permissions", slug: "roles-permissions", route: "/app/users/roles" },
      { name: "Activity Logs", slug: "activity-logs", route: "/app/users/activity" },
      { name: "Login History", slug: "login-history", route: "/app/users/login-history" },
    ]
  },
  {
    name: "Data Management", slug: "data-management", route: "/app/data", icon: "Database",
    subItems: [
      { name: "Backup", slug: "backup", route: "/app/data/backup" },
      { name: "Restore", slug: "restore", route: "/app/data/restore" },
      { name: "Import Data", slug: "import-data", route: "/app/data/import" },
      { name: "Export Data", slug: "export-data", route: "/app/data/export" },
      { name: "Data Cleanup", slug: "data-cleanup", route: "/app/data/cleanup" },
      { name: "Database Maintenance", slug: "db-maintenance", route: "/app/data/maintenance" },
      { name: "System Logs", slug: "system-logs", route: "/app/data/logs" },
    ]
  },
  { 
    name: "Settings", slug: "settings", route: "/app/settings", icon: "settings",
    subItems: [
      { name: "Business Profile", slug: "business-profile", route: "/app/settings/profile" },
      { name: "Company Information", slug: "company-info", route: "/app/settings/company" },
      { name: "Invoice Settings", slug: "invoice-settings", route: "/app/settings/invoice" },
      { name: "Financial Settings", slug: "financial-settings", route: "/app/settings/financial" },
      { name: "Tax Settings", slug: "tax-settings", route: "/app/settings/tax" },
      { name: "Notification Settings", slug: "notification-settings", route: "/app/settings/notifications" },
      { name: "Backup & Restore", slug: "backup-restore", route: "/app/settings/backup" },
      { name: "Import & Export", slug: "import-export", route: "/app/settings/import-export" },
      { name: "System Preferences", slug: "system-preferences", route: "/app/settings/preferences" },
      { name: "Audit Settings", slug: "audit-settings", route: "/app/settings/audit" },
    ]
  },
];

async function seedTemplate(slug: string, navData: typeof eggShopNav) {
  const template = await db.select().from(templates).where(eq(templates.slug, slug)).get();
  if (!template) {
    console.log(`Template '${slug}' not found, skipping.`);
    return;
  }

  // Clear existing
  await db.delete(templateNavigations).where(eq(templateNavigations.templateId, template.id));

  let order = 0;
  for (const item of navData) {
    const parentId = randomUUID();
    order++;
    await db.insert(templateNavigations).values({
      id: parentId,
      templateId: template.id,
      name: item.name,
      slug: item.slug,
      route: item.route,
      icon: item.icon,
      sortOrder: order * 10,
    });

    if (item.subItems) {
      let subOrder = 0;
      for (const sub of item.subItems) {
        subOrder++;
        await db.insert(templateNavigations).values({
          id: randomUUID(),
          parentId,
          templateId: template.id,
          name: sub.name,
          slug: sub.slug,
          route: sub.route,
          sortOrder: subOrder * 10,
        });
      }
    }
  }
  console.log(`Seeded navigation for '${slug}' successfully`);
}

async function seed() {
  // Egg Shop and Egg Tasta share the same navigation structure (Egg Tasta is a full duplicate)
  await seedTemplate('egg-shop', eggShopNav);
  await seedTemplate('egg-tasta', eggShopNav);
}

seed().catch(console.error);
