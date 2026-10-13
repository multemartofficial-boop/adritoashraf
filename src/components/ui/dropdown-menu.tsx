"use client";

import * as React from "react";
import { DropdownMenu as M } from "radix-ui";
import { cn } from "@/lib/utils";

export const DropdownMenu = M.Root;
export const DropdownMenuTrigger = M.Trigger;
export const DropdownMenuGroup = M.Group;

export function DropdownMenuContent({
  className,
  sideOffset = 6,
  align = "end",
  ...props
}: React.ComponentProps<typeof M.Content>) {
  return (
    <M.Portal>
      <M.Content
        sideOffset={sideOffset}
        align={align}
        className={cn(
          "z-50 min-w-48 overflow-hidden rounded-xl border border-admin-border bg-white/95 p-1 text-admin-text shadow-panel backdrop-blur-xl",
          className,
        )}
        {...props}
      />
    </M.Portal>
  );
}

export function DropdownMenuItem({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof M.Item> & { variant?: "danger" }) {
  return (
    <M.Item
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[highlighted]:bg-black/5 [&_svg]:size-4 [&_svg]:text-admin-muted",
        variant === "danger" && "text-admin-danger data-[highlighted]:bg-admin-danger/10 [&_svg]:text-admin-danger",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, ...props }: React.ComponentProps<typeof M.Label>) {
  return <M.Label className={cn("px-2.5 py-1.5 text-xs font-medium text-admin-muted", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof M.Separator>) {
  return <M.Separator className={cn("my-1 h-px bg-admin-border", className)} {...props} />;
}
