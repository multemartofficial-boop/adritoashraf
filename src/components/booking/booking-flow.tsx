"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Download, Loader2, Video } from "lucide-react";
import type { ServiceRow } from "@/types/database";
import { BUDGET_RANGES, bookingIntakeSchema } from "@/lib/validators/booking";
import { zodFieldErrors, type FieldErrors } from "@/lib/forms";
import { browserTimeZone, fmtLongDate, fmtTime, googleCalendarUrl } from "@/lib/booking/format";
import { site } from "@/config/site";
import { track } from "@/lib/track";
import { SlotPicker } from "./slot-picker";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;
type Services = Pick<ServiceRow, "id" | "title" | "slug">[];

// "What do you need" options → project_type values (kept aligned with the DB enum).
const NEED_OPTIONS = [
  { value: "website", label: "Website" },
  { value: "other", label: "Custom software" },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Confirmation = {
  reference_code: string;
  status: "pending" | "confirmed";
  manage_token: string;
  start_time_utc: string;
  end_time_utc: string;
  meeting_link: string;
};

const STEPS = ["Your project", "Pick a time", "Confirm"];

function Field({
  label,
  name,
  error,
  hint,
  children,
  optional,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-ink">
        {label} {optional && <span className="font-normal text-neutral-400">(optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-neutral-500">{hint}</p>
      )}
    </div>
  );
}

export function BookingFlow({ services, ownerName }: { services: Services; ownerName: string }) {
  const params = useSearchParams();
  const preselected = useMemo(() => services.find((s) => s.slug === params.get("service"))?.id ?? "", [params, services]);

  const [step, setStep] = useState<Step>(1);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [timezone, setTimezone] = useState(browserTimeZone);
  const [slot, setSlot] = useState<string | null>(null);
  const [adminTz, setAdminTz] = useState("Asia/Dhaka");
  const [slotMinutes, setSlotMinutes] = useState(30);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<Confirmation | null>(null);
  const [summary, setSummary] = useState({ name: "", email: "", service: "", type: "" });
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const onSlotsLoaded = useCallback((m: { adminTimezone: string; slotMinutes: number }) => {
    setAdminTz(m.adminTimezone);
    setSlotMinutes(m.slotMinutes);
  }, []);

  const collect = () => {
    const fd = new FormData(formRef.current ?? undefined);
    // The single "WhatsApp or email" field maps onto the backend's email/phone pair.
    const contact = String(fd.get("contact") ?? "").trim();
    fd.set("email", EMAIL_RE.test(contact) ? contact : "");
    fd.set("phone", EMAIL_RE.test(contact) ? "" : contact);
    fd.set("reference_links", "[]");
    fd.delete("attachment");
    fd.set("client_timezone", timezone);
    fd.set("start_time_utc", slot ?? "");
    fd.set("form_started_at", String(startedAt.current));
    return fd;
  };

  // Validate the intake fields (step 1) with the shared zod schema, ignoring the slot.
  const validateIntake = () => {
    const fd = collect();
    const result = bookingIntakeSchema.safeParse({
      client_name: fd.get("client_name"),
      email: String(fd.get("email") ?? "").trim(),
      phone: fd.get("phone"),
      service_id: fd.get("service_id"),
      project_type: fd.get("project_type"),
      budget_range: fd.get("budget_range"),
      // Field was removed from the form — fd.get() returns null, which fails the enum union.
      timeline_needed: String(fd.get("timeline_needed") ?? ""),
      project_description: fd.get("project_description"),
      reference_links: [],
      start_time_utc: new Date().toISOString(),
      client_timezone: timezone,
    });
    if (!result.success) {
      const fe = zodFieldErrors(result.error);
      setErrors(fe);
      document.getElementById(Object.keys(fe)[0])?.focus();
      return false;
    }
    setErrors({});
    return true;
  };

  const next = () => {
    setFormError("");
    if (step === 1 && !validateIntake()) return;
    if (step === 2) {
      if (!slot) {
        setFormError("Please pick a time slot.");
        return;
      }
      const fd = collect();
      setSummary({
        name: String(fd.get("client_name") ?? ""),
        email: String(fd.get("email") ?? "") || String(fd.get("phone") ?? ""),
        service: NEED_OPTIONS.find((t) => t.value === fd.get("project_type"))?.label ?? "",
        type: services.find((s) => s.id === fd.get("service_id"))?.title ?? "",
      });
    }
    setStep((s) => (s + 1) as Step);
  };

  const submit = async () => {
    if (!slot) return;
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/booking", { method: "POST", body: collect() });
      const body = (await res.json().catch(() => ({}))) as Partial<Confirmation> & {
        error?: string;
        code?: string;
        fieldErrors?: FieldErrors;
      };
      if (res.ok && body.reference_code) {
        track("booking_form_submit", { reference: body.reference_code });
        setDone(body as Confirmation);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      if (body.fieldErrors) {
        setErrors(body.fieldErrors);
        setStep(1);
      } else if (body.code === "SLOT_GONE") {
        setSlot(null);
        setReloadKey((k) => k + 1);
        setStep(2);
      }
      setFormError(body.error ?? "Something went wrong. Please try again.");
    } catch {
      setFormError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return <Confirmed data={done} timezone={timezone} ownerName={ownerName} />;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="mb-8 flex items-center gap-2 text-sm" aria-label="Progress">
        {STEPS.map((label, i) => {
          const n = (i + 1) as Step;
          const state = n < step ? "done" : n === step ? "active" : "todo";
          return (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold",
                  state === "done" && "bg-ink text-white",
                  state === "active" && "bg-cta text-white",
                  state === "todo" && "bg-neutral-200 text-neutral-500",
                )}
                aria-current={state === "active" ? "step" : undefined}
              >
                {state === "done" ? <Check className="size-3.5" /> : n}
              </span>
              <span className={cn("hidden sm:inline", state === "todo" ? "text-neutral-400" : "text-ink")}>{label}</span>
              {i < STEPS.length - 1 && <span className="ml-2 h-px flex-1 bg-neutral-200" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {/* The form stays mounted across steps so values persist; steps are shown/hidden. */}
      <form ref={formRef} onSubmit={(e) => e.preventDefault()} noValidate className="relative rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgb(0_0_0/0.06)] md:p-10">
        {/* Honeypot: hidden from humans, filled by bots. */}
        <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
          <label>
            Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <section className={cn("space-y-5", step !== 1 && "hidden")} aria-hidden={step !== 1}>
          <h2 className="text-xl font-semibold text-ink">Tell me about your project</h2>
          <input type="hidden" name="service_id" defaultValue={preselected} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Your name" name="client_name" error={errors.client_name}>
              <input id="client_name" name="client_name" className="field-public" autoComplete="name" aria-invalid={!!errors.client_name} />
            </Field>
            <Field label="WhatsApp or email" name="contact" error={errors.email ?? errors.phone} hint="I'll reply here — WhatsApp is fastest.">
              <input id="contact" name="contact" className="field-public" autoComplete="tel" aria-invalid={!!(errors.email ?? errors.phone)} />
            </Field>
            <Field label="What do you need?" name="project_type" error={errors.project_type}>
              <select id="project_type" name="project_type" className="field-public" defaultValue="" aria-invalid={!!errors.project_type}>
                <option value="" disabled>
                  Choose one
                </option>
                {NEED_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Budget range" name="budget_range" error={errors.budget_range} optional>
              <select id="budget_range" name="budget_range" className="field-public" defaultValue="">
                <option value="">Prefer not to say</option>
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field
            label="Short message"
            name="project_description"
            error={errors.project_description}
            hint="One or two lines is enough — we'll talk about the details on the call."
            optional
          >
            <textarea
              id="project_description"
              name="project_description"
              rows={4}
              className="field-public resize-y"
              aria-invalid={!!errors.project_description}
            />
          </Field>
        </section>

        <section className={cn("space-y-5", step !== 2 && "hidden")} aria-hidden={step !== 2}>
          <h2 className="text-xl font-semibold text-ink">Pick a time that suits you</h2>
          <SlotPicker
            timezone={timezone}
            onTimezoneChange={setTimezone}
            value={slot}
            onChange={setSlot}
            reloadKey={reloadKey}
            onLoaded={onSlotsLoaded}
          />
        </section>

        <section className={cn("space-y-6", step !== 3 && "hidden")} aria-hidden={step !== 3}>
          <h2 className="text-xl font-semibold text-ink">Confirm your booking</h2>
          {slot && (
            <div className="bg-holo rounded-2xl p-5">
              <p className="text-sm text-neutral-700">Meeting time</p>
              <p className="mt-1 text-lg font-semibold text-ink">
                {fmtLongDate(slot, timezone)} at {fmtTime(slot, timezone)}
              </p>
              <p className="text-sm text-neutral-700">
                {slotMinutes} minutes · {timezone.replace(/_/g, " ")}
                {adminTz !== timezone && ` · ${fmtTime(slot, adminTz)} for ${ownerName} (${adminTz.replace(/_/g, " ")})`}
              </p>
            </div>
          )}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Summary label="Name" value={summary.name} />
            <Summary label="Contact" value={summary.email} />
            <Summary label="You need" value={summary.service} />
            {summary.type && <Summary label="Service" value={summary.type} />}
          </dl>
          <p className="text-sm text-neutral-600">
            You will get an email with the details and a private link to reschedule or cancel. The Google Meet link is shared once the meeting is confirmed.
          </p>
        </section>

        {formError && (
          <p role="alert" className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" onClick={() => setStep((s) => (s - 1) as Step)} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium text-ink hover:bg-neutral-50">
              <ArrowLeft className="size-4" /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 3 ? (
            <button type="button" onClick={next} className="bg-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgb(123_79_255/0.35)]">
              Continue <ArrowRight className="size-4" />
            </button>
          ) : (
            <button type="button" onClick={submit} disabled={submitting} className="bg-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgb(123_79_255/0.35)] disabled:opacity-60">
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Confirm booking
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <dt className="text-xs text-neutral-500">{label}</dt>
      <dd className="truncate font-medium text-ink">{value || "-"}</dd>
    </div>
  );
}

function Confirmed({ data, timezone, ownerName }: { data: Confirmation; timezone: string; ownerName: string }) {
  const confirmed = data.status === "confirmed";
  const gcal = googleCalendarUrl({
    title: `Meeting with ${ownerName}`,
    startIso: data.start_time_utc,
    endIso: data.end_time_utc,
    details: `Booking ${data.reference_code}`,
    location: data.meeting_link || "Online",
  });
  return (
    <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-neutral-200 bg-white p-8 text-center shadow-[0_20px_60px_rgb(0_0_0/0.06)] md:p-12">
      <span className="bg-cta mx-auto grid size-16 place-items-center rounded-full text-white">
        <Check className="size-7" />
      </span>
      <h2 className="mt-6 text-2xl font-bold text-ink md:text-3xl">ধন্যবাদ!</h2>
      <p className="mt-3 text-neutral-600">
        {confirmed
          ? `Your meeting is confirmed — ${site.responseTimeHours} ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব। The details and Google Meet link are on their way to your inbox.`
          : `${site.responseTimeHours} ঘণ্টার মধ্যে আপনার সাথে যোগাযোগ করব। ${ownerName} will confirm your slot shortly — check your inbox for the details.`}
      </p>
      <div className="bg-holo mt-8 rounded-2xl p-5 text-left">
        <p className="text-xs tracking-wide text-neutral-600 uppercase">Reference</p>
        <p className="font-mono text-lg font-bold text-ink">{data.reference_code}</p>
        <p className="mt-3 text-xs tracking-wide text-neutral-600 uppercase">When</p>
        <p className="font-semibold text-ink">
          {fmtLongDate(data.start_time_utc, timezone)} at {fmtTime(data.start_time_utc, timezone)}
        </p>
        <p className="text-sm text-neutral-700">{timezone.replace(/_/g, " ")}</p>
        {data.meeting_link && (
          <a href={data.meeting_link} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet hover:underline">
            <Video className="size-4" /> {data.meeting_link}
          </a>
        )}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a href={gcal} target="_blank" rel="noopener" className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50">
          <CalendarPlus className="size-4" /> Google Calendar
        </a>
        <a href={`/api/booking/ics?token=${encodeURIComponent(data.manage_token)}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50">
          <Download className="size-4" /> Add to calendar (.ics)
        </a>
        <Link href={`/manage-booking?token=${encodeURIComponent(data.manage_token)}`} className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50">
          Manage booking
        </Link>
      </div>
      <Link href="/" className="mt-8 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Back home
      </Link>
    </div>
  );
}
