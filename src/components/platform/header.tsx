"use client";

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
