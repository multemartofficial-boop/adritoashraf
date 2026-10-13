import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

let client: SupabaseClient<Database> | undefined;

/**
 * Cookie-free anon client for public content. Reading no cookies lets pages be
 * prerendered and cached (ISR); RLS limits it to published rows.
 */
export function supabasePublic(): SupabaseClient<Database> {
  client ??= createClient<Database>(publicEnv.NEXT_PUBLIC_SUPABASE_URL, publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return client;
}
