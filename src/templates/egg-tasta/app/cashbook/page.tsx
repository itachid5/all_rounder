import React from "react";
import { CashbookClientComponent } from "@/templates/egg-tasta/components/cashbook/CashbookClientComponent";
import { getCashbookDataAction, getCashbookHeaderAction } from "@/templates/egg-tasta/actions/cashbook";

export default async function CashbookPage() {
  const [cashbookRes, headerRes] = await Promise.all([
    getCashbookDataAction({ preset: "TODAY" }),
    getCashbookHeaderAction(),
  ]);

  const initialData = cashbookRes.data || {
    preset: "TODAY",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    formattedDateRange: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    summary: {
      openingCash: 0,
      cashSales: 0,
      creditSales: 0,
      totalSales: 0,
      customerCollection: 0,
      totalPurchases: 0,
      cashPurchases: 0,
      duePurchases: 0,
      totalExpenses: 0,
      otherCashIn: 0,
      otherCashOut: 0,
      closingCash: 0,
    },
    sales: [],
    collections: [],
    purchases: [],
    expenses: [],
  };

  const headerData = headerRes.data;

  return (
    <CashbookClientComponent
      initialData={initialData}
      headerData={headerData}
    />
  );
}
