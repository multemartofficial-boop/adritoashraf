import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Native select styled to match inputs (accessible and light-weight). */
export function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-xl border border-admin-border bg-white pr-9 pl-3 text-sm text-admin-text shadow-xs outline-none transition-[border-color,box-shadow] duration-150 focus-visible:border-admin-info focus-visible:ring-3 focus-visible:ring-admin-info/20 disabled:opacity-50 aria-invalid:border-admin-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-admin-muted" />
    </div>
  );
}
