import GenericReportPage from "@/templates/egg-tasta/components/reports/generic-report-page";

export default function StockReport() {
  return <GenericReportPage title="Stock Report" description="Analyze current stock, low stock, out of stock, and product movement." type="Stock" />;
}
