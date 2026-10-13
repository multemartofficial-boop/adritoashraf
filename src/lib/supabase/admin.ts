import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { serverEnv } from "@/lib/env/server";
import type { Database } from "@/types/database";

let client: SupabaseClient<Database> | undefined;

// Service-role client: BYPASSES RLS. Server-only (guarded by "server-only").
// Use only for trusted server work: booking creation, slot computation, cron, emails.
export function supabaseAdmin(): SupabaseClient<Database> {
  if (client) return client;
  const env = serverEnv();
  client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
