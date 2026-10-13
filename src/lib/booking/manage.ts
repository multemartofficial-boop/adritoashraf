import "server-only";
import { hashManageToken } from "@/lib/booking/tokens";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BookingStatus } from "@/types/database";

export type ManageableBooking = {
  reference_code: string;
  client_name: string;
  status: BookingStatus;
  start_time_utc: string;
  end_time_utc: string;
  client_timezone: string;
  meeting_link: string;
  service: string;
};

export const isManageToken = (raw: string) => /^[A-Za-z0-9_-]{20,80}$/.test(raw);

/** Resolves a raw manage token to its booking plus whether it may still be changed online. */
export async function lookupManageableBooking(rawToken: string): Promise<{
  booking: ManageableBooking | null;
  cancelNoticeHours: number;
  canChange: boolean;
}> {
  const db = supabaseAdmin();
  const [bookingRes, settingsRes] = await Promise.all([
    isManageToken(rawToken)
      ? db
          .from("bookings")
          .select("reference_code, client_name, status, start_time_utc, end_time_utc, client_timezone, meeting_link, service_id")
          .eq("manage_token_hash", hashManageToken(rawToken))
          .maybeSingle()
      : Promise.resolve({ data: null }),
    db.from("booking_settings").select("cancel_notice_hours").eq("id", 1).maybeSingle(),
  ]);
  const row = bookingRes.data;
  const cancelNoticeHours = settingsRes.data?.cancel_notice_hours ?? 12;
  if (!row) return { booking: null, cancelNoticeHours, canChange: false };

  const service = row.service_id
    ? ((await db.from("services").select("title").eq("id", row.service_id).maybeSingle()).data?.title ?? "General enquiry")
    : "General enquiry";

  const active = row.status === "pending" || row.status === "confirmed";
  const canChange = active && Date.parse(row.start_time_utc) - Date.now() >= cancelNoticeHours * 3_600_000;
  const { service_id: _sid, ...rest } = row;
  void _sid;
  return { booking: { ...rest, service }, cancelNoticeHours, canChange };
}
