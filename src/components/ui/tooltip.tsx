"use client";

import * as React from "react";
import { Tooltip as T } from "radix-ui";
import { cn } from "@/lib/utils";

export const TooltipProvider = ({ delayDuration = 150, ...props }: React.ComponentProps<typeof T.Provider>) => (
  <T.Provider delayDuration={delayDuration} {...props} />
);

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: React.ComponentProps<typeof T.Content>["side"];
}) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content
          side={side}
          sideOffset={6}
          className={cn("z-50 max-w-64 rounded-lg bg-neutral-950 px-2.5 py-1.5 text-xs text-white shadow-lg")}
        >
          {content}
          <T.Arrow className="fill-neutral-950" />
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
