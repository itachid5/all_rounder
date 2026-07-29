import { redirect } from "next/navigation";

export default function SalesPaymentsRedirectPage() {
  redirect("/app/customer-collection/report");
}
