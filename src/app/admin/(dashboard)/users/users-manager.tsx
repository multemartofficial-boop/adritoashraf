"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronDown, Download, Loader2, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { setUserWebinarAccessAction } from "../webinars/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/empty-state";
import { cn } from "@/lib/utils";
import type { ProfileRow, WebinarAccessRow, WebinarRow } from "@/types/database";

const PAGE_SIZE = 25;
type WebinarLite = Pick<WebinarRow, "id" | "title" | "status">;
type Filter = "all" | "granted" | "none" | "admins";

export function UsersManager({
  profiles,
  access,
  webinars,
}: {
  profiles: ProfileRow[];
  access: WebinarAccessRow[];
  webinars: WebinarLite[];
}) {
  const [rows, setRows] = useState(access);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  // email -> webinar_ids granted
  const accessByEmail = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const a of rows) {
      const s = m.get(a.email) ?? new Set<string>();
      s.add(a.webinar_id);
      m.set(a.email, s);
    }
    return m;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles.filter((p) => {
      if (filter === "admins" && p.role !== "admin") return false;
      const granted = accessByEmail.get(p.email)?.size ?? 0;
      if (filter === "granted" && !granted) return false;
      if (filter === "none" && granted) return false;
      if (q && !p.email.includes(q) && !p.full_name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [profiles, accessByEmail, query, filter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleAccess = (webinarId: string, email: string, grant: boolean) => {
    const key = `${email}:${webinarId}`;
    const prev = rows;
    setRows(
      grant
        ? [...rows, { id: `optimistic-${key}`, webinar_id: webinarId, email, user_id: null, granted_at: new Date().toISOString(), granted_by: null }]
        : rows.filter((r) => !(r.webinar_id === webinarId && r.email === email)),
    );
    setBusyKey(key);
    startTransition(async () => {
      const res = await setUserWebinarAccessAction(webinarId, email, grant);
      setBusyKey(null);
      if (!res.ok) {
        setRows(prev);
        toast.error(res.error ?? "Could not update access.");
      }
    });
  };

  const exportCsv = () => {
    const webinarTitle = new Map(webinars.map((w) => [w.id, w.title]));
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      ["Name", "Email", "Role", "Joined", "Webinars"].join(","),
      ...filtered.map((p) =>
        [
          esc(p.full_name),
          esc(p.email),
          p.role,
          new Date(p.created_at).toISOString().slice(0, 10),
          esc(
            [...(accessByEmail.get(p.email) ?? [])]
              .map((id) => webinarTitle.get(id) ?? "—")
              .join(" | ") || "—",
          ),
        ].join(","),
      ),
    ];
    const blob = new Blob([lines.join("\r\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `members-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${filtered.length} member${filtered.length === 1 ? "" : "s"}.`);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-admin-border px-5 py-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-admin-muted" />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search name or email…"
            aria-label="Search members"
            className="pl-9"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as Filter);
            setPage(1);
          }}
          aria-label="Filter members"
          className="h-9 rounded-xl border border-admin-border bg-white px-3 text-sm"
        >
          <option value="all">All members</option>
          <option value="granted">Has webinar access</option>
          <option value="none">No access yet</option>
          <option value="admins">Admins</option>
        </select>
        <Button variant="outline" size="sm" onClick={exportCsv} disabled={!filtered.length}>
          <Download /> Export CSV
        </Button>
      </div>

      {slice.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="Members appear here after they sign up at /signup." />
      ) : (
        <ul className="divide-y divide-admin-border">
          {slice.map((p) => {
            const grantedIds = accessByEmail.get(p.email) ?? new Set<string>();
            const open = openId === p.id;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : p.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-black/[0.02]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet/10 text-xs font-bold text-violet">
                    {(p.full_name || p.email).charAt(0).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{p.full_name || "—"}</span>
                      {p.role === "admin" && (
                        <Badge tone="info" dot>
                          Admin
                        </Badge>
                      )}
                    </span>
                    <span className="block truncate text-xs text-admin-muted">
                      {p.email} · joined {new Date(p.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </span>
                  <span className="hidden shrink-0 text-xs text-admin-muted md:block">
                    {grantedIds.size ? `${grantedIds.size} webinar${grantedIds.size === 1 ? "" : "s"}` : "No access"}
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-admin-muted transition-transform", open && "rotate-180")} />
                </button>

                {open && (
                  <div className="border-t border-admin-border bg-black/[0.015] px-5 py-3">
                    <p className="mb-2 text-xs font-medium text-admin-muted">Toggle webinar access for {p.email}</p>
                    {webinars.length === 0 ? (
                      <p className="text-xs text-admin-muted">No webinars yet — create one first.</p>
                    ) : (
                      <ul className="grid gap-1.5 sm:grid-cols-2">
                        {webinars.map((w) => {
                          const granted = grantedIds.has(w.id);
                          const key = `${p.email}:${w.id}`;
                          return (
                            <li key={w.id}>
                              <label
                                className={cn(
                                  "flex cursor-pointer items-center gap-2.5 rounded-xl border border-admin-border bg-white px-3 py-2 text-sm",
                                  busyKey === key && "opacity-60",
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="accent-admin-text"
                                  checked={granted}
                                  disabled={pending && busyKey === key}
                                  onChange={(e) => toggleAccess(w.id, p.email, e.target.checked)}
                                />
                                <span className="min-w-0 flex-1 truncate">{w.title}</span>
                                {w.status === "draft" && (
                                  <Badge tone="neutral" className="shrink-0">
                                    Draft
                                  </Badge>
                                )}
                                {busyKey === key && <Loader2 className="size-3.5 shrink-0 animate-spin text-admin-muted" />}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between border-t border-admin-border px-5 py-3 text-sm">
          <span className="text-xs text-admin-muted">
            {filtered.length} member{filtered.length === 1 ? "" : "s"} · page {current} of {pageCount}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled={current >= pageCount} onClick={() => setPage(current + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
