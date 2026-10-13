"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CalendarCheck, Check, Download, Loader2, Paperclip, Search, Trash2, Video, X } from "lucide-react";
import type { BookingRow, BookingStatus } from "@/types/database";
import { fmtShortDate, fmtTime, fmtLongDate } from "@/lib/booking/format";
import { parseBookingAdminUpdate, PROJECT_TYPES } from "@/lib/validators/booking";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Field, errProps } from "@/components/admin/form/field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { deleteBookingAction, getAttachmentUrlAction, setBookingStatusAction, updateBookingDetailsAction } from "./actions";

export type BookingListItem = Pick<
  BookingRow,
  | "id"
  | "reference_code"
  | "client_name"
  | "email"
  | "phone"
  | "service_id"
  | "project_type"
  | "budget_range"
  | "timeline_needed"
  | "project_description"
  | "attachment_path"
  | "client_timezone"
  | "start_time_utc"
  | "end_time_utc"
  | "status"
  | "meeting_link"
  | "admin_notes"
  | "created_at"
  | "cancelled_by"
> & { reference_links: string[]; service_title: string };

type Filters = { status: string; range: string; service: string; q: string };

const STATUS_TONE: Record<BookingStatus, "warning" | "success" | "neutral" | "danger"> = {
  pending: "warning",
  confirmed: "success",
  completed: "neutral",
  cancelled: "danger",
};

const RANGE_OPTIONS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "today", label: "Today" },
  { value: "week", label: "Next 7 days" },
  { value: "past", label: "Past" },
  { value: "all", label: "All time" },
];

function toCsv(items: BookingListItem[], tz: string) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Reference", "Status", "Date (" + tz + ")", "Time (" + tz + ")", "Client", "Email", "Phone", "Service", "Project type", "Budget", "Timeline", "Client timezone", "Meeting link", "Description", "Links", "Notes", "Created"];
  const rows = items.map((b) => [
    b.reference_code,
    b.status,
    fmtShortDate(b.start_time_utc, tz),
    fmtTime(b.start_time_utc, tz),
    b.client_name,
    b.email,
    b.phone,
    b.service_title,
    b.project_type,
    b.budget_range,
    b.timeline_needed,
    b.client_timezone,
    b.meeting_link,
    b.project_description,
    b.reference_links.join(" "),
    b.admin_notes,
    b.created_at,
  ]);
  return "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

export function BookingsManager({
  items,
  services,
  timezone,
  filters,
}: {
  items: BookingListItem[];
  services: { id: string; title: string }[];
  timezone: string;
  filters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [openId, setOpenId] = useState<string | null>(null);
  const [q, setQ] = useState(filters.q);
  const open = items.find((b) => b.id === openId) ?? null;

  const setFilter = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && sp.set(k, v));
    router.push(`${pathname}${sp.size ? `?${sp}` : ""}`);
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(items, timezone)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <Panel className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:p-4">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            setFilter({ q });
          }}
        >
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-admin-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or reference…" className="pl-9" aria-label="Search bookings" />
        </form>
        <div className="grid grid-cols-2 gap-2 md:flex">
          <Select value={filters.status} onChange={(e) => setFilter({ status: e.target.value })} aria-label="Status" className="md:w-40">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
          <Select value={filters.range} onChange={(e) => setFilter({ range: e.target.value })} aria-label="Date range" className="md:w-40">
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <Select value={filters.service} onChange={(e) => setFilter({ service: e.target.value })} aria-label="Service" className="md:w-48">
            <option value="">All services</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={exportCsv} disabled={items.length === 0}>
            <Download /> CSV
          </Button>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {items.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No bookings match" description="Try a different status, date range or search." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/[0.02] text-left text-xs text-admin-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">When</th>
                  <th className="px-4 py-2.5 font-medium">Client</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Service</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Reference</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {items.map((b) => (
                  <tr key={b.id} onClick={() => setOpenId(b.id)} className="cursor-pointer transition-colors hover:bg-black/[0.02]">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="block font-medium">{fmtShortDate(b.start_time_utc, timezone)}</span>
                      <span className="text-xs text-admin-muted">{fmtTime(b.start_time_utc, timezone)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="block truncate font-medium">{b.client_name}</span>
                      <span className="block truncate text-xs text-admin-muted">{b.email}</span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">{b.service_title}</td>
                    <td className="hidden px-4 py-3 font-mono text-xs lg:table-cell">{b.reference_code}</td>
                    <td className="px-4 py-3">
                      <Badge tone={STATUS_TONE[b.status]} dot className="capitalize">
                        {b.status}
                      </Badge>
                      {b.attachment_path && <Paperclip className="ml-2 inline size-3.5 text-admin-muted" aria-label="Has attachment" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-admin-border px-4 py-2 text-xs text-admin-muted">{items.length} booking{items.length === 1 ? "" : "s"}</p>
      </Panel>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" title="Booking details" className="w-full max-w-xl sm:w-[34rem] overflow-y-auto">
          {open && <BookingDetail key={open.id} booking={open} timezone={timezone} onClose={() => setOpenId(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function BookingDetail({ booking: b, timezone, onClose }: { booking: BookingListItem; timezone: string; onClose: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const { formAction, onSubmit, pending: saving, errors } = useAdminForm(updateBookingDetailsAction.bind(null, b.id), parseBookingAdminUpdate);

  const run = (action: "confirm" | "cancel" | "complete") =>
    start(async () => {
      const r = await setBookingStatusAction(b.id, action);
      if (r.ok) {
        toast.success(action === "confirm" ? "Booking confirmed. Client emailed." : action === "cancel" ? "Booking cancelled. Client emailed." : "Marked as completed.");
        router.refresh();
      } else toast.error(r.error ?? "Failed.");
    });

  const openAttachment = () =>
    start(async () => {
      const r = await getAttachmentUrlAction(b.id);
      if (r.ok && r.url) window.open(r.url, "_blank", "noopener");
      else toast.error(r.error ?? "Could not open attachment.");
    });

  const active = b.status === "pending" || b.status === "confirmed";

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-admin-border p-5 pr-14">
        <div className="flex items-center gap-2">
          <Badge tone={STATUS_TONE[b.status]} dot className="capitalize">
            {b.status}
          </Badge>
          <span className="font-mono text-xs text-admin-muted">{b.reference_code}</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold">{b.client_name}</h2>
        <p className="text-sm text-admin-muted">
          {fmtLongDate(b.start_time_utc, timezone)} · {fmtTime(b.start_time_utc, timezone)} – {fmtTime(b.end_time_utc, timezone)}
        </p>
        {b.client_timezone !== timezone && (
          <p className="text-xs text-admin-muted">
            Client: {fmtTime(b.start_time_utc, b.client_timezone)} ({b.client_timezone})
          </p>
        )}
      </div>

      <div className="flex-1 space-y-6 p-5">
        {active && (
          <div className="flex flex-wrap gap-2">
            {b.status === "pending" && (
              <Button onClick={() => run("confirm")} disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <Check />} Confirm
              </Button>
            )}
            <Button variant="outline" onClick={() => run("complete")} disabled={pending}>
              Mark completed
            </Button>
            <ConfirmButton title="Cancel this meeting?" description="The client will receive a cancellation email and the slot opens up again." confirmLabel="Cancel meeting" onConfirm={() => run("cancel")}>
              <Button variant="outline" className="text-admin-danger">
                <X /> Cancel meeting
              </Button>
            </ConfirmButton>
          </div>
        )}
        {b.status === "cancelled" && <p className="text-xs text-admin-muted">Cancelled by {b.cancelled_by ?? "unknown"}.</p>}

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Item label="Email">
            <a href={`mailto:${b.email}`} className="text-admin-info hover:underline">
              {b.email}
            </a>
          </Item>
          <Item label="Phone / WhatsApp">{b.phone || "—"}</Item>
          <Item label="Service">{b.service_title}</Item>
          <Item label="Project type">{PROJECT_TYPES.find((t) => t.value === b.project_type)?.label ?? b.project_type}</Item>
          <Item label="Budget">{b.budget_range || "—"}</Item>
          <Item label="Needed by">{b.timeline_needed || "—"}</Item>
        </dl>

        <div>
          <p className="text-xs font-medium text-admin-muted">Project description</p>
          <p className="mt-1 text-sm whitespace-pre-wrap">{b.project_description}</p>
        </div>

        {b.reference_links.length > 0 && (
          <div>
            <p className="text-xs font-medium text-admin-muted">Reference links</p>
            <ul className="mt-1 space-y-1 text-sm">
              {b.reference_links.map((l) => (
                <li key={l}>
                  <a href={l} target="_blank" rel="noopener noreferrer" className="break-all text-admin-info hover:underline">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {b.attachment_path && (
          <Button variant="outline" size="sm" onClick={openAttachment} disabled={pending}>
            <Paperclip /> Open attachment
          </Button>
        )}

        <form action={formAction} onSubmit={onSubmit} className="space-y-4 border-t border-admin-border pt-5">
          <Field label="Google Meet link" htmlFor="meeting_link" error={errors.meeting_link} hint="Sent to the client with the confirmation. Leave empty to use the default from Availability.">
            <div className="flex gap-2">
              <Input {...errProps("meeting_link", errors.meeting_link)} defaultValue={b.meeting_link} placeholder="https://meet.google.com/…" />
              {b.meeting_link && (
                <Button variant="outline" size="icon" asChild aria-label="Open meeting link">
                  <a href={b.meeting_link} target="_blank" rel="noopener noreferrer">
                    <Video />
                  </a>
                </Button>
              )}
            </div>
          </Field>
          <Field label="Private notes" htmlFor="admin_notes" error={errors.admin_notes} hint="Only you can see these.">
            <Textarea {...errProps("admin_notes", errors.admin_notes)} defaultValue={b.admin_notes} rows={4} placeholder="Prep notes, call summary, next steps…" />
          </Field>
          <div className="flex items-center justify-between">
            {!active ? (
              <ConfirmButton title="Delete this booking?" description="This removes the record and any attachment permanently." onConfirm={async () => {
                const r = await deleteBookingAction(b.id);
                if (r.ok) {
                  toast.success("Booking deleted.");
                  onClose();
                  router.refresh();
                } else toast.error(r.error ?? "Failed.");
              }}>
                <Button variant="ghost" size="sm" className="text-admin-danger">
                  <Trash2 /> Delete
                </Button>
              </ConfirmButton>
            ) : (
              <span />
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="animate-spin" />} Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0")}>
      <dt className="text-xs font-medium text-admin-muted">{label}</dt>
      <dd className="truncate">{children}</dd>
    </div>
  );
}
