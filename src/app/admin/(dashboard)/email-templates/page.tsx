import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { PageHeader } from "@/components/admin/page-header";
import { Panel } from "@/components/admin/panel";
import { cn } from "@/lib/utils";
import type { EmailTemplateType } from "@/types/database";
import { TemplateEditor } from "./template-editor";

export const metadata: Metadata = { title: "Email Templates" };

export const TEMPLATE_LABELS: Record<EmailTemplateType, { label: string; description: string }> = {
  booking_received_client: { label: "Booking received", description: "Sent to the client after they book (when auto-confirm is off)." },
  booking_confirmed_client: { label: "Booking confirmed", description: "Sent to the client on confirmation — includes the .ics invite." },
  booking_admin_notification: { label: "New booking (you)", description: "Sent to you when a booking arrives." },
  reminder_client: { label: "Reminder", description: "Sent to the client the day before a confirmed meeting." },
  cancelled_client: { label: "Cancellation (client)", description: "Sent to the client when a booking is cancelled." },
  cancelled_admin: { label: "Cancellation (you)", description: "Sent to you when the client cancels." },
  rescheduled_client: { label: "Rescheduled (client)", description: "Sent to the client with the new time." },
  rescheduled_admin: { label: "Rescheduled (you)", description: "Sent to you when the client reschedules." },
};

export default async function EmailTemplatesPage({ searchParams }: PageProps<"/admin/email-templates">) {
  const { supabase } = await requireAdmin();
  const { tpl } = await searchParams;
  const { data: templates } = await supabase.from("email_templates").select("*");

  const selected = templates?.find((t) => t.type === tpl) ?? templates?.find((t) => t.type === "booking_received_client") ?? templates?.[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Email Templates" description="Every booking email is a template with {{variables}}. Edit them here — the preview fills in sample data." />
      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        <Panel className="h-fit divide-y divide-admin-border overflow-hidden">
          {(templates ?? [])
            .slice()
            .sort((a, b) => Object.keys(TEMPLATE_LABELS).indexOf(a.type) - Object.keys(TEMPLATE_LABELS).indexOf(b.type))
            .map((t) => (
              <Link
                key={t.id}
                href={`/admin/email-templates?tpl=${t.type}`}
                className={cn(
                  "block px-4 py-3 text-sm transition-colors hover:bg-black/[0.03]",
                  selected?.id === t.id && "bg-black/[0.05] font-medium",
                )}
              >
                {TEMPLATE_LABELS[t.type]?.label ?? t.type}
                <span className="block text-xs font-normal text-admin-muted">{TEMPLATE_LABELS[t.type]?.description}</span>
              </Link>
            ))}
        </Panel>
        {selected ? (
          <TemplateEditor key={`${selected.id}-${selected.updated_at}`} template={selected} />
        ) : (
          <p className="text-sm text-admin-danger">No email templates found. Re-run supabase/schema.sql.</p>
        )}
      </div>
    </div>
  );
}
