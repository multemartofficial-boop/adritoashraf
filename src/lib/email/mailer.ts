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

/** True when real SMTP credentials exist (EMAIL_TRANSPORT=log also counts as "sends"). */
export function emailConfigured(): boolean {
  const env = serverEnv();
  return env.EMAIL_TRANSPORT === "log" || Boolean(env.SMTP_HOST && env.EMAIL_FROM);
}

/**
 * Sends one email. Never throws: failures are reported so booking flows can
 * continue when mail is down.
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
