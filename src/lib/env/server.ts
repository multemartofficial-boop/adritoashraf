import "server-only";
import { z } from "zod";

const schema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  STORAGE_PUBLIC_BUCKET: z.string().min(1).default("site-media"),
  STORAGE_PRIVATE_BUCKET: z.string().min(1).default("booking-attachments"),
  CRON_SECRET: z.string().min(24, "CRON_SECRET must be at least 24 characters"),
  // Email is optional until SMTP is configured; bookings still work, emails are skipped.
  SMTP_HOST: z.string().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(465),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("true")
    .transform((v) => v === "true"),
  SMTP_USER: z.string().default(""),
  SMTP_PASS: z.string().default(""),
  EMAIL_FROM: z.string().default(""),
  // Resend HTTP API key — used automatically when set (or when EMAIL_TRANSPORT=resend).
  RESEND_API_KEY: z.string().default(""),
  ADMIN_NOTIFY_EMAIL: z.union([z.literal(""), z.email()]).default(""),
  // "log" prints emails to the server console instead of sending (dev/testing).
  // "auto" picks Resend when RESEND_API_KEY is set, otherwise SMTP.
  EMAIL_TRANSPORT: z.enum(["auto", "resend", "smtp", "log"]).default("auto"),
});

export type ServerEnv = z.infer<typeof schema>;

let cached: ServerEnv | undefined;

// Lazy so `next build` does not require runtime secrets; fails loudly on first use if misconfigured.
export function serverEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const keys = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid or missing server environment variables: ${keys}`);
  }
  cached = parsed.data;
  return cached;
}
