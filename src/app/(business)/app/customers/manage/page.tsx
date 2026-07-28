import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTemplateSlug } from "@/app/actions/navigation";
import { ManageCustomersClient as EggShopCustomersClient } from "@/templates/egg-shop/components/customers/manage-customers-client";
import { ManageCustomersClient as EggTastaCustomersClient } from "@/templates/egg-tasta/components/customers/manage-customers-client";
import { listCustomersAction } from "@/app/actions/customers";

export default async function ManageCustomersPage() {
  const result = await listCustomersAction({ status: 'ACTIVE', page: 1, limit: 10 });
  const templateSlug = await getTemplateSlug();
  const Client = templateSlug === 'egg-tasta' ? EggTastaCustomersClient : EggShopCustomersClient;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/customers/manage" className="hover:text-blue-600 dark:hover:text-blue-400">Customers</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Manage Customers</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Manage Customers</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">View and manage your customer directory.</p>
      </div>

      <Client initialData={result.data || []} initialTotal={result.total || 0} />
    </div>
  );
}
