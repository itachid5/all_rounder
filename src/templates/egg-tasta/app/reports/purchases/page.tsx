import GenericReportPage from "@/templates/egg-tasta/components/reports/generic-report-page";

export default function PurchasesReport() {
  return <GenericReportPage title="Purchase Report" description="Analyze your daily, monthly, and supplier-wise purchase data." type="Purchase" />;
}
