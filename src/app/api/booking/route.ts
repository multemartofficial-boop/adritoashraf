import { after, NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/origin";
import { getClientIp, rateLimit } from "@/lib/auth/rate-limit";
import { parseBookingIntake } from "@/lib/validators/booking";
import { fdString, zodFieldErrors } from "@/lib/forms";
import { isSlotAvailable } from "@/lib/booking/slots";
import { generateManageToken, generateReferenceCode, hashManageToken } from "@/lib/booking/tokens";
import { storage, uploadBookingAttachment } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendBookingEmail } from "@/lib/email/booking-emails";
import { saveBookingContact } from "@/lib/leads";
import type { BookingRow } from "@/types/database";

const MIN_FILL_MS = 3_000;
const MAX_FILL_MS = 2 * 3_600_000;

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

const SLOT_ERRORS: Record<string, string> = {
  SLOT_TAKEN: "That time was just taken. Please pick another slot.",
  DAY_FULL: "That day is fully booked. Please pick another day.",
  DATE_BLOCKED: "That day is unavailable. Please pick another date.",
};

// POST /api/booking — public booking creation (multipart: fields + optional file).
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);

  const ip = await getClientIp();
  if (!(await rateLimit(`book:ip:${ip}`, 10, 3600))) {
    return json({ error: "Too many attempts. Please try again later." }, 429);
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: humans never see this field; bots fill it. Fake success, store nothing.
  if (fdString(fd, "website")) return json({ ok: true, reference_code: "ADR-OK", status: "pending", manage_token: "" });

  // Humans need a few seconds to fill the form; stale forms are rejected too.
  const started = Number(fdString(fd, "form_started_at"));
  const elapsed = Date.now() - started;
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > MAX_FILL_MS) {
    return json({ error: "The form expired. Please refresh and try again." }, 400);
  }

  const parsed = parseBookingIntake(fd);
  if (!parsed.success) {
    return json({ error: "Please check the highlighted fields.", fieldErrors: zodFieldErrors(parsed.error) }, 422);
  }
  const input = parsed.data;

  // Clients may leave a phone/WhatsApp contact instead of an email — rate-limit on whichever exists.
  const contactKey = input.email ? `book:email:${input.email.toLowerCase()}` : `book:phone:${input.phone}`;
  if (!(await rateLimit(contactKey, 5, 86_400))) {
    return json({ error: "Too many bookings from this contact. Please try again tomorrow." }, 429);
  }

  // Re-validate the slot server-side; the picker may be stale.
  const startMs = Date.parse(input.start_time_utc);
  const slotMinutes = await isSlotAvailable(startMs);
  if (slotMinutes === null) {
    return json({ error: "That time is no longer available. Please pick another slot.", code: "SLOT_GONE" }, 409);
  }
  const endIso = new Date(startMs + slotMinutes * 60_000).toISOString();

  // Optional attachment (image/PDF <= 5MB, verified by content) into the private bucket.
  let attachmentPath = "";
  const file = fd.get("attachment");
  if (file instanceof File && file.size > 0) {
    try {
      attachmentPath = (await uploadBookingAttachment(file)).path;
    } catch {
      return json({ error: "Attachment must be an image or PDF under 5 MB." }, 422);
    }
  }

  const manageToken = generateManageToken();
  const tryCreate = () =>
    supabaseAdmin().rpc("create_booking", {
      p: {
        reference_code: generateReferenceCode(),
        client_name: input.client_name,
        email: input.email,
        phone: input.phone,
        service_id: input.service_id,
        project_type: input.project_type,
        budget_range: input.budget_range,
        timeline_needed: input.timeline_needed,
        project_description: input.project_description,
        reference_links: input.reference_links,
        attachment_path: attachmentPath,
        client_timezone: input.client_timezone,
        start_time_utc: input.start_time_utc,
        end_time_utc: endIso,
        manage_token_hash: hashManageToken(manageToken),
      },
    });

  let { data: booking, error } = await tryCreate();
  // Astronomically unlikely reference-code collision: retry once with a fresh code.
  if (error?.code === "23505" && error.message.includes("reference_code")) {
    ({ data: booking, error } = await tryCreate());
  }

  if (error || !booking) {
    if (attachmentPath) await storage().remove("private", [attachmentPath]).catch(() => {});
    const friendly = SLOT_ERRORS[error?.message ?? ""] ?? (error?.code === "23505" || error?.code === "23P01" ? SLOT_ERRORS.SLOT_TAKEN : null);
    if (friendly) return json({ error: friendly, code: "SLOT_GONE" }, 409);
    console.error("[booking create]", error);
    return json({ error: "Could not save your booking. Please try again." }, 500);
  }

  const row = booking as BookingRow;
  const isConfirmed = row.status === "confirmed";

  // Emails run after the response so slow SMTP never delays confirmation.
  after(async () => {
    // Keep the contacts list complete: every booking client lands as a 'booking' contact.
    try {
      await saveBookingContact({ name: input.client_name, email: input.email, phone: input.phone });
    } catch (e) {
      console.error("[booking contact]", e);
    }
    if (row.email) {
      await sendBookingEmail(isConfirmed ? "booking_confirmed_client" : "booking_received_client", row, { manageToken });
    }
    await sendBookingEmail("booking_admin_notification", row);
  });

  return json(
    {
      ok: true,
      reference_code: row.reference_code,
      status: row.status,
      manage_token: manageToken,
      start_time_utc: new Date(row.start_time_utc).toISOString(),
      end_time_utc: new Date(row.end_time_utc).toISOString(),
      meeting_link: isConfirmed ? row.meeting_link : "",
    },
    201,
  );
}
