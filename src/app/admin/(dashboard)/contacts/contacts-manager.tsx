"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Inbox, Loader2, Plus, Search, Trash2, UserPen, Users } from "lucide-react";
import type { ContactRow, ContactSource } from "@/types/database";
import { parseContact } from "@/lib/validators/contact";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Field, errProps } from "@/components/admin/form/field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { createContactAction, deleteContactAction, updateContactAction } from "./actions";

export type ContactListItem = ContactRow & { page_name: string };
type Filters = { source: string; q: string };

const SOURCE_META: Record<ContactSource, { label: string; tone: "success" | "warning"; icon: typeof Inbox }> = {
  form: { label: "Form", tone: "success", icon: Inbox },
  manual: { label: "Manual", tone: "warning", icon: UserPen },
};

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

function SourceBadge({ source }: { source: ContactSource }) {
  const m = SOURCE_META[source];
  const Icon = m.icon;
  return (
    <Badge tone={m.tone}>
      <Icon className="size-3" /> {m.label}
    </Badge>
  );
}

function toCsv(items: ContactListItem[]) {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Name", "Email", "Phone", "Source", "Page", "UTM source", "UTM medium", "UTM campaign", "Notes", "Created"];
  const rows = items.map((c) => [c.name, c.email, c.phone, c.source, c.page_name, c.utm_source, c.utm_medium, c.utm_campaign, c.notes, c.created_at]);
  return "\uFEFF" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

export function ContactsManager({ items, filters }: { items: ContactListItem[]; filters: Filters }) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(filters.q);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = items.find((c) => c.id === openId) ?? null;

  const setFilter = (patch: Partial<Filters>) => {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => v && sp.set(k, v));
    router.push(`${pathname}${sp.size ? `?${sp}` : ""}`);
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(items)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `contacts-${new Date().toISOString().slice(0, 10)}.csv`;
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
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or phone…" className="pl-9" aria-label="Search contacts" />
        </form>
        <div className="grid grid-cols-3 gap-2 md:flex">
          <Select value={filters.source} onChange={(e) => setFilter({ source: e.target.value })} aria-label="Source" className="md:w-40">
            <option value="">All sources</option>
            <option value="form">Form</option>
            <option value="manual">Manual</option>
          </Select>
          <Button variant="outline" onClick={exportCsv} disabled={items.length === 0}>
            <Download /> CSV
          </Button>
          <Button onClick={() => setAdding(true)}>
            <Plus /> Add contact
          </Button>
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        {items.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contacts yet"
            description="Form signups from your gift pages appear here automatically. You can also add people by hand."
            action={
              <Button onClick={() => setAdding(true)}>
                <Plus /> Add contact
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/[0.02] text-left text-xs text-admin-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">Contact</th>
                  <th className="px-4 py-2.5 font-medium">Source</th>
                  <th className="hidden px-4 py-2.5 font-medium md:table-cell">Page / campaign</th>
                  <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {items.map((c) => (
                  <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer transition-colors hover:bg-black/[0.02]">
                    <td className="px-4 py-3">
                      <span className="block truncate font-medium">{c.name || "—"}</span>
                      <span className="block truncate text-xs text-admin-muted">{c.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={c.source} />
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="block truncate">{c.page_name || "—"}</span>
                      {c.utm_source && <span className="block truncate text-xs text-admin-muted">via {c.utm_source}</span>}
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap text-xs text-admin-muted lg:table-cell">{fmtDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="border-t border-admin-border px-4 py-2 text-xs text-admin-muted">
          {items.length} contact{items.length === 1 ? "" : "s"}
        </p>
      </Panel>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent title="Add contact" description="Added by hand — it will be marked as Manual.">
          <ContactForm onDone={() => setAdding(false)} />
        </DialogContent>
      </Dialog>

      <Sheet open={!!open} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" title="Contact details" className="w-full max-w-xl overflow-y-auto sm:w-[30rem]">
          {open && <ContactDetail key={open.id} contact={open} onClose={() => setOpenId(null)} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

function ContactForm({ contact, onDone }: { contact?: ContactListItem; onDone: () => void }) {
  const router = useRouter();
  const action = contact ? updateContactAction.bind(null, contact.id) : createContactAction;
  const { formAction, onSubmit, pending, errors, state } = useAdminForm(action, parseContact);

  useEffect(() => {
    if (state.savedAt) {
      router.refresh();
      onDone();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react only to a new save
  }, [state.savedAt]);

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-4">
      <Field label="Name" htmlFor="name" error={errors.name}>
        <Input {...errProps("name", errors.name)} defaultValue={contact?.name} placeholder="Full name" autoComplete="off" />
      </Field>
      <Field label="Email" htmlFor="email" error={errors.email}>
        <Input {...errProps("email", errors.email)} type="email" defaultValue={contact?.email} placeholder="name@example.com" autoComplete="off" />
      </Field>
      <Field label="Phone / WhatsApp" htmlFor="phone" error={errors.phone}>
        <Input {...errProps("phone", errors.phone)} defaultValue={contact?.phone} placeholder="+880 …" autoComplete="off" />
      </Field>
      <Field label="Notes" htmlFor="notes" error={errors.notes} hint="Only you can see these.">
        <Textarea {...errProps("notes", errors.notes)} defaultValue={contact?.notes} rows={4} placeholder="Where you met, what they need, next steps…" />
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} {contact ? "Save" : "Add contact"}
        </Button>
      </div>
    </form>
  );
}

function ContactDetail({ contact: c, onClose }: { contact: ContactListItem; onClose: () => void }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-admin-border p-5 pr-14">
        <div className="flex items-center gap-2">
          <SourceBadge source={c.source} />
          <span className="text-xs text-admin-muted">{c.source === "form" ? "Submitted a signup form" : "Added manually"}</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold">{c.name || c.email}</h2>
        <p className="text-sm text-admin-muted">Added {fmtDate(c.created_at)}</p>
      </div>

      <div className="flex-1 space-y-6 p-5">
        {editing ? (
          <ContactForm contact={c} onDone={() => setEditing(false)} />
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Item label="Email">
                <a href={`mailto:${c.email}`} className="text-admin-info hover:underline">
                  {c.email}
                </a>
              </Item>
              <Item label="Phone / WhatsApp">{c.phone || "—"}</Item>
              {c.source === "form" && (
                <>
                  <Item label="Gift page">{c.page_name || "—"}</Item>
                  <Item label="Campaign">
                    {[c.utm_source, c.utm_medium, c.utm_campaign].filter(Boolean).join(" / ") || "Direct"}
                  </Item>
                </>
              )}
            </dl>
            <div>
              <p className="text-xs font-medium text-admin-muted">Private notes</p>
              <p className="mt-1 text-sm whitespace-pre-wrap">{c.notes || <span className="text-admin-muted">No notes yet.</span>}</p>
            </div>
            <div className="flex items-center justify-between border-t border-admin-border pt-5">
              <ConfirmButton
                title="Delete this contact?"
                description="The contact is removed permanently."
                onConfirm={async () => {
                  const r = await deleteContactAction(c.id);
                  if (r.ok) {
                    toast.success("Contact deleted.");
                    onClose();
                    router.refresh();
                  } else toast.error(r.error ?? "Failed.");
                }}
              >
                <Button variant="ghost" size="sm" className="text-admin-danger">
                  <Trash2 /> Delete
                </Button>
              </ConfirmButton>
              <Button variant="outline" onClick={() => setEditing(true)}>
                Edit
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Item({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-admin-muted">{label}</dt>
      <dd className="truncate">{children}</dd>
    </div>
  );
}
