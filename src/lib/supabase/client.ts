import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";
import type { Database } from "@/types/database";

// Browser client: anon key only, all access governed by RLS.
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
