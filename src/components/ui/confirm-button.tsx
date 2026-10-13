"use client";

import * as React from "react";
import { AlertDialog as A } from "radix-ui";
import { Loader2 } from "lucide-react";
import { Button } from "./button";

/** Wraps a destructive action in an accessible confirmation dialog. */
export function ConfirmButton({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => Promise<unknown> | void;
  children: React.ReactElement;
}) {
  const [open, setOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  return (
    <A.Root open={open} onOpenChange={(o) => !pending && setOpen(o)}>
      <A.Trigger asChild>{children}</A.Trigger>
      <A.Portal>
        <A.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px]" />
        <A.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-admin-border bg-white p-5 font-admin text-admin-text shadow-2xl outline-none">
          <A.Title className="text-base font-semibold">{title}</A.Title>
          <A.Description className="mt-1.5 text-sm text-admin-muted">{description}</A.Description>
          <div className="mt-5 flex justify-end gap-2">
            <A.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </A.Cancel>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await onConfirm();
                  setOpen(false);
                })
              }
            >
              {pending && <Loader2 className="animate-spin" />}
              {confirmLabel}
            </Button>
          </div>
        </A.Content>
      </A.Portal>
    </A.Root>
  );
}
