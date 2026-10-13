"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOOKING_STATUSES, NAV_GROUPS, isActive } from "./nav-config";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses the search box unless the user is already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) })).filter(
      (g) => g.items.length > 0,
    );
  }, [query]);

  const go = (href: string) => {
    router.push(href);
    setQuery("");
    onNavigate?.();
  };

  return (
    <nav aria-label="Admin" className="flex h-full w-full flex-col gap-4 overflow-y-auto px-3 pt-1 pb-3">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-admin-muted" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && groups[0]?.items[0]) go(groups[0].items[0].href);
            if (e.key === "Escape") {
              setQuery("");
              searchRef.current?.blur();
            }
          }}
          placeholder="Search..."
          aria-label="Search admin sections"
          className="h-9 w-full rounded-xl border border-admin-border bg-white/70 pr-9 pl-9 text-sm outline-none placeholder:text-admin-muted focus-visible:border-admin-info focus-visible:ring-3 focus-visible:ring-admin-info/20"
        />
        <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md border border-admin-border bg-white px-1.5 text-[11px] text-admin-muted">
          /
        </kbd>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-2 text-xs font-medium text-admin-muted">{group.label}</p>
          {group.statusFilter && !query && (
            <Suspense fallback={<div className="h-9" />}>
              <StatusFilter onNavigate={onNavigate} />
            </Suspense>
          )}
          <ul className="space-y-0.5">
            {group.items.map(({ label, href, icon: Icon }) => {
              const active = isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors duration-150",
                      active
                        ? "bg-black/[0.06] font-medium text-admin-text"
                        : "text-admin-text/75 hover:bg-black/[0.04] hover:text-admin-text",
                    )}
                  >
                    <Icon className={cn("size-4", active ? "text-admin-text" : "text-admin-muted")} />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}

      {groups.length === 0 && <p className="px-2 text-sm text-admin-muted">No sections match “{query}”.</p>}

      <div className="mt-auto rounded-2xl border border-admin-border bg-gradient-to-br from-sky-100 via-white to-rose-100 p-4 shadow-panel">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid size-5 place-items-center rounded-md bg-admin-info text-white">
            <Check className="size-3" />
          </span>
          Meeting prep
        </p>
        <p className="mt-1 text-xs text-admin-muted">Before every client call:</p>
        <ul className="mt-2 space-y-1 text-xs text-admin-text/80">
          {["Read the intake answers", "Draft a rough estimate", "Keep the Meet link ready"].map((t) => (
            <li key={t} className="flex items-center gap-1.5">
              <Check className="size-3 text-admin-success" />
              {t}
            </li>
          ))}
        </ul>
        <Link
          href="/admin/bookings?status=confirmed"
          onClick={onNavigate}
          className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg bg-neutral-950 text-xs font-medium text-white hover:bg-neutral-800"
        >
          Upcoming meetings <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </nav>
  );
}

function StatusFilter({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = pathname.startsWith("/admin/bookings") ? (params.get("status") ?? "") : "";

  return (
    <div className="relative mb-1">
      <select
        value={current}
        aria-label="Filter bookings by status"
        onChange={(e) => {
          const v = e.target.value;
          router.push(v ? `/admin/bookings?status=${v}` : "/admin/bookings");
          onNavigate?.();
        }}
        className="h-9 w-full appearance-none rounded-xl border border-admin-border bg-white/70 pr-8 pl-3 text-sm outline-none focus-visible:border-admin-info focus-visible:ring-3 focus-visible:ring-admin-info/20"
      >
        {BOOKING_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-admin-muted" />
    </div>
  );
}
