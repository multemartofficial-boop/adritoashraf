import { after, NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/auth/origin";
import { getClientIp, rateLimit } from "@/lib/auth/rate-limit";
import { zodFieldErrors } from "@/lib/forms";
import { leadSchema } from "@/lib/validators/contact";
import { saveLead, sendGiftEmail } from "@/lib/leads";

const MIN_FILL_MS = 2_000;
const MAX_FILL_MS = 2 * 3_600_000;

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });
const cookie = (req: NextRequest, name: string) => req.cookies.get(name)?.value?.slice(0, 120) ?? "";

// POST /api/lp/subscribe — gift-page signup (JSON: name, email, slug, website, form_started_at).
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);

  const ip = await getClientIp();
  if (!(await rateLimit(`lead:ip:${ip}`, 10, 3600))) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: humans never see this field; bots fill it. Fake success, store nothing.
  if (typeof body.website === "string" && body.website) return json({ ok: true });

  const elapsed = Date.now() - Number(body.form_started_at);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return json({ error: "The form expired. Please refresh and try again." }, 400);
  }

  const parsed = leadSchema.safeParse({ name: body.name, email: body.email, slug: body.slug });
  if (!parsed.success) {
    return json({ error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) }, 422);
  }
  const input = parsed.data;

  if (!(await rateLimit(`lead:email:${input.email}`, 3, 86_400))) {
    return json({ error: "That email was used too many times today. Please try again tomorrow." }, 429);
  }

  try {
    const saved = await saveLead({
      ...input,
      utm_source: cookie(request, "utm_source"),
      utm_medium: cookie(request, "utm_medium"),
      utm_campaign: cookie(request, "utm_campaign"),
    });
    if (!saved) return json({ error: "This page is no longer available." }, 404);

    after(async () => {
      await sendGiftEmail(saved.page, saved.contact);
    });
  } catch (err) {
    console.error("[lp/subscribe]", err);
    return json({ error: "Could not save your details. Please try again." }, 500);
  }

  return json({ ok: true, redirect: `/${input.slug}/thank-you` }, 201);
}
