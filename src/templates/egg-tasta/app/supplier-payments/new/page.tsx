import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { db } from "@/shared/db/database";
import { userRoles } from "@/platform/db/schema";
import { suppliers, accounts } from "@/templates/egg-tasta/db/schema";

import { eq, and } from "drizzle-orm";
import { cookies } from "next/headers";
import NewPaymentClient from "@/templates/egg-tasta/components/supplier-payments/new-payment-client";

import { getTenantId as getSharedTenantId } from "@/shared/utils/auth";

async function getTenantId() {
  try {
    const { tenantId } = await getSharedTenantId();
    return tenantId;
  } catch {
    return null;
  }
}

export default async function SupplierPaymentPage() {
  const tenantId = await getTenantId();
  if (!tenantId) return <div>Unauthorized</div>;

  const supplierList = await db.select().from(suppliers).where(eq(suppliers.tenantId, tenantId)).all();
  const accountList = await db.select().from(accounts).where(and(eq(accounts.tenantId, tenantId), eq(accounts.status, 'ACTIVE'))).all();

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/supplier-payments/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Supplier Payments</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Supplier Payment</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Record Supplier Payment</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Record a payment made to a supplier.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
        <NewPaymentClient suppliers={supplierList} accounts={accountList} />
      </div>
    </div>
  );
}
