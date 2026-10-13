"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarX2, Globe, Loader2 } from "lucide-react";
import { allTimeZones, dayKeyInTz, fmtLongDate, fmtTime, tzOffsetLabel } from "@/lib/booking/format";
import { cn } from "@/lib/utils";

type SlotsResponse = { timezone: string; slotMinutes: number; slots: string[] };

export type SlotPickerProps = {
  timezone: string;
  onTimezoneChange: (tz: string) => void;
  value: string | null;
  onChange: (iso: string) => void;
  /** Manage token of the booking being rescheduled (excluded from conflicts). */
  excludeToken?: string;
  /** Bumps to force a reload (e.g. after a "slot taken" error). */
  reloadKey?: number;
  onLoaded?: (meta: { adminTimezone: string; slotMinutes: number }) => void;
};

export function SlotPicker({ timezone, onTimezoneChange, value, onChange, excludeToken, reloadKey = 0, onLoaded }: SlotPickerProps) {
  // Results are keyed by request so a new request shows "loading" without resetting state in the effect.
  const reqKey = `${excludeToken ?? ""}:${reloadKey}`;
  const [result, setResult] = useState<{ key: string; data?: SlotsResponse; error?: string } | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const zones = useMemo(() => allTimeZones(), []);
  const data = result?.key === reqKey ? result.data ?? null : null;
  const error = result?.key === reqKey ? result.error ?? "" : "";

  useEffect(() => {
    let alive = true;
    const q = excludeToken ? `?exclude=${encodeURIComponent(excludeToken)}` : "";
    fetch(`/api/booking/slots${q}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error();
        return (await r.json()) as SlotsResponse;
      })
      .then((d) => {
        if (!alive) return;
        setResult({ key: reqKey, data: d });
        onLoaded?.({ adminTimezone: d.timezone, slotMinutes: d.slotMinutes });
      })
      .catch(() => alive && setResult({ key: reqKey, error: "Could not load available times. Please refresh." }));
    return () => {
      alive = false;
    };
  }, [excludeToken, reqKey, onLoaded]);

  // Group slots by calendar day in the visitor's timezone.
  const days = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const iso of data?.slots ?? []) {
      const k = dayKeyInTz(iso, timezone);
      map.set(k, [...(map.get(k) ?? []), iso]);
    }
    return [...map.entries()];
  }, [data, timezone]);

  const activeDay = day && days.some(([k]) => k === day) ? day : days[0]?.[0] ?? null;
  const times = days.find(([k]) => k === activeDay)?.[1] ?? [];

  return (
    <div className="space-y-6">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-ink">
          <Globe className="size-4 text-violet" aria-hidden /> Your timezone
        </span>
        <select
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="field-public"
        >
          {!zones.includes(timezone) && <option value={timezone}>{timezone}</option>}
          {zones.map((z) => (
            <option key={z} value={z}>
              {z.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <span className="text-xs text-neutral-500">
          Times are shown in {timezone.replace(/_/g, " ")} ({tzOffsetLabel(timezone)}).
        </span>
      </label>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {!data && !error && (
        <p className="flex items-center gap-2 text-sm text-neutral-500">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Loading available times...
        </p>
      )}

      {data && days.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-600">
          <CalendarX2 className="size-6 text-neutral-400" aria-hidden />
          No open times right now. Please check back soon or email me directly.
        </div>
      )}

      {days.length > 0 && (
        <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
          <div>
            <p className="mb-2 text-sm font-medium text-ink">Pick a day</p>
            <div role="listbox" aria-label="Available days" className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-2">
              {days.map(([k, list]) => {
                const selected = k === activeDay;
                return (
                  <button
                    key={k}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => setDay(k)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-left text-sm transition-colors",
                      selected ? "border-ink bg-ink text-white" : "border-neutral-200 bg-white hover:border-neutral-400",
                    )}
                  >
                    <span className="block font-medium">{fmtLongDate(list[0], timezone).split(",")[0]}</span>
                    <span className={cn("block text-xs", selected ? "text-white/70" : "text-neutral-500")}>
                      {fmtLongDate(list[0], timezone).split(", ")[1]} · {list.length} time{list.length === 1 ? "" : "s"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-ink">Pick a time ({data?.slotMinutes} min)</p>
            <div role="listbox" aria-label="Available times" className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 md:grid-cols-2">
              {times.map((iso) => {
                const selected = iso === value;
                return (
                  <button
                    key={iso}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => onChange(iso)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      selected ? "bg-cta border-transparent text-white" : "border-neutral-200 bg-white hover:border-violet",
                    )}
                  >
                    {fmtTime(iso, timezone)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
