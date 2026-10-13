"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = D.Root;
export const SheetTrigger = D.Trigger;
export const SheetClose = D.Close;

export function SheetContent({
  className,
  children,
  title,
  side = "left",
  ...props
}: React.ComponentProps<typeof D.Content> & { title: string; side?: "left" | "right" }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity data-[state=closed]:opacity-0" />
      <D.Content
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 max-w-[85vw] flex-col bg-admin-bg shadow-2xl outline-none",
          side === "left" ? "left-0" : "right-0",
          className,
        )}
        {...props}
      >
        <D.Title className="sr-only">{title}</D.Title>
        <D.Description className="sr-only">{title}</D.Description>
        {children}
        <D.Close
          className="absolute top-3 right-3 rounded-full p-1.5 text-admin-muted hover:bg-black/5 hover:text-admin-text"
          aria-label="Close"
        >
          <X className="size-4" />
        </D.Close>
      </D.Content>
    </D.Portal>
  );
}
