"use client";

import * as React from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/components/button";
import { cn } from "@/shared/utils";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "An error occurred.", onRetry, className, ...props }: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[300px] flex-col items-center justify-center p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-destructive">Something went wrong</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
