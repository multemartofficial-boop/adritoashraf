import { z } from "zod";
import { fdBool, fdString } from "@/lib/forms";

export const slugSchema = z
  .string()
  .min(2, "Required.")
  .max(120)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Lowercase letters, numbers and dashes only.",
  );

const optionalUrl = z.union([
  z.literal(""),
  z.url("Enter a valid URL.").max(2000),
]);

// datetime-local posts "YYYY-MM-DDTHH:mm" (local); store as ISO instant.
const optionalLocalDateTime = z
  .string()
  .max(40)
  .refine(
    (v) => v === "" || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v),
    "Invalid date.",
  )
  .transform((v) => (v ? new Date(v).toISOString() : null));

export const webinarFormSchema = z
  .object({
    title: z.string().trim().min(3, "Required.").max(160),
    slug: slugSchema,
    description: z.string().max(5000).default(""),
    thumbnail_url: optionalUrl,
    start_at: optionalLocalDateTime,
    end_at: optionalLocalDateTime,
    live_url: optionalUrl,
    recording_url: optionalUrl,
    published: z.boolean(),
  })
  .refine((w) => !w.start_at || !w.end_at || w.end_at > w.start_at, {
    path: ["end_at"],
    message: "End must be after the start.",
  });

export function parseWebinarForm(fd: FormData) {
  return webinarFormSchema.safeParse({
    title: fdString(fd, "title"),
    slug: fdString(fd, "slug"),
    description: fdString(fd, "description"),
    thumbnail_url: fdString(fd, "thumbnail_url"),
    start_at: fdString(fd, "start_at"),
    end_at: fdString(fd, "end_at"),
    live_url: fdString(fd, "live_url"),
    recording_url: fdString(fd, "recording_url"),
    published: fdBool(fd, "published"),
  });
}

export const emailListSchema = z
  .array(z.email().transform((v) => v.trim().toLowerCase()))
  .min(1, "Add at least one email.")
  .max(500);

/** Split a pasted/CSV blob of emails (comma, semicolon, newline separated). */
export function splitEmails(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s));
}

export const resourceTitleSchema = z
  .string()
  .trim()
  .min(1, "Required.")
  .max(160);
export const resourceUrlSchema = z.union([
  z.url("Enter a valid URL.").max(2000),
  z.string().regex(/^webinars\/[\w-]+\/[\w.-]+$/, "Invalid file."),
]);
