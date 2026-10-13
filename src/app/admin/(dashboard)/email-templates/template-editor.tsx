"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, MailCheck, Send } from "lucide-react";
import type { EmailTemplateRow } from "@/types/database";
import { parseEmailTemplateForm, EMAIL_TEMPLATE_VARS } from "@/lib/validators/booking";
import { Panel } from "@/components/admin/panel";
import { Field, errProps } from "@/components/admin/form/field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { previewEmailTemplateAction, saveEmailTemplateAction, sendTestEmailAction } from "./actions";

export function TemplateEditor({ template: t }: { template: EmailTemplateRow }) {
  const { formAction, onSubmit, pending, errors: e } = useAdminForm(saveEmailTemplateAction.bind(null, t.id), parseEmailTemplateForm);
  const [subject, setSubject] = useState(t.subject);
  const [bodyHtml, setBodyHtml] = useState(t.body_html);
  const [bodyText, setBodyText] = useState(t.body_text);
  const [preview, setPreview] = useState<{ subject: string; html: string } | null>(null);
  const [tab, setTab] = useState<"preview" | "text">("preview");
  const [textPreview, setTextPreview] = useState("");
  const [testing, startTest] = useTransition();
  const previewTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Debounced live preview rendered by the real server-side renderer.
  useEffect(() => {
    clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      const r = await previewEmailTemplateAction({ subject, body_html: bodyHtml, body_text: bodyText });
      if (r.ok) {
        setPreview({ subject: r.subject ?? "", html: r.html ?? "" });
        setTextPreview(r.text ?? "");
      }
    }, 350);
    return () => clearTimeout(previewTimer.current);
  }, [subject, bodyHtml, bodyText]);

  const sendTest = () =>
    startTest(async () => {
      const r = await sendTestEmailAction(t.id);
      if (r.ok) toast.success("Test email sent to your admin inbox (or logged to the server console).");
      else toast.error(r.error ?? "Could not send the test email.");
    });

  return (
    <div className="space-y-6">
      <form action={formAction} onSubmit={onSubmit} noValidate>
        <Panel className="space-y-4 p-5">
          <Field label="Subject" htmlFor="subject" error={e.subject}>
            <Input {...errProps("subject", e.subject)} value={subject} onChange={(ev) => setSubject(ev.target.value)} />
          </Field>
          <Field label="HTML body" htmlFor="body_html" error={e.body_html} hint="Basic HTML: <p>, <a>, <strong>, <br>. Wrapped in the branded layout automatically.">
            <Textarea {...errProps("body_html", e.body_html)} rows={10} value={bodyHtml} onChange={(ev) => setBodyHtml(ev.target.value)} className="font-mono text-xs" />
          </Field>
          <Field label="Plain-text body" htmlFor="body_text" error={e.body_text} hint="Fallback for email clients without HTML.">
            <Textarea {...errProps("body_text", e.body_text)} rows={6} value={bodyText} onChange={(ev) => setBodyText(ev.target.value)} className="font-mono text-xs" />
          </Field>
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={sendTest} disabled={testing}>
              {testing ? <Loader2 className="animate-spin" /> : <Send />} Send test to me
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <MailCheck />} Save template
            </Button>
          </div>
        </Panel>
      </form>

      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-admin-border px-4 py-2">
          <p className="truncate text-xs text-admin-muted">
            Subject preview: <span className="font-medium text-admin-text">{preview?.subject ?? "…"}</span>
          </p>
          <div className="flex gap-1">
            {(["preview", "text"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setTab(v)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs capitalize",
                  tab === v ? "bg-black/[0.06] font-medium" : "text-admin-muted hover:text-admin-text",
                )}
              >
                {v === "preview" ? "HTML preview" : "Plain text"}
              </button>
            ))}
          </div>
        </div>
        {tab === "preview" ? (
          <iframe
            title="Email preview"
            srcDoc={preview?.html ?? ""}
            sandbox=""
            className="h-96 w-full bg-[#f4f4f7]"
          />
        ) : (
          <pre className="h-96 overflow-auto p-4 font-mono text-xs whitespace-pre-wrap">{textPreview}</pre>
        )}
      </Panel>

      <Panel className="p-5">
        <h3 className="text-sm font-semibold">Available variables</h3>
        <p className="mt-0.5 text-xs text-admin-muted">Use as <code>{"{{client_name}}"}</code> in the subject or bodies. Unknown variables render as empty.</p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EMAIL_TEMPLATE_VARS.map(([name, desc]) => (
            <li key={name} className="flex items-center gap-2">
              <Badge tone="info" className="font-mono">{`{{${name}}}`}</Badge>
              <span className="text-xs text-admin-muted">{desc}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
