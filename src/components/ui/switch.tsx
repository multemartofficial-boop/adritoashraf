"use client";

import * as React from "react";
import { Switch as S } from "radix-ui";
import { cn } from "@/lib/utils";

export function Switch({ className, ...props }: React.ComponentProps<typeof S.Root>) {
  return (
    <S.Root
      className={cn(
        "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-black/15 transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-admin-info/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-admin-success",
        className,
      )}
      {...props}
    >
      <S.Thumb className="pointer-events-none block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-[18px]" />
    </S.Root>
  );
}
