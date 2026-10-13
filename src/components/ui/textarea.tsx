import * as React from "react";
import { cn } from "@/lib/utils";

export function Textarea({ className, rows = 4, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full min-w-0 rounded-xl border border-admin-border bg-white px-3 py-2 text-sm text-admin-text shadow-xs outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-admin-muted focus-visible:border-admin-info focus-visible:ring-3 focus-visible:ring-admin-info/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-admin-danger aria-invalid:ring-admin-danger/20",
        className,
      )}
      {...props}
    />
  );
}
