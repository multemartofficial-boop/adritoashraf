import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarClock, ShieldCheck, Timer, Video } from "lucide-react";
import { getServices, getSiteSettings } from "@/lib/data/public";
import { SectionTag } from "@/components/site/section-heading";
import { BookingFlow } from "@/components/booking/booking-flow";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Book a meeting",
  description: "Describe your project and pick a time for a free 15-30 minute call.",
  alternates: { canonical: "/book" },
};

const POINTS = [
  { icon: Timer, text: "Free, short and focused on your project." },
  { icon: Video, text: "On Google Meet. The link arrives by email." },
  { icon: ShieldCheck, text: "Reschedule or cancel any time with your private link." },
];

export default async function BookPage() {
  const [settings, services] = await Promise.all([getSiteSettings(), getServices()]);
  const text = settings.section_texts.booking;

  return (
    <section className="section-x min-h-svh bg-[#f6f5fb] pt-32 pb-24 text-ink">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <aside className="space-y-6 lg:sticky lg:top-32 lg:self-start">
          <SectionTag>{text?.tag || "Book a Call"}</SectionTag>
          {site.availability.slotsText && (
            <p className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/10 px-4 py-1.5 text-sm font-medium text-orange">
              {site.availability.slotsText}
            </p>
          )}
          <h1 className="text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] font-bold tracking-tight">
            Let&apos;s talk about <span className="font-serif font-normal text-violet italic">your project</span>
          </h1>
          <p className="text-neutral-600">
            {text?.description || "Fill in a short form and pick a time that suits you. I prepare before we talk, so the call is focused on your project."}
          </p>
          <ul className="space-y-3 text-sm">
            {POINTS.map(({ icon: Icon, text: t }) => (
              <li key={t} className="flex items-start gap-3">
                <span className="bg-orange-pill grid size-8 shrink-0 place-items-center rounded-full text-white">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="pt-1.5 text-neutral-700">{t}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-medium text-white/60">
              <CalendarClock className="size-4" aria-hidden /> Meeting agenda
            </p>
            <ol className="mt-3 space-y-1.5 text-sm">
              <li>1. I understand your project</li>
              <li>2. Solution and timeline</li>
              <li>3. Pricing</li>
            </ol>
          </div>
        </aside>

        <Suspense fallback={<div className="h-96 animate-pulse rounded-[2rem] bg-white" />}>
          <BookingFlow services={services.map(({ id, title, slug }) => ({ id, title, slug }))} ownerName={settings.owner_name} />
        </Suspense>
      </div>
    </section>
  );
}
