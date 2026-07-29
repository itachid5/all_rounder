import React from "react";
import { ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { Button } from "@/templates/egg-tasta/components";

interface GenericSettingsPageProps {
  title: string;
  description: string;
  icon?: any;
  children: React.ReactNode;
}

export default function GenericSettingsPage({ title, description, icon: Icon = Settings, children }: GenericSettingsPageProps) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Settings</span>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">{title}</span>
        </nav>
        
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm">
        {children}
        
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" type="button">Discard Changes</Button>
          <Button variant="primary" type="button" disabled title="Settings logic pending.">Save Settings</Button>
        </div>
      </div>
    </div>
  );
}
