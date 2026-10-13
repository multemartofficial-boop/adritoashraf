import Link from "next/link";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import type { SectionText } from "@/types/database";
import { SectionTag, TriHeading } from "@/components/site/section-heading";

const AGENDA = [
  { title: "I understand your project", text: "Your answers from the booking form, goals and users." },
  { title: "Solution and timeline", text: "How I would build it and how long it takes." },
  { title: "Pricing", text: "A clear estimate based on the scope we agree on." },
];

export function BookingCta({ text, ownerName }: { text?: SectionText; ownerName: string }) {
  const initials = ownerName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2);

  return (
    <section id="book" className="section-x flex min-h-svh flex-col justify-center gap-10 bg-white py-24 text-ink md:py-32">
      <div className="space-y-5">
        <SectionTag>{text?.tag || "Book a Call"}</SectionTag>
        <TriHeading text={text ?? {}} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="bg-holo scroll-reveal relative flex min-h-96 flex-col justify-between overflow-hidden rounded-[2rem] p-7 md:p-10">
          <span className="bg-orange-pill grid size-16 place-items-center rounded-full text-lg font-bold text-white ring-4 ring-white/70">
            {initials}
          </span>
          <div className="mt-10 space-y-4">
            <h3 className="text-[clamp(1.75rem,3vw,2.75rem)] leading-tight font-extrabold tracking-tight uppercase">Book a 15 min call</h3>
            {text?.description && <p className="max-w-md text-sm leading-relaxed text-neutral-700 md:text-base">{text.description}</p>}
            <Link
              href="/book"
              className="bg-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgb(123_79_255/0.35)] transition-transform duration-200 hover:scale-[1.03]"
            >
              Book a Free Call <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="scroll-reveal flex flex-col justify-center rounded-[2rem] bg-ink p-7 text-white md:p-10">
          <p className="flex items-center gap-2 text-sm font-medium text-white/60">
            <CalendarClock className="size-4" aria-hidden /> What happens in the meeting
          </p>
          <ol className="mt-6 space-y-6">
            {AGENDA.map((a, i) => (
              <li key={a.title} className="flex gap-4">
                <span className="bg-orange-pill grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold">{i + 1}</span>
                <span>
                  <span className="block font-semibold">{a.title}</span>
                  <span className="block text-sm text-white/60">{a.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
