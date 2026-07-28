import os

base_dir = "/workspaces/all_rounder/erp-platform"

files = {
    "src/app/layout.tsx": """import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "ERP Platform",
  description: "Multi-Tenant Enterprise Resource Planning Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
""",
    "src/components/providers/theme-provider.tsx": """"use client";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
""",
    "src/middleware.ts": """import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Placeholder for future auth validation
  // const token = request.cookies.get('auth-token');
  // if (!token) { return NextResponse.redirect(new URL('/login', request.url)); }
  return NextResponse.next();
}

export const config = {
  matcher: ['/platform/:path*', '/app/:path*'],
};
""",
    "src/app/(public)/layout.tsx": """export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
""",
    "src/app/(public)/page.tsx": """import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="max-w-3xl text-center space-y-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Enterprise Resource Planning
        </h1>
        <p className="text-xl text-muted-foreground">
          A powerful, multi-tenant ERP platform designed to streamline your business operations and accelerate growth.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link 
            href="/platform/login" 
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
          >
            Platform Admin
          </Link>
          <Link 
            href="/app/login" 
            className="w-full sm:w-auto px-8 py-3 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-colors"
          >
            Business Login
          </Link>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(auth)/layout.tsx": """export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">ERP Platform</h1>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(auth)/platform/login/page.tsx": """import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function PlatformLogin() {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Platform Administration</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to manage the platform</p>
      </div>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email address</label>
          <input 
            id="email" 
            type="email" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="admin@erp-platform.local" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
          <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
        </div>
        <button 
          type="button" 
          className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4"
        >
          Sign In
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
""",
    "src/app/(auth)/app/login/page.tsx": """import Link from 'next/link';
import { Building2 } from 'lucide-react';

export default function BusinessLogin() {
  return (
    <div className="p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground">Business Portal</h2>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your business workspace</p>
      </div>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">Email address</label>
          <input 
            id="email" 
            type="email" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="user@business.local" 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">Password</label>
          <input 
            id="password" 
            type="password" 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
            placeholder="••••••••" 
          />
        </div>
        <div className="flex items-center space-x-2">
          <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
          <label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</label>
        </div>
        <button 
          type="button" 
          className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2 mt-4"
        >
          Sign In
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
""",
    "src/components/platform/theme-toggle.tsx": """"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
      aria-label="Toggle theme"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </button>
  );
}
""",
    "src/components/platform/sidebar.tsx": """"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Building2, Users, Shield, 
  Key, Layers, Settings, ScrollText, 
  UserCircle, LogOut, X
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/platform/dashboard" },
  { icon: Building2, label: "Businesses", href: "/platform/businesses" },
  { icon: Users, label: "Users", href: "/platform/users" },
  { icon: Shield, label: "Roles", href: "/platform/roles" },
  { icon: Key, label: "Permissions", href: "/platform/permissions" },
  { icon: Layers, label: "Templates", href: "/platform/templates" },
  { icon: Settings, label: "Settings", href: "/platform/settings" },
  { icon: ScrollText, label: "Audit Logs", href: "/platform/logs" },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex flex-col transition-transform duration-200 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-sidebar-border">
          <Link href="/platform/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Shield className="h-6 w-6 text-primary" />
            <span>ERP Platform</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-sidebar-foreground/70 hover:text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <Link
            href="/platform/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname === "/platform/profile"
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            }`}
          >
            <UserCircle className="h-5 w-5" />
            Profile
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-destructive transition-colors text-left">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
""",
    "src/components/platform/header.tsx": """"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { usePathname } from "next/navigation";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export function Header({ setSidebarOpen }: HeaderProps) {
  const pathname = usePathname();
  
  // Basic breadcrumb generation
  const segments = pathname.split('/').filter(Boolean);
  const currentSegment = segments[segments.length - 1] || 'Dashboard';
  const title = currentSegment.charAt(0).toUpperCase() + currentSegment.slice(1);

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-muted-foreground hover:text-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight hidden sm:block">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-none">Super Admin</p>
            <p className="text-xs text-muted-foreground mt-1">admin@erp-platform.local</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            SA
          </div>
        </div>
      </div>
    </header>
  );
}
""",
    "src/app/(platform)/layout.tsx": """"use client";

import { useState } from "react";
import { Sidebar } from "@/components/platform/sidebar";
import { Header } from "@/components/platform/header";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/dashboard/page.tsx": """import { Building2, Users, Layers, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Total Businesses</p>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">0</h2>
            <p className="text-xs text-muted-foreground">+0 this month</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active Users</p>
            <Users className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">0</h2>
            <p className="text-xs text-muted-foreground">+0 this month</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">Active Templates</p>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-3xl font-bold tracking-tight">0</h2>
            <p className="text-xs text-muted-foreground">0 installed</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col space-y-2 hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">System Health</p>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-baseline space-x-2">
            <h2 className="text-2xl font-bold tracking-tight">Healthy</h2>
            <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:text-green-300">
              Online
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2 border-b">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Latest actions across the platform</p>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground">Activity will appear here once users interact with the system.</p>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-2 border-b">
            <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
            <p className="text-sm text-muted-foreground mt-1.5">Common administrative tasks</p>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Create Business</span>
              </div>
              <span className="text-muted-foreground">&rarr;</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Add Platform User</span>
              </div>
              <span className="text-muted-foreground">&rarr;</span>
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors text-left">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">View System Logs</span>
              </div>
              <span className="text-muted-foreground">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/businesses/page.tsx": """import { Building2, Search, Plus } from "lucide-react";

export default function BusinessesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Businesses</h1>
          <p className="text-muted-foreground">Manage all businesses on the platform</p>
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Business
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            placeholder="Search businesses..." 
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
          />
        </div>
        <select className="flex h-10 w-full sm:w-[180px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="rounded-md border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Owner</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Template</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr>
                <td colSpan={6} className="h-32 text-center align-middle">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Building2 className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium text-foreground">No businesses yet</p>
                    <p className="text-sm">Create your first business to get started</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/users/page.tsx": """import { Users, Search, Plus } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Users</h1>
          <p className="text-muted-foreground">Manage platform administrators</p>
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            placeholder="Search users..." 
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
          />
        </div>
        <select className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="all">All Roles</option>
          <option value="superadmin">Super Admin</option>
          <option value="admin">Admin</option>
        </select>
        <select className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="rounded-md border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Email</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Last Login</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr>
                <td colSpan={6} className="h-32 text-center align-middle">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <Users className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium text-foreground">No users found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/roles/page.tsx": """import { Shield, Plus } from "lucide-react";

export default function RolesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-muted-foreground">Manage platform roles and permissions</p>
        </div>
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Empty state for roles */}
        <div className="col-span-full py-12 rounded-xl border border-dashed border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center">
          <Shield className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
          <p className="text-lg font-medium">No custom roles configured</p>
          <p className="text-sm text-muted-foreground">System roles are managed automatically.</p>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/permissions/page.tsx": """import { Key } from "lucide-react";

export default function PermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
        <p className="text-muted-foreground">View and manage platform permissions</p>
      </div>

      <div className="py-12 rounded-xl border border-dashed border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center">
        <Key className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
        <p className="text-lg font-medium">Permissions list empty</p>
        <p className="text-sm text-muted-foreground">Platform permissions are read-only for now.</p>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/templates/page.tsx": """import { Layers } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground">Installed business templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="col-span-full py-12 rounded-xl border border-dashed border-border bg-card text-card-foreground shadow-sm flex flex-col items-center justify-center">
          <Layers className="h-10 w-10 text-muted-foreground opacity-20 mb-3" />
          <p className="text-lg font-medium">No templates installed</p>
          <p className="text-sm text-muted-foreground">Install templates to provide modules to businesses.</p>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/settings/page.tsx": """import { Settings, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Configure global platform behavior</p>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <button className="px-6 py-3 font-medium text-sm text-primary border-b-2 border-primary bg-muted/30">General</button>
          <button className="px-6 py-3 font-medium text-sm text-muted-foreground hover:text-foreground">Security</button>
          <button className="px-6 py-3 font-medium text-sm text-muted-foreground hover:text-foreground">Database</button>
          <button className="px-6 py-3 font-medium text-sm text-muted-foreground hover:text-foreground">Maintenance</button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">General Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Platform Name</label>
                <input 
                  type="text" 
                  value="ERP Platform" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Primary URL</label>
                <input 
                  type="text" 
                  value="https://erp.local" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  value="Multi-Tenant Enterprise Resource Planning Platform"
                  disabled
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/logs/page.tsx": """import { ScrollText, Search } from "lucide-react";

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">System activity and security events</p>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 border-b pb-4">
        <div className="relative w-full lg:max-w-md flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input 
            type="search" 
            placeholder="Search logs..." 
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
          />
        </div>
        <div className="flex w-full lg:w-auto gap-4">
          <select className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <select className="flex h-10 w-full sm:w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="user">User Management</option>
            <option value="business">Business</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Timestamp</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">User</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Action</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Category</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Severity</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              <tr>
                <td colSpan={6} className="h-32 text-center align-middle">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <ScrollText className="h-8 w-8 mb-2 opacity-20" />
                    <p className="font-medium text-foreground">No logs found</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(platform)/platform/profile/page.tsx": """import { UserCircle, Mail, Key } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 bg-muted/30 border-b flex items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              SA
            </div>
            <div>
              <h2 className="text-2xl font-bold">Super Admin</h2>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4" /> admin@erp-platform.local
              </p>
              <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary">
                System Administrator
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Personal Information</h3>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  value="Super Admin" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  value="admin@erp-platform.local" 
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-70"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Security</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.
              </p>
              <button disabled className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 opacity-50 cursor-not-allowed">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
""",
    "src/app/(business)/layout.tsx": """"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, LayoutDashboard, Menu, X, LogOut, UserCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/platform/theme-toggle";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-50 border-r border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <Link href="/app/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <Building2 className="h-6 w-6 text-blue-400" />
            <span>Business Portal</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <Link
            href="/app/dashboard"
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              pathname.startsWith("/app/dashboard")
                ? "bg-blue-600/20 text-blue-400 font-medium" 
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </Link>
        </nav>

        <div className="p-3 border-t border-slate-800 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left">
            <UserCircle className="h-5 w-5" />
            Profile
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors text-left">
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 border-l border-border pl-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-none">Business User</p>
                <p className="text-xs text-muted-foreground mt-1">user@business.local</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                BU
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
""",
    "src/app/(business)/app/dashboard/page.tsx": """import { Building2 } from "lucide-react";

export default function BusinessDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Business Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your business workspace</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 px-4 text-center border rounded-xl bg-card text-card-foreground shadow-sm">
        <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-full mb-4">
          <Building2 className="h-12 w-12 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          Your business workspace is being configured. Modules, reports, and team management features will appear here.
        </p>
      </div>
    </div>
  );
}
"""
}

for rel_path, content in files.items():
    abs_path = os.path.join(base_dir, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    with open(abs_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Files created successfully.")
