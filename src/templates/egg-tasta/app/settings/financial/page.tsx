import { getRegionalSettingsAction } from "@/shared/actions/regional";
import { RegionalSettingsClient } from "@/templates/egg-tasta/components/settings/regional-settings-client";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function FinancialSettingsPage() {
  const res = await getRegionalSettingsAction();
  const settings = res.data;

  return (
    <div className="space-y-6">
      {/* Header and Breadcrumbs */}
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <Link href="/app/settings" className="hover:text-blue-600 dark:hover:text-blue-400">Settings</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Regional & Financial Settings</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Regional & Financial Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure base currency, symbols, timezones, and language.</p>
      </div>

      <RegionalSettingsClient initialSettings={settings} />
    </div>
  );
}
