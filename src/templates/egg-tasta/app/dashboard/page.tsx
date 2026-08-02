import React from "react";
import { 
  DollarSign, Archive, CreditCard, ShoppingCart, TrendingUp, TrendingDown
} from "lucide-react";
import { PageHeader, ContentContainer, StatCard, DashboardFilterModal } from "@/templates/egg-tasta/components";
import { getDashboardSummaryAction } from "@/templates/egg-tasta/actions/dashboard";

export default async function BusinessDashboard({
  searchParams
}: {
  searchParams?: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const query = searchParams ? await searchParams : {};
  const result = await getDashboardSummaryAction(query);

  const summary = result.success && result.data ? result.data : {
    period: { sales: 0, salesCount: 0, purchase: 0, purchaseCount: 0, collection: 0, payment: 0, expense: 0 },
    allTime: { sales: 0, purchase: 0, collection: 0, expense: 0 },
    filter: { activeRange: "today" as const, displayFrom: "", displayTo: "", timezone: "Asia/Dhaka", language: "en" }
  };

  const { period, allTime, filter } = summary;
  const activeRange = filter.activeRange || "today";

  const getPeriodTitle = (metric: string) => {
    switch (activeRange) {
      case "today": return `Today's ${metric}`;
      case "yesterday": return `Yesterday's ${metric}`;
      case "7days": return `7-Day ${metric}`;
      case "30days": return `30-Day ${metric}`;
      case "this_month": return `This Month's ${metric}`;
      case "last_month": return `Last Month's ${metric}`;
      case "this_year": return `This Year's ${metric}`;
      case "all": return `Total ${metric}`;
      default: return `Period ${metric}`;
    }
  };

  const periodNetProfit = period.sales - period.purchase - period.expense;

  return (
    <ContentContainer>
      <PageHeader 
        title="Dashboard" 
        description="Real-time performance overview & analytics."
      />

      <DashboardFilterModal 
        activeRange={filter.activeRange}
        displayFrom={filter.displayFrom}
        displayTo={filter.displayTo}
        timezone={filter.timezone}
        language={filter.language}
      />

      {/* Row 1: Selected Period Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-6">
        <StatCard title={getPeriodTitle("Sales")} value={`$${period.sales.toFixed(2)}`} subtitle={`${period.salesCount} invoices`} icon={ShoppingCart} iconColorClass="text-blue-500" />
        <StatCard title={getPeriodTitle("Purchase")} value={`$${period.purchase.toFixed(2)}`} subtitle={`${period.purchaseCount} bills`} icon={Archive} iconColorClass="text-indigo-500" />
        <StatCard title={getPeriodTitle("Collection")} value={`$${period.collection.toFixed(2)}`} subtitle="Received" icon={TrendingUp} iconColorClass="text-emerald-500" />
        <StatCard title={getPeriodTitle("Payment")} value={`$${period.payment.toFixed(2)}`} subtitle="To suppliers" icon={TrendingDown} iconColorClass="text-orange-500" />
        <StatCard title={getPeriodTitle("Expense")} value={`$${period.expense.toFixed(2)}`} subtitle="Operating costs" icon={CreditCard} iconColorClass="text-rose-500" />
      </div>

      {/* Row 2: Period Net Profit & All-Time Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard title="Period Net Profit" value={`$${periodNetProfit.toFixed(2)}`} subtitle="Selected period profit" icon={DollarSign} iconColorClass={periodNetProfit >= 0 ? "text-emerald-600" : "text-rose-600"} />
        <StatCard title="Total Sales (All Time)" value={`$${allTime.sales.toFixed(2)}`} subtitle="Lifetime revenue" icon={DollarSign} />
        <StatCard title="Total Purchase (All Time)" value={`$${allTime.purchase.toFixed(2)}`} subtitle="Lifetime cost" icon={Archive} />
        <StatCard title="Total Collection (All Time)" value={`$${allTime.collection.toFixed(2)}`} subtitle="Lifetime received" icon={TrendingUp} />
        <StatCard title="Total Expense (All Time)" value={`$${allTime.expense.toFixed(2)}`} subtitle="Lifetime spent" icon={TrendingDown} />
      </div>
    </ContentContainer>
  );
}
