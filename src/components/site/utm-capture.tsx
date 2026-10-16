"use client";

import { useEffect } from "react";

const KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Stores the visitor's campaign params in cookies on their first hit, so the
 * thank-you/tracking events can attribute which campaign worked.
 */
export function UtmCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    for (const key of KEYS) {
      const value = params.get(key);
      if (value) {
        document.cookie = `${key}=${encodeURIComponent(value.slice(0, 120))}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
      }
    }
  }, []);
  return null;
}
