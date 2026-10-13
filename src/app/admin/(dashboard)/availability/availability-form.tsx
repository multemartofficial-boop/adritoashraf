"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import type { BookingSettingsRow } from "@/types/database";
import { parseAvailabilityForm, parseBookingSettingsForm } from "@/lib/validators/booking";
import { allTimeZones } from "@/lib/booking/format";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveAvailabilityAction, saveBookingSettingsAction } from "./actions";

type Window = { weekday: number; start_time: string; end_time: string };
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toHHMM = (t: string) => t.slice(0, 5); // Postgres returns "10:00:00"

export function AvailabilityForm({ initial }: { initial: Window[] }) {
  const [windows, setWindows] = useState<Window[]>(
    initial.map((w) => ({ weekday: w.weekday, start_time: toHHMM(w.start_time), end_time: toHHMM(w.end_time) })),
  );
  const { formAction, onSubmit, pending, errors } = useAdminForm(saveAvailabilityAction, parseAvailabilityForm);

  const setWindow = (index: number, patch: Partial<Window>) =>
    setWindows((ws) => ws.map((w, i) => (i === index ? { ...w, ...patch } : w)));

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate>
      <FormSection
        title="Weekly availability"
        description="The windows clients can book, every week. Multiple windows per day are allowed."
      >
        <input type="hidden" name="windows" value={JSON.stringify(windows)} />
        <div className="space-y-3 md:col-span-2">
          {DAY_NAMES.map((name, weekday) => {
            const dayWindows = windows.map((w, i) => ({ ...w, index: i })).filter((w) => w.weekday === weekday);
            return (
              <div key={name} className="flex flex-col gap-2 rounded-xl border border-admin-border p-3 sm:flex-row sm:items-center">
                <p className="w-24 shrink-0 text-sm font-medium">{name}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {dayWindows.map((w) => (
                    <span key={w.index} className="flex items-center gap-1.5 rounded-lg bg-black/[0.04] px-2 py-1">
                      <input
                        type="time"
                        value={w.start_time}
                        onChange={(e) => setWindow(w.index, { start_time: e.target.value })}
                        aria-label={`${name} start`}
                        className="bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-admin-muted">–</span>
                      <input
                        type="time"
                        value={w.end_time}
                        onChange={(e) => setWindow(w.index, { end_time: e.target.value })}
                        aria-label={`${name} end`}
                        className="bg-transparent text-sm outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setWindows((ws) => ws.filter((_, i) => i !== w.index))}
                        className="rounded p-0.5 text-admin-muted hover:text-admin-danger"
                        aria-label={`Remove ${name} window`}
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setWindows((ws) => [...ws, { weekday, start_time: dayWindows.length ? "18:00" : "10:00", end_time: dayWindows.length ? "20:00" : "13:00" }])
                    }
                  >
                    <Plus /> Add
                  </Button>
                </div>
              </div>
            );
          })}
          {errors.windows && (
            <p role="alert" className="text-xs text-admin-danger">
              {errors.windows}
            </p>
          )}
          {windows.length === 0 && (
            <p className="text-xs text-admin-muted">No windows — the booking calendar will show no available times.</p>
          )}
        </div>
      </FormSection>
      <FormActions pending={pending} label="Save availability" />
    </form>
  );
}

export function BookingSettingsForm({ settings: s }: { settings: BookingSettingsRow }) {
  const { formAction, onSubmit, pending, errors: e } = useAdminForm(saveBookingSettingsAction, parseBookingSettingsForm);
  const zones = allTimeZones();

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title="Scheduling rules" description="How far ahead clients can book and how meetings are spaced.">
        <Field label="Slot length (minutes)" htmlFor="slot_duration_minutes" error={e.slot_duration_minutes}>
          <Input {...errProps("slot_duration_minutes", e.slot_duration_minutes)} type="number" min={10} max={240} step={5} defaultValue={s.slot_duration_minutes} />
        </Field>
        <Field label="Buffer between meetings (minutes)" htmlFor="buffer_minutes" error={e.buffer_minutes}>
          <Input {...errProps("buffer_minutes", e.buffer_minutes)} type="number" min={0} max={240} step={5} defaultValue={s.buffer_minutes} />
        </Field>
        <Field label="Max bookings per day" htmlFor="max_bookings_per_day" error={e.max_bookings_per_day}>
          <Input {...errProps("max_bookings_per_day", e.max_bookings_per_day)} type="number" min={1} max={50} defaultValue={s.max_bookings_per_day} />
        </Field>
        <Field label="Minimum notice (hours)" htmlFor="min_notice_hours" error={e.min_notice_hours} hint="How far ahead a booking must be made.">
          <Input {...errProps("min_notice_hours", e.min_notice_hours)} type="number" min={0} max={720} defaultValue={s.min_notice_hours} />
        </Field>
        <Field label="Book at most (days ahead)" htmlFor="max_days_ahead" error={e.max_days_ahead}>
          <Input {...errProps("max_days_ahead", e.max_days_ahead)} type="number" min={1} max={365} defaultValue={s.max_days_ahead} />
        </Field>
        <Field label="Cancellation notice (hours)" htmlFor="cancel_notice_hours" error={e.cancel_notice_hours} hint="Inside this window clients are asked to email you instead.">
          <Input {...errProps("cancel_notice_hours", e.cancel_notice_hours)} type="number" min={0} max={720} defaultValue={s.cancel_notice_hours} />
        </Field>
      </FormSection>

      <FormSection title="Timezone & meeting" description="Your working timezone and the Google Meet link sent with confirmations.">
        <Field label="Your timezone" htmlFor="timezone" error={e.timezone} hint="Weekly windows above are interpreted in this timezone.">
          <Select {...errProps("timezone", e.timezone)} defaultValue={s.timezone}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Default Google Meet link" htmlFor="meeting_link_default" error={e.meeting_link_default} hint="Used when a booking is confirmed without its own link.">
          <Input {...errProps("meeting_link_default", e.meeting_link_default)} defaultValue={s.meeting_link_default} placeholder="https://meet.google.com/…" />
        </Field>
        <Field label="Auto-confirm bookings" htmlFor="auto_confirm" error={e.auto_confirm} hint="Skip manual review — bookings are confirmed and the Meet link is sent immediately." className="md:col-span-2">
          <div className="flex h-10 items-center">
            <Switch id="auto_confirm" name="auto_confirm" defaultChecked={s.auto_confirm} aria-invalid={Boolean(e.auto_confirm) || undefined} />
          </div>
        </Field>
      </FormSection>
      <FormActions pending={pending} label="Save booking settings" />
    </form>
  );
}
