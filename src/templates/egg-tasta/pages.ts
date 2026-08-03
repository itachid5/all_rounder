import DashboardPage from "./app/dashboard/page";
import ProductsPage from "./app/products/page";
import ProductListPage from "./app/products/list/page";
import NewProductPage from "./app/products/new/page";
import ManageProductsPage from "./app/products/manage/page";

import CustomersManagePage from "./app/customers/manage/page";
import CustomersDuePage from "./app/customers/due/page";
import NewCustomerPage from "./app/customers/new/page";
import CustomerLedgerPage from "./app/customers/ledger/page";

import CustomerCollectionManagePage from "./app/customer-collection/manage/page";
import NewCustomerCollectionPage from "./app/customer-collection/new/page";
import CustomerCollectionReportPage from "./app/customer-collection/report/page";
import CollectionLedgerPage from "./app/customer-collection/ledger/page";
import CustomerCollectionEditPage from "./app/customer-collection/edit/[id]/page";
import CustomerCollectionViewPage from "./app/customer-collection/view/[id]/page";

import SuppliersManagePage from "./app/suppliers/manage/page";
import NewSupplierPage from "./app/suppliers/new/page";
import SupplierDuePage from "./app/suppliers/due/page";
import SupplierLedgerPage from "./app/suppliers/ledger/page";

import SupplierPaymentsManagePage from "./app/supplier-payments/manage/page";
import NewSupplierPaymentPage from "./app/supplier-payments/new/page";
import SupplierPaymentReportPage from "./app/supplier-payments/report/page";
import SupplierPaymentLedgerPage from "./app/supplier-payments/ledger/page";

import SalesManagePage from "./app/sales/manage/page";
import NewSalePage from "./app/sales/new/page";
import SalesReportPage from "./app/sales/report/page";
import SalesReturnsPage from "./app/sales/returns/page";
import SalesPaymentsPage from "./app/sales/payments/page";

import SalesReturnManagePage from "./app/sales-return/manage/page";
import NewSalesReturnPage from "./app/sales-return/new/page";
import SalesReturnReportPage from "./app/sales-return/report/page";

import PurchasesManagePage from "./app/purchases/manage/page";
import NewPurchasePage from "./app/purchases/new/page";
import PurchasesReportPage from "./app/purchases/report/page";
import PurchasesReturnsPage from "./app/purchases/returns/page";
import PurchaseLedgerPage from "./app/purchases/ledger/page";

import InventoryLowPage from "./app/inventory/low/page";
import InventoryAdjustmentPage from "./app/inventory/adjustment/page";
import InventoryMovementPage from "./app/inventory/movement/page";
import InventoryValuationPage from "./app/inventory/valuation/page";
import InventoryReportPage from "./app/inventory/report/page";

import ExpensesManagePage from "./app/expenses/manage/page";
import NewExpensePage from "./app/expenses/new/page";
import ExpenseCategoriesPage from "./app/expenses/categories/page";
import ExpenseReportPage from "./app/expenses/report/page";

import CashbookPage from "./app/cashbook/page";

import ReportsDashboardPage from "./app/reports/dashboard/page";
import ReportsCollectionPage from "./app/reports/collection/page";
import ReportsCustomerPage from "./app/reports/customer/page";
import ReportsExpensePage from "./app/reports/expense/page";
import ReportsPaymentPage from "./app/reports/payment/page";
import ReportsPnlPage from "./app/reports/pnl/page";
import ReportsPurchasesPage from "./app/reports/purchases/page";
import ReportsSalesPage from "./app/reports/sales/page";
import ReportsStockPage from "./app/reports/stock/page";
import ReportsSupplierPage from "./app/reports/supplier/page";

import UsersPage from "./app/users/page";
import UsersManagePage from "./app/users/manage/page";
import NewUserPage from "./app/users/new/page";
import UserRolesPage from "./app/users/roles/page";
import UserActivityPage from "./app/users/activity/page";
import UserLoginHistoryPage from "./app/users/login-history/page";

import RolesPage from "./app/roles/page";
import PermissionsPage from "./app/permissions/page";
import ActivityPage from "./app/activity/page";
import ModulesPage from "./app/modules/page";

import DataBackupPage from "./app/data/backup/page";
import DataCleanupPage from "./app/data/cleanup/page";
import DataExportPage from "./app/data/export/page";
import DataImportPage from "./app/data/import/page";
import DataLogsPage from "./app/data/logs/page";
import DataMaintenancePage from "./app/data/maintenance/page";
import DataRestorePage from "./app/data/restore/page";

import SettingsPage from "./app/settings/page";
import BrandingSettingsPage from "./app/settings/branding/page";
import SettingsCompanyPage from "./app/settings/company/page";
import SettingsFinancialPage from "./app/settings/financial/page";
import SettingsInvoicePage from "./app/settings/invoice/page";
import SettingsPreferencesPage from "./app/settings/preferences/page";
import SettingsProfilePage from "./app/settings/profile/page";
import SettingsTaxPage from "./app/settings/tax/page";
import SettingsAuditPage from "./app/settings/audit/page";
import SettingsBackupPage from "./app/settings/backup/page";
import SettingsImportExportPage from "./app/settings/import-export/page";

import ProfilePage from "./app/profile/page";

export const eggTastaPageMap: Record<string, any> = {
  "": DashboardPage,
  "dashboard": DashboardPage,
  "products": ProductsPage,
  "products/list": ProductListPage,
  "products/new": NewProductPage,
  "products/manage": ManageProductsPage,
  "customers": CustomersManagePage,
  "customers/manage": CustomersManagePage,
  "customers/due": CustomersDuePage,
  "customers/new": NewCustomerPage,
  "customers/ledger": CustomerLedgerPage,
  "customer-collection": CustomerCollectionManagePage,
  "customer-collection/manage": CustomerCollectionManagePage,
  "customer-collection/new": NewCustomerCollectionPage,
  "customer-collection/report": CustomerCollectionReportPage,
  "customer-collection/ledger": CollectionLedgerPage,
  "customer-collection/edit/[id]": CustomerCollectionEditPage,
  "customer-collection/view/[id]": CustomerCollectionViewPage,
  "suppliers": SuppliersManagePage,
  "suppliers/manage": SuppliersManagePage,
  "suppliers/new": NewSupplierPage,
  "suppliers/due": SupplierDuePage,
  "suppliers/ledger": SupplierLedgerPage,
  "supplier-payments": SupplierPaymentsManagePage,
  "supplier-payments/manage": SupplierPaymentsManagePage,
  "supplier-payments/new": NewSupplierPaymentPage,
  "supplier-payments/report": SupplierPaymentReportPage,
  "supplier-payments/ledger": SupplierPaymentLedgerPage,
  "sales": SalesManagePage,
  "sales/manage": SalesManagePage,
  "sales/new": NewSalePage,
  "sales/report": SalesReportPage,
  "sales/returns": SalesReturnsPage,
  "sales/payments": SalesPaymentsPage,
  "sales-return": SalesReturnManagePage,
  "sales-return/manage": SalesReturnManagePage,
  "sales-return/new": NewSalesReturnPage,
  "sales-return/report": SalesReturnReportPage,
  "purchases": PurchasesManagePage,
  "purchases/manage": PurchasesManagePage,
  "purchases/new": NewPurchasePage,
  "purchases/report": PurchasesReportPage,
  "purchases/returns": PurchasesReturnsPage,
  "purchases/ledger": PurchaseLedgerPage,
  "inventory": InventoryLowPage,
  "inventory/low": InventoryLowPage,
  "inventory/adjustment": InventoryAdjustmentPage,
  "inventory/movement": InventoryMovementPage,
  "inventory/valuation": InventoryValuationPage,
  "inventory/report": InventoryReportPage,
  "expenses": ExpensesManagePage,
  "expenses/manage": ExpensesManagePage,
  "expenses/new": NewExpensePage,
  "expenses/categories": ExpenseCategoriesPage,
  "expenses/report": ExpenseReportPage,
  "cashbook": CashbookPage,
  "reports": ReportsDashboardPage,
  "reports/dashboard": ReportsDashboardPage,
  "reports/collection": ReportsCollectionPage,
  "reports/customer": ReportsCustomerPage,
  "reports/expense": ReportsExpensePage,
  "reports/payment": ReportsPaymentPage,
  "reports/pnl": ReportsPnlPage,
  "reports/purchases": ReportsPurchasesPage,
  "reports/sales": ReportsSalesPage,
  "reports/stock": ReportsStockPage,
  "reports/supplier": ReportsSupplierPage,
  "users": UsersPage,
  "users/manage": UsersManagePage,
  "users/new": NewUserPage,
  "users/roles": UserRolesPage,
  "users/activity": UserActivityPage,
  "users/login-history": UserLoginHistoryPage,
  "roles": RolesPage,
  "permissions": PermissionsPage,
  "activity": ActivityPage,
  "modules": ModulesPage,
  "data": DataLogsPage,
  "data/backup": DataBackupPage,
  "data/cleanup": DataCleanupPage,
  "data/export": DataExportPage,
  "data/import": DataImportPage,
  "data/logs": DataLogsPage,
  "data/maintenance": DataMaintenancePage,
  "data/restore": DataRestorePage,
  "settings": SettingsPage,
  "settings/branding": BrandingSettingsPage,
  "settings/company": SettingsCompanyPage,
  "settings/financial": SettingsFinancialPage,
  "settings/invoice": SettingsInvoicePage,
  "settings/preferences": SettingsPreferencesPage,
  "settings/profile": SettingsProfilePage,
  "settings/tax": SettingsTaxPage,
  "settings/audit": SettingsAuditPage,
  "settings/backup": SettingsBackupPage,
  "settings/import-export": SettingsImportExportPage,
  "profile": ProfilePage,
};
