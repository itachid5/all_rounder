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
  routes: ["dashboard", "customers", "suppliers", "products", "inventory", "sales", "purchases", "reports", "settings"],
  permissions: ["view_dashboard", "manage_customers", "manage_suppliers", "manage_inventory"],
  modules: ["Customers", "Suppliers", "Inventory", "Sales", "Purchases"],
  theme: { primaryColor: "blue", style: "modern" },
  Layout: BusinessLayout,
};

export default contract;
