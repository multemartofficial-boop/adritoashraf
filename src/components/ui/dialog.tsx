"use client";

import * as React from "react";
import { Dialog as D } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

export function DialogContent({
  className,
  children,
  title,
  description,
  ...props
}: React.ComponentProps<typeof D.Content> & { title: string; description?: string }) {
  return (
    <D.Portal>
      <D.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />
      <D.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-admin-border bg-white font-admin text-admin-text shadow-2xl outline-none",
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-admin-border px-5 py-4">
          <div>
            <D.Title className="text-base font-semibold">{title}</D.Title>
            <D.Description className={cn("text-sm text-admin-muted", !description && "sr-only")}>
              {description ?? title}
            </D.Description>
          </div>
          <D.Close className="rounded-full p-1.5 text-admin-muted hover:bg-black/5 hover:text-admin-text" aria-label="Close">
            <X className="size-4" />
          </D.Close>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
      </D.Content>
    </D.Portal>
  );
}
