"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarPlus,
  CalendarX2,
  Check,
  Download,
  Loader2,
  RefreshCw,
  Video,
} from "lucide-react";
import type { BookingStatus } from "@/types/database";
import { fmtLongDate, fmtTime, googleCalendarUrl } from "@/lib/booking/format";
import { SlotPicker } from "./slot-picker";
import { cn } from "@/lib/utils";

type Booking = {
  reference_code: string;
  client_name: string;
  status: BookingStatus;
  start_time_utc: string;
  end_time_utc: string;
  client_timezone: string;
  meeting_link: string;
  service: string;
};

const STATUS_LABEL: Record<BookingStatus, { label: string; cls: string }> = {
  pending: {
    label: "Awaiting confirmation",
    cls: "bg-amber-100 text-amber-800",
  },
  confirmed: { label: "Confirmed", cls: "bg-emerald-100 text-emerald-800" },
  completed: { label: "Completed", cls: "bg-neutral-200 text-neutral-700" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

export function ManageBooking({
  token,
  booking: initial,
  cancelNoticeHours,
  canChange: initialCanChange,
  ownerName,
  contactEmail,
}: {
  token: string;
  booking: Booking;
  cancelNoticeHours: number;
  /** Computed on the server: active and still before the change deadline. */
  canChange: boolean;
  ownerName: string;
  contactEmail: string;
}) {
  const [booking, setBooking] = useState(initial);
  const [mode, setMode] = useState<"view" | "reschedule" | "cancel">("view");
  const [timezone, setTimezone] = useState(initial.client_timezone);
  const [slot, setSlot] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const active = booking.status === "pending" || booking.status === "confirmed";
  const canChange = active && initialCanChange;
  const status = STATUS_LABEL[booking.status];

  const call = async (body: Record<string, string>) => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/booking/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...body }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
        status?: BookingStatus;
        start_time_utc?: string;
        end_time_utc?: string;
      };
      if (!res.ok) {
        if (data.code === "SLOT_GONE") {
          setSlot(null);
          setReloadKey((k) => k + 1);
        }
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (body.action === "cancel") {
        setBooking({ ...booking, status: "cancelled" });
        setNotice(
          "Your meeting has been cancelled. A confirmation email is on its way.",
        );
      } else {
        setBooking({
          ...booking,
          start_time_utc: data.start_time_utc!,
          end_time_utc: data.end_time_utc!,
          client_timezone: timezone,
        });
        setNotice(
          "Your meeting has been moved. The updated details are on their way to your inbox.",
        );
      }
      setMode("view");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const gcal = googleCalendarUrl({
    title: `Meeting with ${ownerName}`,
    startIso: booking.start_time_utc,
    endIso: booking.end_time_utc,
    details: `Booking ${booking.reference_code}`,
    location: booking.meeting_link || "Online",
  });

  return (
    <div className="w-full max-w-2xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-[0_20px_60px_rgb(0_0_0/0.06)] md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-wide text-neutral-500 uppercase">
            Booking {booking.reference_code}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-ink">
            Hi {booking.client_name.split(" ")[0]}, here is your meeting
          </h1>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            status.cls,
          )}
        >
          {status.label}
        </span>
      </div>

      {notice && (
        <p
          role="status"
          className="mt-5 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          <Check className="mt-0.5 size-4 shrink-0" /> {notice}
        </p>
      )}

      <div
        className={cn(
          "mt-6 rounded-2xl p-5",
          booking.status === "cancelled" ? "bg-neutral-100" : "bg-holo",
        )}
      >
        <p className="text-xs tracking-wide text-neutral-600 uppercase">When</p>
        <p
          className={cn(
            "text-lg font-semibold text-ink",
            booking.status === "cancelled" && "line-through opacity-60",
          )}
        >
          {fmtLongDate(booking.start_time_utc, booking.client_timezone)} at{" "}
          {fmtTime(booking.start_time_utc, booking.client_timezone)}
        </p>
        <p className="text-sm text-neutral-700">
          {booking.client_timezone.replace(/_/g, " ")}
        </p>
        <p className="mt-3 text-xs tracking-wide text-neutral-600 uppercase">
          About
        </p>
        <p className="font-medium text-ink">{booking.service}</p>
        {booking.status === "confirmed" && booking.meeting_link && (
          <a
            href={booking.meeting_link}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-violet hover:underline"
          >
            <Video className="size-4" /> Join on Google Meet
          </a>
        )}
        {booking.status === "pending" && (
          <p className="mt-3 text-sm text-neutral-700">
            The Google Meet link is sent once {ownerName} confirms the time.
          </p>
        )}
      </div>

      {active && mode === "view" && (
        <>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={gcal}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50"
            >
              <CalendarPlus className="size-4" /> Google Calendar
            </a>
            <a
              href={`/api/booking/ics?token=${encodeURIComponent(token)}`}
              className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50"
            >
              <Download className="size-4" /> .ics file
            </a>
          </div>
          <div className="mt-8 border-t border-neutral-200 pt-6">
            {canChange ? (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setMode("reschedule")}
                  className="bg-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <RefreshCw className="size-4" /> Reschedule
                </button>
                <button
                  type="button"
                  onClick={() => setMode("cancel")}
                  className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <CalendarX2 className="size-4" /> Cancel meeting
                </button>
              </div>
            ) : (
              <p className="text-sm text-neutral-600">
                Changes online are possible up to {cancelNoticeHours} hours
                before the meeting. To change it now, please reply to your
                booking email
                {contactEmail && (
                  <>
                    {" "}
                    or write to{" "}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-violet underline"
                    >
                      {contactEmail}
                    </a>
                  </>
                )}
                .
              </p>
            )}
          </div>
        </>
      )}

      {mode === "reschedule" && (
        <div className="mt-8 space-y-5 border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold text-ink">Pick a new time</h2>
          <SlotPicker
            timezone={timezone}
            onTimezoneChange={setTimezone}
            value={slot}
            onChange={setSlot}
            excludeToken={token}
            reloadKey={reloadKey}
          />
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!slot || busy}
              onClick={() =>
                slot && call({ action: "reschedule", start_time_utc: slot })
              }
              className="bg-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Check className="size-4" />
              )}{" "}
              Confirm new time
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50"
            >
              Keep current time
            </button>
          </div>
        </div>
      )}

      {mode === "cancel" && (
        <div className="mt-8 space-y-4 border-t border-neutral-200 pt-6">
          <h2 className="text-lg font-semibold text-ink">
            Cancel this meeting?
          </h2>
          <p className="text-sm text-neutral-600">
            This frees the slot for someone else. You can always book a new time
            later.
          </p>
          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => call({ action: "cancel" })}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CalendarX2 className="size-4" />
              )}{" "}
              Yes, cancel it
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-medium text-ink hover:bg-neutral-50"
            >
              Keep the meeting
            </button>
          </div>
        </div>
      )}

      {booking.status === "cancelled" && (
        <Link
          href="/book"
          className="bg-cta mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
        >
          Book a new meeting
        </Link>
      )}
    </div>
  );
}
