import { z } from "zod";
import { fdJson, fdString } from "@/lib/forms";
import { isValidTimeZone } from "@/lib/time";

export const PROJECT_TYPES = [
  { value: "website", label: "Website" },
  { value: "saas", label: "SaaS product" },
  { value: "erp", label: "ERP / business software" },
  { value: "hr", label: "HR system" },
  { value: "other", label: "Something else" },
] as const;

export const BUDGET_RANGES = [
  "Under $300",
  "$300 - $1,000",
  "$1,000 - $3,000",
  "$3,000 - $10,000",
  "$10,000+",
  "Not sure yet",
] as const;

export const TIMELINES = ["As soon as possible", "Within 1 month", "1 - 3 months", "3 - 6 months", "Flexible"] as const;

const optionalEnum = <T extends readonly string[]>(values: T) => z.union([z.literal(""), z.enum(values)]);

export const bookingIntakeSchema = z.object({
  client_name: z.string().trim().min(1, "Your name is required.").max(80, "Keep it under 80 characters."),
  email: z.email("Enter a valid email address.").max(120),
  phone: z.string().trim().max(30, "Keep it under 30 characters.").default(""),
  service_id: z.union([z.literal(""), z.uuid()]).default(""),
  project_type: z.enum(PROJECT_TYPES.map((t) => t.value) as [string, ...string[]], {
    error: "Pick a project type.",
  }),
  budget_range: optionalEnum(BUDGET_RANGES).default(""),
  timeline_needed: optionalEnum(TIMELINES).default(""),
  project_description: z
    .string()
    .trim()
    .min(20, "Tell me a little more (at least 20 characters).")
    .max(3000, "Keep it under 3000 characters."),
  reference_links: z
    .array(z.url({ protocol: /^https?$/, error: "Links must start with https://" }))
    .max(5, "Up to 5 links.")
    .default([]),
  start_time_utc: z.string().refine((v) => Number.isFinite(Date.parse(v)), "Pick a time slot."),
  client_timezone: z.string().refine(isValidTimeZone, "Invalid timezone."),
});

export type BookingIntakeInput = z.infer<typeof bookingIntakeSchema>;

// ---------------------------------------------------------------------------
// Admin: booking updates
// ---------------------------------------------------------------------------
const meetingLink = z.union([z.literal(""), z.url({ protocol: /^https$/, error: "Meeting link must start with https://" })]);

export const bookingAdminUpdateSchema = z.object({
  meeting_link: meetingLink,
  admin_notes: z.string().trim().max(5000, "Keep notes under 5000 characters."),
});
export const parseBookingAdminUpdate = (fd: FormData) =>
  bookingAdminUpdateSchema.safeParse({ meeting_link: fdString(fd, "meeting_link").trim(), admin_notes: fdString(fd, "admin_notes") });

export const bookingStatusActionSchema = z.enum(["confirm", "cancel", "complete"]);

// ---------------------------------------------------------------------------
// Admin: availability + booking settings
// ---------------------------------------------------------------------------
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h).");

export const availabilityWindowSchema = z
  .object({ weekday: z.number().int().min(0).max(6), start_time: hhmm, end_time: hhmm })
  .refine((w) => w.start_time < w.end_time, { message: "End must be after start.", path: ["end_time"] });

export const availabilitySchema = z.object({
  windows: z.array(availabilityWindowSchema).max(42, "Too many windows."),
});
export const parseAvailabilityForm = (fd: FormData) => {
  const raw = fdJson(fd, "windows");
  return availabilitySchema.safeParse({ windows: Array.isArray(raw) ? raw : [] });
};

export const bookingSettingsSchema = z.object({
  slot_duration_minutes: z.coerce.number().int().min(10, "At least 10 minutes.").max(240, "At most 240 minutes."),
  buffer_minutes: z.coerce.number().int().min(0).max(240, "At most 240 minutes."),
  max_bookings_per_day: z.coerce.number().int().min(1, "At least 1.").max(50, "At most 50."),
  min_notice_hours: z.coerce.number().int().min(0).max(720, "At most 720 hours (30 days)."),
  max_days_ahead: z.coerce.number().int().min(1, "At least 1 day.").max(365, "At most 365 days."),
  cancel_notice_hours: z.coerce.number().int().min(0).max(720, "At most 720 hours."),
  timezone: z.string().refine(isValidTimeZone, "Invalid timezone."),
  meeting_link_default: meetingLink,
  auto_confirm: z.boolean(),
});
export type BookingSettingsInput = z.infer<typeof bookingSettingsSchema>;

export const parseBookingSettingsForm = (fd: FormData) =>
  bookingSettingsSchema.safeParse({
    slot_duration_minutes: fdString(fd, "slot_duration_minutes"),
    buffer_minutes: fdString(fd, "buffer_minutes") || "0",
    max_bookings_per_day: fdString(fd, "max_bookings_per_day"),
    min_notice_hours: fdString(fd, "min_notice_hours") || "0",
    max_days_ahead: fdString(fd, "max_days_ahead"),
    cancel_notice_hours: fdString(fd, "cancel_notice_hours") || "0",
    timezone: fdString(fd, "timezone"),
    meeting_link_default: fdString(fd, "meeting_link_default").trim(),
    auto_confirm: fd.get("auto_confirm") === "on" || fd.get("auto_confirm") === "true",
  });

// ---------------------------------------------------------------------------
// Admin: blocked dates + email templates
// ---------------------------------------------------------------------------
export const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date."),
  reason: z.string().trim().max(120, "Keep it under 120 characters."),
});
export const parseBlockedDateForm = (fd: FormData) =>
  blockedDateSchema.safeParse({ date: fdString(fd, "date"), reason: fdString(fd, "reason") });

export const emailTemplateSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required.").max(200, "Keep it under 200 characters."),
  body_html: z.string().trim().min(1, "HTML body is required.").max(20000, "Keep it under 20000 characters."),
  body_text: z.string().trim().min(1, "Text body is required.").max(20000, "Keep it under 20000 characters."),
});
export const parseEmailTemplateForm = (fd: FormData) =>
  emailTemplateSchema.safeParse({
    subject: fdString(fd, "subject"),
    body_html: fdString(fd, "body_html"),
    body_text: fdString(fd, "body_text"),
  });

export const EMAIL_TEMPLATE_VARS = [
  ["client_name", "Client's name"],
  ["client_email", "Client's email"],
  ["client_phone", "Phone / WhatsApp"],
  ["reference_code", "Booking code, e.g. ADR-7K2P9Q"],
  ["service", "Chosen service"],
  ["project_type", "Project type"],
  ["budget_range", "Budget range"],
  ["timeline_needed", "When they need it"],
  ["project_description", "Project description"],
  ["reference_links", "Reference links (one per line)"],
  ["date_client", "Meeting date in the client's timezone"],
  ["time_client", "Meeting time in the client's timezone"],
  ["client_timezone", "Client's timezone"],
  ["date_admin", "Meeting date in your timezone"],
  ["time_admin", "Meeting time in your timezone"],
  ["admin_timezone", "Your timezone"],
  ["meeting_link", "Google Meet link"],
  ["manage_link", "Client's private manage link"],
  ["owner_name", "Your name"],
  ["site_url", "Website URL"],
] as const;

export const parseBookingIntake = (fd: FormData) =>
  bookingIntakeSchema.safeParse({
    client_name: fdString(fd, "client_name"),
    email: fdString(fd, "email").trim(),
    phone: fdString(fd, "phone"),
    service_id: fdString(fd, "service_id"),
    project_type: fdString(fd, "project_type"),
    budget_range: fdString(fd, "budget_range"),
    timeline_needed: fdString(fd, "timeline_needed"),
    project_description: fdString(fd, "project_description"),
    reference_links: Array.isArray(fdJson(fd, "reference_links")) ? fdJson(fd, "reference_links") : [],
    start_time_utc: fdString(fd, "start_time_utc"),
    client_timezone: fdString(fd, "client_timezone") || "Asia/Dhaka",
  });
