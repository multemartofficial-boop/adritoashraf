"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Radio, X } from "lucide-react";

/** Floating pill on the landing page promoting the free webinar. Dismisses per session. */
export function WebinarBadge() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 flex justify-center sm:right-6 sm:bottom-6 sm:left-auto sm:justify-end">
      <div className="bg-cta flex items-center gap-1 rounded-full py-1.5 pr-1.5 pl-4 text-white shadow-[0_10px_40px_rgb(123_79_255/0.45)]">
        <Link
          href="/webinar"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <Radio className="size-4 animate-pulse" aria-hidden />
          Free webinar — save your seat
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss webinar banner"
          className="grid size-7 shrink-0 place-items-center rounded-full transition-colors hover:bg-white/20"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
