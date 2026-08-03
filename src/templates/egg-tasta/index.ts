import { TemplateContract } from "@/platform/template-engine/types";
import { BusinessLayout } from "./components";

const contract: TemplateContract = {
  metadata: {
    id: "egg-tasta",
    name: "Egg Tasta",
    version: "1.0.0",
    description: "Production grade ERP template for Egg Wholesale Business.",
    status: "active",
  },
  navigation: [], // Will be hydrated by platform from db or overridden here
  routes: [
    "supplier-payments/manage", "supplier-payments/new", "supplier-payments/report",
    "settings/invoice", "settings/profile", "settings/backup", "settings/company", "settings/branding", "settings/tax", "settings/financial", "settings/preferences", "settings/audit", "settings", "settings/import-export",
    "profile", "purchases/manage", "purchases/returns", "purchases/new", "purchases/report",
    "cashbook", "expenses/manage", "expenses/new", "expenses/categories", "expenses/report",
    "users/manage", "users/activity", "users", "users/new", "users/roles", "users/login-history",
    "permissions", "activity", "suppliers/manage", "suppliers/due", "suppliers/new", "suppliers/ledger",
    "sales-return/manage", "sales-return/new", "sales-return/report",
    "inventory/low", "inventory/adjustment", "inventory/movement", "inventory/valuation", "inventory/report",
    "dashboard", "data/backup", "data/export", "data/logs", "data/maintenance", "data/restore", "data/import", "data/cleanup",
    "products/manage", "products", "products/new", "products/list", "modules", "roles",
    "customers/manage", "customers/due", "customers/new", "customers/ledger",
    "sales/payments", "sales/manage", "sales/returns", "sales/new", "sales/report",
    "reports/stock", "reports/supplier", "reports/purchases", "reports/payment", "reports/pnl", "reports/expense", "reports/dashboard", "reports/customer", "reports/collection", "reports/sales",
    "customer-collection/manage", "customer-collection/new", "customer-collection/report", "customer-collection/ledger", "customer-collection/view/[id]", "customer-collection/edit/[id]",
    "" // root
  ],
  permissions: ["view_dashboard", "manage_customers", "manage_suppliers", "manage_inventory"],
  modules: ["Customers", "Suppliers", "Inventory", "Sales", "Purchases"],
  theme: { primaryColor: "blue", style: "modern" },
  Layout: BusinessLayout,
};

export default contract;
