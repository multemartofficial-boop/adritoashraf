import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { publicEnv } from "@/lib/env/public";
import { sendEmail } from "@/lib/email/mailer";
import { storage } from "@/lib/storage";
import { GIFT_LABELS } from "@/lib/landing-page-shared";
import type { ContactRow, LandingPageRow } from "@/types/database";

type Attribution = { utm_source: string; utm_medium: string; utm_campaign: string };

/**
 * Stores a gift-page signup (source = 'form'). Called from /api/lp/subscribe with
 * the service role. A returning email keeps its original row (and source) but
 * gets its name/page refreshed. Returns null when the page is not published.
 */
export async function saveLead(
  input: { name: string; email: string; slug: string } & Attribution,
): Promise<{ page: LandingPageRow; contact: ContactRow; isNew: boolean } | null> {
  const supabase = supabaseAdmin();
  const { data: page } = await supabase
    .from("landing_pages")
    .select("*")
    .eq("slug", input.slug)
    .eq("status", "published")
    .maybeSingle();
  if (!page) return null;

  const { data: existing } = await supabase.from("contacts").select("*").eq("email", input.email).maybeSingle();
  if (existing) {
    const { data: updated } = await supabase
      .from("contacts")
      .update({ name: existing.name || input.name, page_id: page.id, page_slug: page.slug })
      .eq("id", existing.id)
      .select("*")
      .single();
    return { page, contact: updated ?? existing, isNew: false };
  }

  const { data: contact, error } = await supabase
    .from("contacts")
    .insert({
      name: input.name,
      email: input.email,
      source: "form",
      page_id: page.id,
      page_slug: page.slug,
      utm_source: input.utm_source,
      utm_medium: input.utm_medium,
      utm_campaign: input.utm_campaign,
    })
    .select("*")
    .single();
  if (error || !contact) throw error ?? new Error("Contact insert failed");
  return { page, contact, isNew: true };
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Emails the subscriber their gift link (signed for 7 days when it's a private file). */
export async function sendGiftEmail(page: LandingPageRow, contact: Pick<ContactRow, "name" | "email">) {
  const giftUrl =
    page.gift_type === "pdf" && page.gift_file
      ? await storage().signedUrl(page.gift_file, 7 * 86_400).catch(() => "")
      : page.gift_url;
  const site = publicEnv.NEXT_PUBLIC_SITE_URL;
  const thankYou = `${site}/${page.slug}/thank-you`;
  const firstName = contact.name.split(" ")[0] || "there";
  const title = page.internal_name;
  const link = giftUrl || thankYou;
  const label = giftUrl ? GIFT_LABELS[page.gift_type] : "Open your gift";

  const text = [
    `Hi ${firstName},`,
    "",
    `Here is your copy of "${title}".`,
    `${label}: ${link}`,
    "",
    page.next_step_label ? `${page.next_step_label}: ${site}${page.next_step_href.startsWith("/") ? page.next_step_href : "/book"}` : "",
    "",
    "Talk soon,",
    "Adrito Ashraf",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #e6e6ef">
<p>Hi ${esc(firstName)},</p>
<p>Here is your copy of <strong>${esc(title)}</strong>.</p>
<p style="margin:24px 0"><a href="${esc(link)}" style="display:inline-block;background:#7C4DFF;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold">${esc(label)}</a></p>
<p style="font-size:13px;color:#8a8a99">If the button doesn't work, open: <a href="${esc(thankYou)}">${esc(thankYou)}</a></p>
<p>Talk soon,<br>Adrito Ashraf</p>
</div><p style="font-size:12px;color:#8a8a99;text-align:center;margin-top:16px">Adrito Ashraf &middot; Full Stack Developer</p></div></body></html>`;

  return sendEmail({ to: contact.email, subject: `Your copy of ${title}`, html, text });
}
