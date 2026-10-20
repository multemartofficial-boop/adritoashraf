import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { serverEnv } from "@/lib/env/server";

export type OutboundEmail = {
  to: string;
  subject: string;
  html: string;
  text: string;
  attachments?: { filename: string; content: string; contentType?: string }[];
};

export type SendResult = { sent: true } | { sent: false; reason: string };

let transporter: Transporter | undefined;

function smtp(): Transporter {
  if (transporter) return transporter;
  const env = serverEnv();
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

/** True when any real transport exists (EMAIL_TRANSPORT=log also counts as "sends"). */
export function emailConfigured(): boolean {
  const env = serverEnv();
  return (
    env.EMAIL_TRANSPORT === "log" ||
    Boolean(env.EMAIL_FROM && (env.RESEND_API_KEY || env.SMTP_HOST))
  );
}

/** Sends through the Resend HTTP API (no SMTP server needed — works on Vercel). */
async function sendViaResend(mail: OutboundEmail): Promise<SendResult> {
  const env = serverEnv();
  if (!env.EMAIL_FROM) return { sent: false, reason: "email-from-missing" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: mail.to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        attachments: mail.attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content).toString("base64"),
        })),
      }),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 400);
      console.error(`[email] resend failed (${res.status}): "${mail.subject}" -> ${mail.to} :: ${detail}`);
      return { sent: false, reason: `resend-${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error(`[email] resend error: "${mail.subject}" -> ${mail.to}`, err);
    return { sent: false, reason: "send-failed" };
  }
}

/**
 * Sends one email. Never throws: failures are reported so booking flows can
 * continue when mail is down. Transport order: explicit EMAIL_TRANSPORT, then
 * "auto" = Resend when RESEND_API_KEY is set, otherwise SMTP.
 */
export async function sendEmail(mail: OutboundEmail): Promise<SendResult> {
  const env = serverEnv();
  if (env.EMAIL_TRANSPORT === "log") {
    console.log(
      `\n[email:log] ────────────────────────────────\nTo: ${mail.to}\nSubject: ${mail.subject}\n` +
        (mail.attachments?.length ? `Attachments: ${mail.attachments.map((a) => a.filename).join(", ")}\n` : "") +
        `${mail.text}\n[email:log] ────────────────────────────────\n`,
    );
    return { sent: true };
  }
  const useResend =
    env.EMAIL_TRANSPORT === "resend" ||
    (env.EMAIL_TRANSPORT === "auto" && Boolean(env.RESEND_API_KEY));
  if (useResend) return sendViaResend(mail);
  if (!env.SMTP_HOST || !env.EMAIL_FROM) {
    console.warn(`[email] skipped (SMTP not configured): "${mail.subject}" -> ${mail.to}`);
    return { sent: false, reason: "smtp-not-configured" };
  }
  try {
    await smtp().sendMail({
      from: env.EMAIL_FROM,
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.attachments,
    });
    return { sent: true };
  } catch (err) {
    console.error(`[email] send failed: "${mail.subject}" -> ${mail.to}`, err);
    return { sent: false, reason: "send-failed" };
  }
}
