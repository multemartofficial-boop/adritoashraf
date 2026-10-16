import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { trackLandingPageEvent } from "@/lib/landing-page";

const payloadSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    .max(60),
  kind: z.enum(["view", "thankyou"]),
});

const cookie = (req: NextRequest, name: string) =>
  req.cookies.get(name)?.value?.slice(0, 120) ?? "";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  try {
    await trackLandingPageEvent({
      slug: parsed.data.slug,
      kind: parsed.data.kind,
      utm_source: cookie(request, "utm_source"),
      utm_medium: cookie(request, "utm_medium"),
      utm_campaign: cookie(request, "utm_campaign"),
    });
  } catch (err) {
    console.error("[lp/track]", err);
  }
  return NextResponse.json({ ok: true });
}
