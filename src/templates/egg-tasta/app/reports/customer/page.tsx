import GenericReportPage from "@/templates/egg-tasta/components/reports/generic-report-page";

export default function CustomerReport() {
  return <GenericReportPage title="Customer Report" description="View customer list, due summary, ledger summary, and top customers." type="Customer" />;
}
