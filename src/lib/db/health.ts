import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Tiny query used by /api/health and the daily cron (keeps the free Supabase project awake). */
export async function pingDatabase(): Promise<boolean> {
  const { error } = await supabaseAdmin().from("site_settings").select("id").limit(1);
  return !error;
}
