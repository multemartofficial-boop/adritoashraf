import "server-only";
import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Fixed-window limiter stored in Postgres (works across processes on shared hosting). */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const { data, error } = await supabaseAdmin().rpc("hit_rate_limit", {
    p_key: key,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error("Rate limiter unavailable");
  return data === true;
}

export async function resetRateLimit(key: string) {
  await supabaseAdmin().from("rate_limits").delete().eq("key", key);
}

/**
 * Best-effort client IP. Uses the LAST X-Forwarded-For hop (added by the hosting proxy),
 * since earlier hops are client-controlled and can be spoofed.
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",").map((s) => s.trim()).filter(Boolean);
    if (hops.length) return hops[hops.length - 1];
  }
  return h.get("x-real-ip") ?? "unknown";
}
