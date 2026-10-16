"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { Check, ClipboardCopy, FileUp, Loader2, Search, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { grantAccessAction, revokeAccessAction } from "../actions";
import { splitEmails } from "@/lib/validators/webinar";
import { WEBINAR_TZ } from "@/lib/webinar-shared";
import { fmtLongDate, fmtTime } from "@/lib/booking/format";
import { Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ProfileRow, WebinarAccessRow } from "@/types/database";

type AccessRow = WebinarAccessRow & { name: string };

export function AccessManager({
  webinarId,
  webinarTitle,
  startAt,
  access,
  profiles,
}: {
  webinarId: string;
  webinarTitle: string;
  startAt: string | null;
  access: AccessRow[];
  profiles: ProfileRow[];
}) {
  const [rows, setRows] = useState(access);
  const [source, setSource] = useState(access);
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [pasted, setPasted] = useState("");
  const [pending, startTransition] = useTransition();
  const [revoking, setRevoking] = useState<string | null>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  // Accept fresh server data after revalidation.
  if (source !== access) {
    setSource(access);
    setRows(access);
  }

  const grantedEmails = useMemo(() => new Set(rows.map((r) => r.email)), [rows]);
  const grantable = useMemo(
    () => profiles.filter((p) => !grantedEmails.has(p.email)),
    [profiles, grantedEmails],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return grantable;
    return grantable.filter((p) => p.email.includes(q) || p.full_name.toLowerCase().includes(q));
  }, [grantable, query]);

  const pastedEmails = useMemo(() => splitEmails(pasted).filter((e) => !grantedEmails.has(e)), [pasted, grantedEmails]);

  const toggle = (email: string) => {
    setChecked((cur) => {
      const next = new Set(cur);
      if (next.has(email)) next.delete(email);
      else next.add(email);
      return next;
    });
  };

  const grant = (emails: string[]) => {
    if (!emails.length) return;
    startTransition(async () => {
      const res = await grantAccessAction(webinarId, emails);
      if (!res.ok) {
        toast.error(res.error ?? "Could not grant access.");
        return;
      }
      const now = new Date().toISOString();
      setRows((cur) => [
        ...emails.map((email, i) => ({
          id: `optimistic-${i}-${email}`,
          webinar_id: webinarId,
          email,
          user_id: profiles.find((p) => p.email === email)?.id ?? null,
          granted_at: now,
          granted_by: null,
          name: profiles.find((p) => p.email === email)?.full_name ?? "",
        })),
        ...cur,
      ]);
      setChecked(new Set());
      setPasted("");
      toast.success(`Granted to ${res.added ?? emails.length} email${(res.added ?? emails.length) === 1 ? "" : "s"}${res.skipped ? ` (${res.skipped} already had access)` : ""}.`);
    });
  };

  const revoke = async (row: AccessRow) => {
    if (!confirm(`Revoke access for ${row.email}?`)) return;
    setRevoking(row.id);
    const res = await revokeAccessAction(row.id);
    setRevoking(null);
    if (!res.ok) return toast.error(res.error ?? "Could not revoke.");
    setRows((cur) => cur.filter((r) => r.id !== row.id));
    toast.success("Access revoked");
  };

  const copyInvite = async () => {
    const when = startAt ? ` on ${fmtLongDate(startAt, WEBINAR_TZ)} at ${fmtTime(startAt, WEBINAR_TZ)} (GMT+6)` : "";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://adritoashraf.com";
    const msg = `You're invited to my free webinar "${webinarTitle}"${when}.

Create your free account to watch: ${origin}/signup
(Use this same email — your access is already approved, it just needs an account.)

See you there!`;
    try {
      await navigator.clipboard.writeText(msg);
      toast.success("Invite message copied — paste it into email or WhatsApp.");
    } catch {
      toast.error("Could not copy — select and copy manually.");
    }
  };

  return (
    <Panel className="flex flex-col p-5 md:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Access</h2>
          <p className="mt-0.5 text-xs text-admin-muted">
            {rows.length} with access · grant by email — signup links itself automatically.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={copyInvite}>
          <ClipboardCopy /> Copy invite message
        </Button>
      </div>

      {/* Registered members picker */}
      <div className="rounded-xl border border-admin-border">
        <div className="flex items-center gap-2 border-b border-admin-border px-3 py-2">
          <Search className="size-3.5 shrink-0 text-admin-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search members…"
            aria-label="Search members"
            className="w-full bg-transparent text-sm outline-none placeholder:text-admin-muted"
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-admin-muted">
            <input
              type="checkbox"
              className="accent-admin-text"
              checked={filtered.length > 0 && filtered.every((p) => checked.has(p.email))}
              onChange={(e) =>
                setChecked(e.target.checked ? new Set(filtered.map((p) => p.email)) : new Set())
              }
            />
            All
          </label>
        </div>
        <ul className="max-h-44 overflow-y-auto">
          {filtered.length === 0 ? (
            <li className="px-3 py-4 text-center text-xs text-admin-muted">
              {grantable.length ? "No matches." : "Every registered member already has access."}
            </li>
          ) : (
            filtered.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-black/[0.03]">
                  <input
                    type="checkbox"
                    className="accent-admin-text"
                    checked={checked.has(p.email)}
                    onChange={() => toggle(p.email)}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{p.full_name || "—"}</span>{" "}
                    <span className="text-admin-muted">{p.email}</span>
                  </span>
                </label>
              </li>
            ))
          )}
        </ul>
        <div className="flex items-center justify-between gap-2 border-t border-admin-border px-3 py-2">
          <span className="text-xs text-admin-muted">{checked.size} selected</span>
          <Button size="sm" disabled={pending || checked.size === 0} onClick={() => grant([...checked])}>
            {pending ? <Loader2 className="animate-spin" /> : <UserPlus />} Grant selected
          </Button>
        </div>
      </div>

      {/* Paste / CSV emails */}
      <div className="mt-4 space-y-2">
        <label htmlFor="emails" className="block text-xs font-medium text-admin-muted">
          Paste emails (comma or newline separated) — works for people who haven&rsquo;t signed up yet
        </label>
        <Textarea
          id="emails"
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={3}
          placeholder={"jane@example.com\nrahim@example.com, karim@example.com"}
        />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => csvRef.current?.click()}>
              <FileUp /> Import CSV
            </Button>
            <input
              ref={csvRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              className="sr-only"
              aria-label="Import CSV of emails"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  const text = await f.text();
                  setPasted((cur) => `${cur}${cur.trim() ? "\n" : ""}${text}`);
                }
                e.target.value = "";
              }}
            />
            <span className="text-xs text-admin-muted">{pastedEmails.length} valid</span>
          </div>
          <Button size="sm" disabled={pending || pastedEmails.length === 0} onClick={() => grant(pastedEmails)}>
            {pending ? <Loader2 className="animate-spin" /> : <UserPlus />} Grant {pastedEmails.length || ""}
          </Button>
        </div>
      </div>

      {/* Access table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-admin-border">
        <div className="flex items-center justify-between border-b border-admin-border bg-black/[0.02] px-3 py-2 text-xs font-medium text-admin-muted">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" /> Everyone with access
          </span>
          <span>
            {rows.filter((r) => r.user_id).length} signed up · {rows.filter((r) => !r.user_id).length} pending
          </span>
        </div>
        {rows.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-admin-muted">Nobody yet — grant access above.</p>
        ) : (
          <ul className="max-h-64 divide-y divide-admin-border overflow-y-auto">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-3 py-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                    r.user_id ? "bg-emerald-100 text-emerald-700" : "bg-black/[0.06] text-admin-muted",
                  )}
                >
                  {(r.name || r.email).charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{r.name || r.email}</span>
                  {r.name && <span className="block truncate text-xs text-admin-muted">{r.email}</span>}
                </span>
                <span className="hidden shrink-0 text-right sm:block">
                  <Badge tone={r.user_id ? "success" : "neutral"} dot>
                    {r.user_id ? "Account created" : "Not signed up"}
                  </Badge>
                  <span className="mt-0.5 block text-[10px] text-admin-muted">
                    {new Date(r.granted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => revoke(r)}
                  disabled={revoking === r.id}
                  aria-label={`Revoke access for ${r.email}`}
                  className="grid size-7 shrink-0 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-rose-50 hover:text-admin-danger disabled:opacity-50"
                >
                  {revoking === r.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {checked.size > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-admin-muted">
          <Check className="size-3" /> Selected members will appear in the table after granting.
        </p>
      )}
    </Panel>
  );
}
