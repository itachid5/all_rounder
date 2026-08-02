import React from "react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { RolesPermissionsClient } from "@/templates/egg-tasta/components/users/roles-permissions-client";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div>
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-2">
          <Link href="/app/dashboard" className="hover:text-blue-600 dark:hover:text-blue-400">Dashboard</Link>
          <ChevronRight className="h-4 w-4 mx-1" />
          <span className="text-slate-900 dark:text-slate-100 font-medium">Role Management</span>
        </nav>
        
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono uppercase">Roles & Permissions</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Configure granular module and action permissions for employees.</p>
      </div>

      <RolesPermissionsClient />
    </div>
  );
}
