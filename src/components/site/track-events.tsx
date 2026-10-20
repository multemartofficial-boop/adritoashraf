"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * Delegated click tracking for marketing CTAs across the whole public site:
 *  - any link to /book or #book      → "book_call_click"
 *  - any wa.me WhatsApp link          → "whatsapp_click"
 *  - any element with data-track="x"  → event "x"
 */
export function TrackEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const explicit = (e.target as HTMLElement).closest("[data-track]") as HTMLElement | null;
      if (explicit?.dataset.track) {
        track(explicit.dataset.track);
        return;
      }
      const a = (e.target as HTMLElement).closest("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if ((a as HTMLAnchorElement).href.startsWith("https://wa.me/")) track("whatsapp_click");
      else if (href === "#book" || href.startsWith("/book")) track("book_call_click");
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}
