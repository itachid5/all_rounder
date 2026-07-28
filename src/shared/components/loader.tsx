import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  fullPage?: boolean;
}

export function Loader({ className, size = 24, fullPage, ...props }: LoaderProps) {
  const loader = <Loader2 size={size} className={cn("animate-spin text-primary", className)} />;

  if (fullPage) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8" {...props}>
        {loader}
      </div>
    );
  }

  return <div {...props}>{loader}</div>;
}
