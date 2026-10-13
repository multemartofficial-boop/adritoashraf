"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Status = "checking" | "ok" | "down";

const LABEL: Record<Status, string> = { checking: "Checking", ok: "All OK", down: "Degraded" };

export function StatusPill() {
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    let alive = true;
    const check = () =>
      fetch("/api/health", { cache: "no-store" })
        .then((r) => alive && setStatus(r.ok ? "ok" : "down"))
        .catch(() => alive && setStatus("down"));
    check();
    const id = setInterval(check, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <span
      role="status"
      aria-label={`System status: ${LABEL[status]}`}
      className="inline-flex h-8 items-center gap-2 rounded-full border border-admin-border bg-white px-3 text-xs font-medium shadow-xs"
    >
      <span
        className={cn(
          "size-2 rounded-full",
          status === "ok" && "bg-admin-success shadow-[0_0_0_3px_rgb(22_163_74/0.15)]",
          status === "down" && "bg-admin-danger shadow-[0_0_0_3px_rgb(225_29_72/0.15)]",
          status === "checking" && "animate-pulse bg-admin-idle",
        )}
      />
      {LABEL[status]}
    </span>
  );
}
