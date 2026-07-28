import * as React from "react";
import { Badge } from "@/shared/components/badge";

export type StatusVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

interface StatusBadgeProps {
  status: string;
  variantMap?: Record<string, StatusVariant>;
  className?: string;
}

const defaultVariantMap: Record<string, StatusVariant> = {
  active: "success",
  inactive: "secondary",
  pending: "warning",
  draft: "default",
  archived: "outline",
  error: "destructive",
  failed: "destructive",
  completed: "success",
};

export function StatusBadge({ status, variantMap = defaultVariantMap, className }: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const variant = variantMap[normalizedStatus] || "default";

  return (
    <Badge variant={variant} className={className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
