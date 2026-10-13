import "server-only";
import type { EmailTemplateRow } from "@/types/database";

export type TemplateVars = Record<string, string>;

const escHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const VAR_RE = /\{\{\s*([a-z_]+)\s*\}\}/g;

/**
 * Substitutes {{variable}} placeholders. HTML bodies get HTML-escaped values
 * (newlines become <br>); subjects and text bodies get raw values.
 * Unknown variables become "".
 */
export function renderTemplate(
  tpl: Pick<EmailTemplateRow, "subject" | "body_html" | "body_text">,
  vars: TemplateVars,
): { subject: string; html: string; text: string } {
  const raw = (s: string) => s.replace(VAR_RE, (_, k: string) => vars[k] ?? "");
  const html = (s: string) => s.replace(VAR_RE, (_, k: string) => escHtml(vars[k] ?? "").replace(/\n/g, "<br>"));
  return {
    subject: raw(tpl.subject).trim(),
    html: wrapHtml(html(tpl.body_html)),
    text: raw(tpl.body_text).trim(),
  };
}

/** Light branded wrapper so every email looks consistent without editing templates. */
function wrapHtml(body: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;color:#1a1a22">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#ffffff;border-radius:16px;padding:28px;border:1px solid #e6e6ef">
    ${body}
  </div>
  <p style="font-size:12px;color:#8a8a99;text-align:center;margin-top:16px">Adrito Ashraf &middot; Full Stack Developer</p>
</div>
</body></html>`;
}
