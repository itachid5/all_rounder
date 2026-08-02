"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, X, ChevronDown, LayoutDashboard, Layers, Users, Shield, Activity, Settings, MoveRight, DollarSign, Bell, HandCoins, WalletCards, Database } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  subItems?: NavItem[];
};

export function BusinessSidebar({ 
  navigation, 
  open, 
  setOpen,
  branding
}: { 
  navigation: NavItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
  branding?: any;
}) {
  const pathname = usePathname();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const activeParent = navigation.find(item => 
      pathname === item.href || 
      (item.subItems && item.subItems.some(sub => pathname === sub.href || pathname.startsWith(sub.href))) ||
      (item.href !== '/app/dashboard' && pathname.startsWith(item.href))
    );
    if (activeParent) {
      setExpandedId(activeParent.label);
    }
  }, [pathname, navigation]);

  const toggleExpand = (label: string) => {
    setExpandedId(prev => prev === label ? null : label);
  };

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case "dashboard": return <LayoutDashboard className="h-5 w-5" />;
      case "layers": return <Layers className="h-5 w-5" />;
      case "users": 
      case "Users": return <Users className="h-5 w-5" />;
      case "shield": return <Shield className="h-5 w-5" />;
      case "activity": return <Activity className="h-5 w-5" />;
      case "settings": return <Settings className="h-5 w-5" />;
      case "DollarSign": return <DollarSign className="h-5 w-5" />;
      case "bell": return <Bell className="h-5 w-5" />;
      case "HandCoins": return <HandCoins className="h-5 w-5" />;
      case "WalletCards": return <WalletCards className="h-5 w-5" />;
      case "Database": return <Database className="h-5 w-5" />;
      default: return <div className="h-5 w-5" />; // placeholder
    }
  };

  const renderNavItems = (items: NavItem[], depth = 0) => {
    return items.map((item) => {
      const hasChildren = item.subItems && item.subItems.length > 0;
      const isExactActive = pathname === item.href;
      const isChildActive = hasChildren && item.subItems!.some(sub => pathname === sub.href || pathname.startsWith(sub.href));
      const isActive = isExactActive || isChildActive || (item.href !== '/app/dashboard' && pathname.startsWith(item.href));
      const isExpanded = expandedId === item.label;

      if (hasChildren) {
        return (
          <div key={item.label} className="space-y-1">
            <button
              onClick={() => toggleExpand(item.label)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                {depth === 0 && renderIcon(item.icon)}
                <span>{item.label}</span>
              </div>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} 
              />
            </button>
            
            <div 
              className={`grid transition-all duration-200 ease-in-out ${
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className={`pl-${depth === 0 ? '9' : '4'} pr-3 py-1 space-y-1`}>
                  {item.subItems!.map(subItem => {
                    const isSubActive = pathname === subItem.href || pathname.startsWith(subItem.href);
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                          isSubActive
                            ? "bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-white"
                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800/50"
                        }`}
                      >
                        <MoveRight className="h-3 w-3 opacity-70" />
                        <span>{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      }

      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
            isActive
              ? depth === 0 
                ? "bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400" 
                : "bg-slate-100 text-slate-900 font-medium dark:bg-slate-800 dark:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`}
        >
          {depth === 0 ? renderIcon(item.icon) : <MoveRight className="h-3 w-3 opacity-70" />}
          <span>{item.label}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link href="/app/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 font-bold text-lg overflow-hidden">
            {branding?.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.tenantName || "Logo"} className="h-8 max-w-[130px] object-contain shrink-0" />
            ) : branding?.iconUrl ? (
              <img src={branding.iconUrl} alt={branding.tenantName || "Icon"} className="h-7 w-7 rounded-lg object-cover shrink-0" />
            ) : (
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400 shrink-0" />
            )}
            <span className="truncate">{branding?.tenantName || "Egg Shop"}</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {renderNavItems(navigation)}
        </nav>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <Link href="/app/profile" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left ${pathname === '/app/profile' ? 'bg-blue-50 text-blue-700 font-medium dark:bg-blue-900/30 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'}`}>
            <Users className="h-5 w-5" />
            Profile
          </Link>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-left text-slate-600 hover:bg-slate-100 hover:text-red-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-red-400">
              <X className="h-5 w-5" />
              Logout
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
