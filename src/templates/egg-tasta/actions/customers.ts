"use server";

import { requirePermissionAction } from "@/shared/actions/rbac";
import { db } from "@/shared/db/database";
import { CustomerRepository } from "@/templates/egg-tasta/db/repositories/CustomerRepository";
import { userRoles } from "@/platform/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { cookies } from "next/headers";
import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantInfo() {
  return await getSharedTenantId();
}

export async function getBusinessPrintHeaderAction() {
  try {
    const { tenantId, userId } = await getTenantInfo();
    const { tenants, users } = await import("@/platform/db/schema");
    const tenant = await db.select().from(tenants).where(eq(tenants.id, tenantId)).get();
    const user = userId ? await db.select().from(users).where(eq(users.id, userId)).get() : null;

    let settings: any = {};
    if (tenant?.settings) {
      try {
        settings = JSON.parse(tenant.settings);
      } catch {}
    }

    const printedBy = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : "Business Admin";
    const now = new Date();
    const generatedAt = `${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}, ${now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;

    return {
      success: true,
      data: {
        businessName: tenant?.name || settings.businessName || "Egg Tasta ERP",
        logoUrl: tenant?.logoUrl || settings.logoUrl || null,
        address: settings.address || "Main Outlet Road, Dhaka, Bangladesh",
        phone: settings.phone || "+880 1700-000000",
        printedBy,
        generatedAt,
      }
    };
  } catch (error: any) {
    return {
      success: false,
      data: {
        businessName: "Egg Tasta ERP",
        logoUrl: null,
        address: "Main Outlet Road, Dhaka, Bangladesh",
        phone: "+880 1700-000000",
        printedBy: "Business Admin",
        generatedAt: new Date().toLocaleString(),
      }
    };
  }
}

export async function getCustomerDueListAction(options: { search?: string; filter?: string } = {}) {
  await requirePermissionAction('view:customers');
  try {
    const { tenantId } = await getTenantInfo();
    const { customers, sales, customerCollections } = await import("@/templates/egg-tasta/db/schema");

    const allCustomers = await db.select().from(customers).where(eq(customers.tenantId, tenantId)).all();

    const salesTotals = await db
      .select({
        customerId: sales.customerId,
        totalSales: sql`SUM(${sales.grandTotal})`.mapWith(Number),
        totalPaidOnSales: sql`SUM(${sales.paidAmount})`.mapWith(Number),
        lastSaleDate: sql`MAX(${sales.date})`,
      })
      .from(sales)
      .where(eq(sales.tenantId, tenantId))
      .groupBy(sales.customerId)
      .all();

    const salesMap = new Map();
    salesTotals.forEach((s) => {
      if (s.customerId) salesMap.set(s.customerId, s);
    });

    const collectionTotals = await db
      .select({
        customerId: customerCollections.customerId,
        totalCollections: sql`SUM(${customerCollections.amount})`.mapWith(Number),
        lastCollectionDate: sql`MAX(${customerCollections.date})`,
      })
      .from(customerCollections)
      .where(eq(customerCollections.tenantId, tenantId))
      .groupBy(customerCollections.customerId)
      .all();

    const colMap = new Map();
    collectionTotals.forEach((c) => {
      if (c.customerId) colMap.set(c.customerId, c);
    });

    let list = allCustomers.map((cust) => {
      const sInfo = salesMap.get(cust.id) || { totalSales: 0, totalPaidOnSales: 0, lastSaleDate: null };
      const cInfo = colMap.get(cust.id) || { totalCollections: 0, lastCollectionDate: null };

      const totalSales = Number(sInfo.totalSales) || 0;
      const totalCollection = (Number(sInfo.totalPaidOnSales) || 0) + (Number(cInfo.totalCollections) || 0);
      const openingDue = Number(cust.previousDue) || 0;
      const currentDue = openingDue + totalSales - totalCollection;

      let lastDate: string | null = null;
      if (sInfo.lastSaleDate && cInfo.lastCollectionDate) {
        lastDate = new Date(sInfo.lastSaleDate) > new Date(cInfo.lastCollectionDate) ? sInfo.lastSaleDate : cInfo.lastCollectionDate;
      } else {
        lastDate = sInfo.lastSaleDate || cInfo.lastCollectionDate || (cust.createdAt ? new Date(cust.createdAt).toISOString() : null);
      }

      return {
        id: cust.id,
        customerCode: cust.customerCode,
        name: cust.name,
        phone: cust.mobile || cust.alternativeMobile || "-",
        address: cust.address || "-",
        totalSales,
        totalCollection,
        currentDue,
        lastTransactionDate: lastDate,
        status: cust.status,
      };
    });

    if (options.search) {
      const q = options.search.toLowerCase();
      list = list.filter(
        (c) => c.name.toLowerCase().includes(q) || c.customerCode.toLowerCase().includes(q) || c.phone.includes(q)
      );
    }

    if (options.filter === "OVERDUE" || options.filter === "DUE_ONLY") {
      list = list.filter((c) => c.currentDue > 0);
    } else if (options.filter === "ZERO") {
      list = list.filter((c) => c.currentDue <= 0);
    }

    const totalCustomers = list.length;
    const totalSalesSum = list.reduce((acc, curr) => acc + curr.totalSales, 0);
    const totalCollectionSum = list.reduce((acc, curr) => acc + curr.totalCollection, 0);
    const totalOutstandingDueSum = list.reduce((acc, curr) => acc + (curr.currentDue > 0 ? curr.currentDue : 0), 0);

    return {
      success: true,
      data: list,
      summary: {
        totalCustomers,
        totalSales: totalSalesSum,
        totalCollection: totalCollectionSum,
        totalOutstandingDue: totalOutstandingDueSum,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to fetch customer dues",
      data: [],
      summary: { totalCustomers: 0, totalSales: 0, totalCollection: 0, totalOutstandingDue: 0 },
    };
  }
}

export async function createCustomerAction(formData: FormData) {
  await requirePermissionAction('create:customers');
  try {
    const { tenantId } = await getTenantInfo();
    const data = {
      name: formData.get("name")?.toString() || "",
      mobile: formData.get("mobile")?.toString() || "",
      alternativeMobile: formData.get("alternativeMobile")?.toString() || "",
      whatsappNumber: formData.get("whatsappNumber")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      previousDue: parseFloat(formData.get("previousDue")?.toString() || "0"),
      notes: formData.get("notes")?.toString() || "",
      status: formData.get("status")?.toString() || "ACTIVE",
    };

    if (!data.name) {
      return { success: false, error: "Customer Name is required." };
    }

    const customer = await CustomerRepository.createCustomer(tenantId, data);
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function listCustomersAction(options: any = {}) {
  await requirePermissionAction('view:customers');
  try {
    const { tenantId } = await getTenantInfo();
    const result = await CustomerRepository.listCustomers(tenantId, options);
    return { success: true, data: result.data, total: result.total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to list customers", data: [], total: 0 };
  }
}

export async function updateCustomerStatusAction(customerCodes: string[], status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED') {
  await requirePermissionAction('edit:customers');
  try {
    const { tenantId, userId } = await getTenantInfo();
    await CustomerRepository.updateCustomerStatus(tenantId, customerCodes, status, userId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customers" };
  }
}

export async function updateCustomerAction(formData: FormData) {
  await requirePermissionAction('edit:customers');
  try {
    const { tenantId, userId } = await getTenantInfo();
    const customerCode = formData.get("customerCode")?.toString();
    if (!customerCode) return { success: false, error: "Customer Code is required." };

    const data = {
      name: formData.get("name")?.toString() || "",
      mobile: formData.get("mobile")?.toString() || "",
      alternativeMobile: formData.get("alternativeMobile")?.toString() || "",
      whatsappNumber: formData.get("whatsappNumber")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      address: formData.get("address")?.toString() || "",
      previousDue: parseFloat(formData.get("previousDue")?.toString() || "0"),
      notes: formData.get("notes")?.toString() || "",
      status: formData.get("status")?.toString() || "ACTIVE",
    };

    if (!data.name) {
      return { success: false, error: "Customer Name is required." };
    }

    const customer = await CustomerRepository.updateCustomer(tenantId, customerCode, data, userId);
    return { success: true, customer };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function adjustCustomerBalanceAction(formData: FormData) {
  await requirePermissionAction('edit:customers');
  try {
    const { tenantId, userId } = await getTenantInfo();
    const customerCode = formData.get("customerCode")?.toString();
    if (!customerCode) return { success: false, error: "Customer Code is required." };
    
    const newBalanceStr = formData.get("newBalance")?.toString();
    if (!newBalanceStr || isNaN(parseFloat(newBalanceStr))) {
      return { success: false, error: "Valid New Balance is required." };
    }
    const newBalance = parseFloat(newBalanceStr);
    
    const reason = formData.get("reason")?.toString();
    if (!reason) return { success: false, error: "Reason is required." };
    
    const notes = formData.get("notes")?.toString() || "";

    const result = await CustomerRepository.adjustCustomerBalance(tenantId, customerCode, newBalance, reason, notes, userId);
    return { success: true, result };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to adjust balance" };
  }
}

export async function getCustomerProfileAction(customerCode: string) {
  await requirePermissionAction('view:customers');
  try {
    const { tenantId } = await getTenantInfo();
    const data = await CustomerRepository.getCustomerProfileData(tenantId, customerCode);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load profile" };
  }
}

export async function getCustomerLedgerAction(customerCode: string, from?: string, to?: string) {
  await requirePermissionAction('view:customers');
  try {
    const { tenantId } = await getTenantInfo();
    const { LedgerService } = await import("@/templates/egg-tasta/services/LedgerService");
    const { customers } = await import("@/templates/egg-tasta/db/schema");
    const cust = await db.select().from(customers).where(and(eq(customers.tenantId, tenantId), eq(customers.customerCode, customerCode))).get();

    if (!cust) return { success: false, error: "Customer not found" };

    const ledgerRes = await LedgerService.listLedgerEntries(tenantId, {
      customerId: cust.id,
      startDate: from,
      endDate: to,
      limit: 1000,
    });

    return {
      success: true,
      customer: cust,
      data: ledgerRes.data || [],
      summary: ledgerRes.summary || { openingBalance: 0, totalDebit: 0, totalCredit: 0, currentBalance: 0 }
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load customer ledger" };
  }
}
