"use client";
import React, { useState } from "react";
import "../styles/theme.css";
import { ThemeToggle } from "@/components/platform/theme-toggle";
import { Menu } from "lucide-react";
import { BusinessSidebar, NavItem } from "./sidebar";

export function ContentContainer({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

export function PageHeader({ title, description, children }: { title: string, description?: string, children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
        {description && <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

export function Topbar({ setSidebarOpen, user }: { setSidebarOpen: (v: boolean) => void, user: any }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight hidden sm:block text-slate-900 dark:text-white">Dashboard</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.username}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold shadow-sm">
            {user.firstName?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

export function BusinessLayout({
  children,
  navigation,
  user
}: {
  children: React.ReactNode;
  navigation: NavItem[];
  user: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="egg-tasta-theme flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <BusinessSidebar 
        navigation={navigation} 
        open={sidebarOpen} 
        setOpen={setSidebarOpen} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar setSidebarOpen={setSidebarOpen} user={user} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
