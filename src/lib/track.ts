"use client";

/**
 * Lightweight analytics shim — pushes custom events into the GA4 dataLayer
 * when GA is configured in Site Settings, and is a silent no-op otherwise.
 * GA4 picks these up as custom events (configure them as conversions in GA).
 */
export function track(event: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}
