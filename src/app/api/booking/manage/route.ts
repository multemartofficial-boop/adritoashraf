import { after, NextResponse } from "next/server";
import { z } from "zod";
import { isSameOrigin } from "@/lib/auth/origin";
import { getClientIp, rateLimit } from "@/lib/auth/rate-limit";
import { hashManageToken } from "@/lib/booking/tokens";
import { isSlotAvailable } from "@/lib/booking/slots";
import { sendBookingEmail } from "@/lib/email/booking-emails";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BookingRow } from "@/types/database";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const bodySchema = z.object({
  token: z.string().regex(/^[A-Za-z0-9_-]{20,80}$/),
  action: z.enum(["cancel", "reschedule"]),
  start_time_utc: z.string().optional(),
});

// POST /api/booking/manage — client-side cancel/reschedule using the private link token.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);

  const ip = await getClientIp();
  if (!(await rateLimit(`manage:${ip}`, 30, 3600))) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: "Invalid request." }, 400);
  const { token, action } = parsed.data;

  const { data: booking } = await supabaseAdmin()
    .from("bookings")
    .select("*")
    .eq("manage_token_hash", hashManageToken(token))
    .maybeSingle();
  if (!booking) return json({ error: "This booking link is invalid or has expired." }, 404);

  const { data: settings } = await supabaseAdmin().from("booking_settings").select("cancel_notice_hours").eq("id", 1).single();
  const noticeMs = (settings?.cancel_notice_hours ?? 12) * 3_600_000;
  const tooLate = Date.parse(booking.start_time_utc) - Date.now() < noticeMs;

  if (booking.status === "cancelled") return json({ error: "This booking is already cancelled." }, 409);
  if (booking.status === "completed") return json({ error: "This meeting already took place." }, 409);
  if (tooLate) {
    return json({ error: "It is too close to the meeting to change it online. Please reply to your booking email instead." }, 409);
  }

  if (action === "cancel") {
    const { data: updated, error } = await supabaseAdmin()
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString(), cancelled_by: "client" })
      .eq("id", booking.id)
      .in("status", ["pending", "confirmed"])
      .select()
      .single();
    if (error || !updated) return json({ error: "Could not cancel this booking." }, 500);

    after(async () => {
      await sendBookingEmail("cancelled_client", updated);
      await sendBookingEmail("cancelled_admin", updated);
    });
    return json({ ok: true, status: "cancelled" });
  }

  // reschedule
  const startMs = Date.parse(parsed.data.start_time_utc ?? "");
  if (!Number.isFinite(startMs)) return json({ error: "Pick a new time slot." }, 422);

  const slotMinutes = await isSlotAvailable(startMs, { excludeBookingId: booking.id });
  if (slotMinutes === null) {
    return json({ error: "That time is no longer available. Please pick another slot.", code: "SLOT_GONE" }, 409);
  }
  const endIso = new Date(startMs + slotMinutes * 60_000).toISOString();

  const { data: updated, error } = await supabaseAdmin()
    .rpc("reschedule_booking", { p_booking_id: booking.id, p_start: new Date(startMs).toISOString(), p_end: endIso })
    .single();

  if (error || !updated) {
    const msg = error?.message ?? "";
    const friendly = msg.includes("SLOT_TAKEN") || error?.code === "23505" || error?.code === "23P01"
      ? "That time was just taken. Please pick another slot."
      : msg.includes("DAY_FULL")
        ? "That day is fully booked. Please pick another day."
        : msg.includes("DATE_BLOCKED")
          ? "That day is unavailable. Please pick another date."
          : null;
    if (friendly) return json({ error: friendly, code: "SLOT_GONE" }, 409);
    console.error("[booking reschedule]", error);
    return json({ error: "Could not reschedule. Please try again." }, 500);
  }

  const row = updated as BookingRow;
  after(async () => {
    await sendBookingEmail("rescheduled_client", row, { manageToken: token });
    await sendBookingEmail("rescheduled_admin", row);
  });
  return json({
    ok: true,
    status: row.status,
    start_time_utc: new Date(row.start_time_utc).toISOString(),
    end_time_utc: new Date(row.end_time_utc).toISOString(),
  });
}
