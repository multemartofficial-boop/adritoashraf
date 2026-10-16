import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { storage } from "@/lib/storage";
import type { LandingPageRow } from "@/types/database";

/** Server-side only: the gift URL is never rendered on the public landing page. */
export async function resolveGiftUrl(
  page: Pick<LandingPageRow, "gift_type" | "gift_file" | "gift_url">,
): Promise<string> {
  if (page.gift_type === "pdf" && page.gift_file) {
    try {
      return await storage().signedUrl(page.gift_file, 3600);
    } catch {
      return "";
    }
  }
  return page.gift_url;
}

/**
 * Records a landing-page event. Called from /api/lp/track with the service
 * role — public visitors never touch this directly.
 */
export async function trackLandingPageEvent(input: {
  slug: string;
  kind: "view" | "thankyou";
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
}): Promise<void> {
  const supabase = supabaseAdmin();
  const { data: page } = await supabase
    .from("landing_pages")
    .select("id")
    .eq("slug", input.slug)
    .eq("status", "published")
    .maybeSingle();
  if (!page) return;

  await Promise.all([
    supabase.from("landing_page_events").insert({
      page_id: page.id,
      kind: input.kind,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
    }),
    supabase.rpc("increment_lp_counter", {
      p_slug: input.slug,
      p_kind: input.kind,
    }),
  ]);
}
