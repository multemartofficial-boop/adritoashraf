import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env/server";
import { safeEqual } from "@/lib/booking/tokens";
import { pingDatabase } from "@/lib/db/health";
import { issueManageToken, sendBookingEmail } from "@/lib/email/booking-emails";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Daily run: remind every confirmed meeting starting within the next 36 hours
// (covers "tomorrow" for a once-a-day schedule), and touch the database so the
// free Supabase project never pauses for inactivity.
const WINDOW_HOURS = 36;

function authorized(request: Request): boolean {
  const secret = serverEnv().CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const alt = request.headers.get("x-cron-secret") ?? "";
  return (bearer !== "" && safeEqual(bearer, secret)) || (alt !== "" && safeEqual(alt, secret));
}

async function run(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = supabaseAdmin();
  const dbUp = await pingDatabase();
  const now = new Date();
  const until = new Date(now.getTime() + WINDOW_HOURS * 3_600_000);

  const { data: due, error } = await db
    .from("bookings")
    .select("*")
    .eq("status", "confirmed")
    .is("reminder_sent_at", null)
    .gte("start_time_utc", now.toISOString())
    .lte("start_time_utc", until.toISOString())
    .limit(100);

  let sent = 0;
  let failed = 0;
  for (const booking of due ?? []) {
    // Claim first so a second overlapping run cannot double-send.
    const { data: claimed } = await db
      .from("bookings")
      .update({ reminder_sent_at: now.toISOString() })
      .eq("id", booking.id)
      .is("reminder_sent_at", null)
      .select("id")
      .maybeSingle();
    if (!claimed) continue;

    const token = await issueManageToken(booking.id);
    const result = await sendBookingEmail("reminder_client", booking, { manageToken: token });
    if (result.sent) sent++;
    else {
      failed++;
      await db.from("bookings").update({ reminder_sent_at: null }).eq("id", booking.id);
    }
  }

  await db
    .from("dashboard_state")
    .upsert({ key: "cron_last_run", value: { at: now.toISOString(), sent, failed, dbUp } });

  return NextResponse.json({ ok: !error, db: dbUp ? "up" : "down", checked: due?.length ?? 0, sent, failed });
}

export const GET = run;
export const POST = run;
