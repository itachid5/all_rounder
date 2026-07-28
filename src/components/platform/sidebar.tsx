"use client";

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
