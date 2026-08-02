"use client";

import React, { createContext, useContext, ReactNode } from "react";

interface PermissionContextType {
  permissions: string[];
  isOwner: boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: [],
  isOwner: false,
});

export function PermissionProvider({
  children,
  permissions,
  isOwner = false,
}: {
  children: ReactNode;
  permissions: string[];
  isOwner?: boolean;
}) {
  return (
    <PermissionContext.Provider value={{ permissions, isOwner }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);

  const hasPermission = (permissionSlug: string): boolean => {
    if (context.isOwner) return true;
    if (!permissionSlug) return true;
    return context.permissions.includes(permissionSlug);
  };

  const hasAnyPermission = (permissionSlugs: string[]): boolean => {
    if (context.isOwner) return true;
    if (!permissionSlugs || permissionSlugs.length === 0) return true;
    return permissionSlugs.some((slug) => context.permissions.includes(slug));
  };

  return {
    permissions: context.permissions,
    isOwner: context.isOwner,
    hasPermission,
    hasAnyPermission,
  };
}

export function PermissionGuard({
  permission,
  children,
  fallback = null,
}: {
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = usePermission();

  if (!hasPermission(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
