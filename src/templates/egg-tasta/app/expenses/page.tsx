import { redirect } from "next/navigation";

export default function ExpensesBasePage() {
  redirect("/app/expenses/manage");
}
