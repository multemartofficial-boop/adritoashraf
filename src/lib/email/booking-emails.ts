import "server-only";
import { cache } from "react";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { serverEnv } from "@/lib/env/server";
import { publicEnv } from "@/lib/env/public";
import { sendEmail, type SendResult } from "./mailer";
import { renderTemplate, type TemplateVars } from "./render";
import { icsForBooking } from "@/lib/booking/calendar";
import { generateManageToken, hashManageToken } from "@/lib/booking/tokens";
import type { BookingRow, EmailTemplateType, SiteSettingsRow } from "@/types/database";

const CLIENT_TYPES: EmailTemplateType[] = [
  "booking_received_client",
  "booking_confirmed_client",
  "reminder_client",
  "cancelled_client",
  "rescheduled_client",
];

const fmtDate = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(
    new Date(iso),
  );
const fmtTime = (iso: string, tz: string) =>
  new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));

const getSiteBasics = cache(async () => {
  const { data } = await supabaseAdmin().from("site_settings").select("owner_name, contact_email").eq("id", 1).maybeSingle();
  return { ownerName: (data as Pick<SiteSettingsRow, "owner_name"> | null)?.owner_name || "Adrito Ashraf" };
});

const getAdminNotifyEmail = cache(async () => {
  const env = serverEnv();
  if (env.ADMIN_NOTIFY_EMAIL) return env.ADMIN_NOTIFY_EMAIL;
  const { data } = await supabaseAdmin().from("admins").select("email").limit(1);
  return data?.[0]?.email ?? "";
});

const getServiceTitle = cache(async (serviceId: string | null) => {
  if (!serviceId) return "General enquiry";
  const { data } = await supabaseAdmin().from("services").select("title").eq("id", serviceId).maybeSingle();
  return data?.title ?? "General enquiry";
});

/**
 * Rotates the manage token and returns the raw value for linking in an email.
 * Only the newest emailed link keeps working (older links stop resolving).
 */
export async function issueManageToken(bookingId: string): Promise<string> {
  const raw = generateManageToken();
  await supabaseAdmin().from("bookings").update({ manage_token_hash: hashManageToken(raw) }).eq("id", bookingId);
  return raw;
}

export const manageUrl = (rawToken: string) => `${publicEnv.NEXT_PUBLIC_SITE_URL}/manage-booking?token=${rawToken}`;

const PROJECT_TYPE_LABELS: Record<string, string> = {
  website: "Website",
  saas: "SaaS product",
  erp: "ERP / business software",
  hr: "HR system",
  other: "Something else",
};

export async function bookingVars(
  booking: BookingRow,
  opts: { manageToken?: string } = {},
): Promise<TemplateVars> {
  const [site, serviceTitle] = await Promise.all([getSiteBasics(), getServiceTitle(booking.service_id)]);
  const adminTz = (await supabaseAdmin().from("booking_settings").select("timezone").eq("id", 1).single()).data?.timezone ??
    "Asia/Dhaka";
  const links = Array.isArray(booking.reference_links) ? booking.reference_links : [];
  return {
    client_name: booking.client_name,
    client_email: booking.email,
    client_phone: booking.phone || "-",
    reference_code: booking.reference_code,
    service: serviceTitle,
    project_type: PROJECT_TYPE_LABELS[booking.project_type] ?? booking.project_type,
    budget_range: booking.budget_range || "-",
    timeline_needed: booking.timeline_needed || "-",
    project_description: booking.project_description,
    reference_links: links.length ? links.join("\n") : "-",
    date_client: fmtDate(booking.start_time_utc, booking.client_timezone),
    time_client: fmtTime(booking.start_time_utc, booking.client_timezone),
    client_timezone: booking.client_timezone,
    date_admin: fmtDate(booking.start_time_utc, adminTz),
    time_admin: fmtTime(booking.start_time_utc, adminTz),
    admin_timezone: adminTz,
    meeting_link: booking.meeting_link || "(link will be shared after confirmation)",
    manage_link: opts.manageToken ? manageUrl(opts.manageToken) : `${publicEnv.NEXT_PUBLIC_SITE_URL}/book`,
    owner_name: site.ownerName,
    site_url: publicEnv.NEXT_PUBLIC_SITE_URL,
  };
}

/** Realistic placeholder values for template previews and test sends. */
export async function sampleTemplateVars(): Promise<TemplateVars> {
  const start = new Date(Date.now() + 3 * 86_400_000);
  const fake: BookingRow = {
    id: "00000000-0000-0000-0000-000000000000",
    reference_code: "ADR-7K2P9Q",
    client_name: "Nadia Rahman",
    email: "nadia@example.com",
    phone: "+880 1700 000000",
    service_id: null,
    project_type: "website",
    budget_range: "$1,000 - $3,000",
    timeline_needed: "Within 1 month",
    project_description: "A booking website for my photography studio with a gallery, packages page and contact form.",
    reference_links: ["https://example.com/inspiration"],
    attachment_path: "",
    client_timezone: "America/New_York",
    start_time_utc: start.toISOString(),
    end_time_utc: new Date(start.getTime() + 30 * 60_000).toISOString(),
    status: "confirmed",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    admin_notes: "",
    manage_token_hash: "",
    reminder_sent_at: null,
    cancelled_at: null,
    cancelled_by: null,
    created_at: "",
    updated_at: "",
  };
  return bookingVars(fake, { manageToken: "sample-token" });
}

/**
 * Renders and sends one booking email. Client templates go to the client,
 * admin templates to the notify/admin email. Returns the send result; never throws.
 */
export async function sendBookingEmail(
  type: EmailTemplateType,
  booking: BookingRow,
  opts: { manageToken?: string } = {},
): Promise<SendResult> {
  const { data: tpl } = await supabaseAdmin().from("email_templates").select("*").eq("type", type).maybeSingle();
  if (!tpl) {
    console.error(`[email] template "${type}" missing`);
    return { sent: false, reason: "template-missing" };
  }

  const to = CLIENT_TYPES.includes(type) ? booking.email : await getAdminNotifyEmail();
  if (!to) {
    console.warn(`[email] no recipient for "${type}"`);
    return { sent: false, reason: "no-recipient" };
  }

  const vars = await bookingVars(booking, opts);
  const rendered = renderTemplate(tpl, vars);

  const includeIcs = booking.status === "confirmed" && type !== "cancelled_client" && type !== "cancelled_admin";
  const { ownerName } = await getSiteBasics();
  return sendEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    attachments: includeIcs
      ? [
          {
            filename: `meeting-${booking.reference_code}.ics`,
            content: icsForBooking(booking, {
              summary: `Meeting with ${ownerName}`,
              description: `Booking ${booking.reference_code}. Join: ${booking.meeting_link || "link in confirmation email"}`,
              location: booking.meeting_link || "Online",
            }),
            contentType: "text/calendar",
          },
        ]
      : undefined,
  });
}
