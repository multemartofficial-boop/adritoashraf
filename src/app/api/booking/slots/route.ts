import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking/slots";
import { hashManageToken } from "@/lib/booking/tokens";
import { getClientIp, rateLimit } from "@/lib/auth/rate-limit";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidTimeZone } from "@/lib/time";

// GET /api/booking/slots — returns all bookable UTC slots for the coming weeks.
// ?exclude=<manage-token> omits that booking (for the reschedule picker).
export async function GET(request: Request) {
  const ip = await getClientIp();
  if (!(await rateLimit(`slots:${ip}`, 60, 60))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  let excludeBookingId: string | undefined;
  const exclude = url.searchParams.get("exclude");
  if (exclude && /^[A-Za-z0-9_-]{20,80}$/.test(exclude)) {
    const { data } = await supabaseAdmin()
      .from("bookings")
      .select("id")
      .eq("manage_token_hash", hashManageToken(exclude))
      .maybeSingle();
    excludeBookingId = data?.id;
  }

  const data = await getAvailability({ excludeBookingId });
  const tz = url.searchParams.get("tz");
  return NextResponse.json(
    { ...data, displayTimezone: tz && isValidTimeZone(tz) ? tz : data.timezone },
    { headers: { "Cache-Control": "no-store" } },
  );
}
