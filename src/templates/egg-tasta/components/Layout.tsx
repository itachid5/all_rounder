"use client";

import React, { useState } from "react";
import "../styles/theme.css";
import { ThemeToggle } from "@/components/platform/theme-toggle";
import { Menu, Package, Wallet, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { BusinessSidebar, NavItem } from "./sidebar";
import { PermissionProvider, PermissionGuard } from "@/shared/components/permission-context";
import { RegionalProvider } from "@/shared/components/regional-context";

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

export function Topbar({ setSidebarOpen, user, branding }: { setSidebarOpen: (v: boolean) => void, user: any, branding?: any }) {
  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 gap-2 sm:gap-4">
      {/* Left Side: Mobile Sidebar Toggle & App Title */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Open Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-sm font-bold tracking-tight hidden md:inline-block text-slate-900 dark:text-white font-mono uppercase">
          {branding?.tenantName || "Business"}
        </span>
      </div>
      
      {/* Quick Actions Bar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none max-w-full">
        <PermissionGuard permission="view:products">
          <Link
            href="/app/products"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 dark:bg-slate-800 dark:hover:bg-blue-950/60 dark:text-slate-300 dark:hover:text-blue-400 border border-slate-200/80 dark:border-slate-700 transition-all shrink-0 shadow-xs"
          >
            <Package className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="whitespace-nowrap">Product List</span>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission="view:customer_collections">
          <Link
            href="/app/customer-collection"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-950/60 dark:text-slate-300 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-slate-700 transition-all shrink-0 shadow-xs"
          >
            <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Customer Collection</span>
          </Link>
        </PermissionGuard>

        <PermissionGuard permission="create:sales">
          <Link
            href="/app/sales/new"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all shrink-0"
          >
            <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">Sales</span>
          </Link>
        </PermissionGuard>
      </div>

      {/* Right Side: Theme Toggle & User Info */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <ThemeToggle />
        <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-2.5 sm:pl-4">
          <div className="hidden text-right lg:block">
            <p className="text-xs font-semibold leading-none text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{user.username}</p>
          </div>
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm shadow-xs border border-blue-200/60 dark:border-blue-800">
            {user.firstName?.charAt(0) || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}

export function FaviconUpdater({ faviconUrl }: { faviconUrl?: string | null }) {
  React.useEffect(() => {
    if (!faviconUrl) return;
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "shortcut icon";
      document.getElementsByTagName("head")[0].appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  return null;
}

export function BusinessLayout({
  children,
  navigation,
  user,
  branding,
  regional,
  userPermissions = [],
  isOwner = false,
}: {
  children: React.ReactNode;
  navigation: NavItem[];
  user: any;
  branding?: any;
  regional?: any;
  userPermissions?: string[];
  isOwner?: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RegionalProvider settings={regional}>
      <PermissionProvider permissions={userPermissions} isOwner={isOwner}>
        <div className="egg-tasta-theme flex min-h-screen bg-slate-50 dark:bg-slate-950">
          <FaviconUpdater faviconUrl={branding?.faviconUrl} />
          <BusinessSidebar 
            navigation={navigation} 
            open={sidebarOpen} 
            setOpen={setSidebarOpen} 
            branding={branding}
          />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar setSidebarOpen={setSidebarOpen} user={user} branding={branding} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </PermissionProvider>
    </RegionalProvider>
  );
}
