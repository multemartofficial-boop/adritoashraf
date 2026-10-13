import { NextResponse } from "next/server";
import { icsForBooking } from "@/lib/booking/calendar";
import { hashManageToken } from "@/lib/booking/tokens";
import { getClientIp, rateLimit } from "@/lib/auth/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/booking/ics?token=... — .ics download for the client's own booking.
export async function GET(request: Request) {
  const ip = await getClientIp();
  if (!(await rateLimit(`ics:${ip}`, 30, 3600))) return new NextResponse("Too many requests", { status: 429 });

  const token = new URL(request.url).searchParams.get("token") ?? "";
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return new NextResponse("Not found", { status: 404 });

  const db = supabaseAdmin();
  const { data: booking } = await db.from("bookings").select("*").eq("manage_token_hash", hashManageToken(token)).maybeSingle();
  if (!booking || booking.status === "cancelled") return new NextResponse("Not found", { status: 404 });

  const { data: site } = await db.from("site_settings").select("owner_name").eq("id", 1).maybeSingle();
  const owner = site?.owner_name || "Adrito Ashraf";
  const ics = icsForBooking(booking, {
    summary: `Meeting with ${owner}`,
    description: `Booking ${booking.reference_code}.${booking.meeting_link ? ` Join: ${booking.meeting_link}` : ""}`,
    location: booking.meeting_link || "Online",
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="meeting-${booking.reference_code}.ics"`,
      "Cache-Control": "private, no-store",
    },
  });
}
