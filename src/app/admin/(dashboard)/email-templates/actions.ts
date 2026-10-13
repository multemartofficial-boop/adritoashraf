"use server";

import { revalidatePath } from "next/cache";
import { runAdmin, runAdminForm } from "@/lib/admin/run";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { emailTemplateSchema, parseEmailTemplateForm } from "@/lib/validators/booking";
import { idSchema } from "@/lib/validators/content";
import { sampleTemplateVars } from "@/lib/email/booking-emails";
import { sendEmail, emailConfigured } from "@/lib/email/mailer";
import { renderTemplate } from "@/lib/email/render";

const refresh = () => revalidatePath("/admin/email-templates");

export async function saveEmailTemplateAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { error: "Invalid template." };
    const parsed = parseEmailTemplateForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    const { error } = await supabase.from("email_templates").update(parsed.data).eq("id", id);
    if (error) return { error: "Could not save the template." };
    refresh();
    return { success: "Template saved.", savedAt: Date.now() };
  });
}

export type PreviewResult = ActionResult & { subject?: string; html?: string; text?: string };

/** Renders the draft (unsaved) fields with sample data for the live preview. */
export async function previewEmailTemplateAction(input: unknown): Promise<PreviewResult> {
  return runAdmin(async () => {
    const parsed = emailTemplateSchema.safeParse(input);
    if (!parsed.success) return { ok: false, error: "Invalid template." };
    const rendered = renderTemplate(parsed.data, await sampleTemplateVars());
    return { ok: true, ...rendered };
  });
}

/** Sends the saved template to the logged-in admin's own inbox. */
export async function sendTestEmailAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase, email }) => {
    if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid template." };
    const { data: tpl } = await supabase.from("email_templates").select("subject, body_html, body_text").eq("id", id).maybeSingle();
    if (!tpl) return { ok: false, error: "Template not found." };
    if (!emailConfigured()) {
      return { ok: false, error: "Email is not configured yet (no SMTP and EMAIL_TRANSPORT≠log)." };
    }

    const rendered = renderTemplate(tpl, await sampleTemplateVars());
    const r = await sendEmail({
      to: email,
      subject: `[TEST] ${rendered.subject}`,
      html: rendered.html,
      text: rendered.text,
    });
    if (!r.sent) return { ok: false, error: `Send failed (${r.reason}).` };
    return { ok: true };
  });
}
