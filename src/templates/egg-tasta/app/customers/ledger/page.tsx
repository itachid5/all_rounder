import React from "react";
import { LedgerClientComponent } from "@/templates/egg-tasta/components/ledger/LedgerClientComponent";
import { LedgerService } from "@/templates/egg-tasta/services/LedgerService";
import { CustomerRepository } from "@/templates/egg-tasta/db/repositories/CustomerRepository";
import { SupplierRepository } from "@/templates/egg-tasta/db/repositories/SupplierRepository";
import { getBusinessPrintHeaderAction } from "@/templates/egg-tasta/actions/customers";
import { getTenantId } from "@/shared/utils/auth";

export default async function CustomerLedgerPage() {
  let tenantId: string = "";
  try {
    const res = await getTenantId();
    tenantId = res.tenantId;
  } catch {}

  let initialData: any[] = [];
  let initialTotal = 0;
  let initialSummary = { openingBalance: 0, totalDebit: 0, totalCredit: 0, currentBalance: 0 };
  let customersList: any[] = [];
  let suppliersList: any[] = [];
  let headerData: any = undefined;

  if (tenantId) {
    const [ledgerRes, custRes, suppRes, headerRes] = await Promise.all([
      LedgerService.listLedgerEntries(tenantId, { limit: 50, page: 1 }),
      CustomerRepository.listCustomers(tenantId, { limit: 500 }),
      SupplierRepository.listSuppliers(tenantId, { limit: 500 }),
      getBusinessPrintHeaderAction(),
    ]);

    initialData = ledgerRes.data || [];
    initialTotal = ledgerRes.total || 0;
    initialSummary = ledgerRes.summary || initialSummary;
    customersList = (custRes.data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      customerCode: c.customerCode,
      mobile: c.mobile,
      address: c.address,
      previousDue: c.previousDue,
    }));
    suppliersList = (suppRes.data || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      supplierCode: s.supplierCode,
    }));
    headerData = headerRes.data;
  }

  return (
    <LedgerClientComponent
      initialData={initialData}
      initialTotal={initialTotal}
      initialSummary={initialSummary}
      customersList={customersList}
      suppliersList={suppliersList}
      headerData={headerData}
      title="Customer Ledger"
      description="Transaction history, collections, sales, and running balances for customers."
    />
  );
}
