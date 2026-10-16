"use client";

import { useEffect } from "react";

/**
 * Fires a one-shot tracking beacon for a landing page. The utm_* cookies set
 * by <UtmCapture> ride along automatically (same-origin request).
 */
export function LpTracker({
  slug,
  kind,
}: {
  slug: string;
  kind: "view" | "thankyou";
}) {
  useEffect(() => {
    fetch("/api/lp/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, kind }),
      keepalive: true,
    }).catch(() => {});
  }, [slug, kind]);
  return null;
}
