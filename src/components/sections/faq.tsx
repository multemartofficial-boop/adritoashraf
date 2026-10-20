"use client";

import Link from "next/link";
import { Accordion as A } from "radix-ui";
import { ArrowUpRight, MessageCircle, Plus } from "lucide-react";
import type { FaqRow, SectionText } from "@/types/database";
import { SectionTag, TriHeading } from "@/components/site/section-heading";
import { site } from "@/config/site";

export function Faq({ faqs, text, contactEmail }: { faqs: FaqRow[]; text?: SectionText; contactEmail: string }) {
  if (faqs.length === 0) return null;
  // Cost + timeline questions open by default (the two buyers ask first).
  const defaultOpen = faqs.filter((f) => /cost|long/i.test(f.question)).map((f) => f.id);
  const email = contactEmail || site.email;
  const wa = site.whatsappNumber ? `https://wa.me/${site.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(site.whatsappMessage)}` : "";

  return (
    <section
      id="faq"
      className="section-x relative isolate flex min-h-svh flex-col justify-center gap-12 overflow-hidden bg-[linear-gradient(160deg,#0b0b12_0%,#1a0f33_45%,#3b1a6e_100%)] py-24 text-white md:py-32"
    >
      <div aria-hidden className="absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full bg-violet/30 blur-[110px]" />

      <div className="space-y-5">
        <SectionTag tone="dark">{text?.tag || "Frequently Asked Questions"}</SectionTag>
        <TriHeading text={text ?? {}} tone="dark" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.6fr]">
        <aside className="glass flex flex-col justify-between gap-8 rounded-[1.75rem] p-7">
          <div>
            <p className="text-lg font-semibold">Still have a question?</p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              {text?.description || "Book a short call and ask me directly, or send an email."}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/book" className="bg-cta inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
              Book a Free 15-Min Call <ArrowUpRight className="size-4" />
            </Link>
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/20"
              >
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`} className="text-center text-sm text-white/70 underline-offset-4 hover:text-white hover:underline">
                {email}
              </a>
            )}
          </div>
        </aside>

        <A.Root type="multiple" defaultValue={defaultOpen.length ? defaultOpen : [faqs[0]?.id ?? ""]} className="space-y-3">
          {faqs.map((f) => (
            <A.Item
              key={f.id}
              value={f.id}
              className="group scroll-reveal overflow-hidden rounded-2xl bg-white text-ink transition-colors duration-300 data-[state=open]:bg-[linear-gradient(120deg,#c9b6ff_0%,#7b4fff_100%)] data-[state=open]:text-white"
            >
              <A.Header>
                <A.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold md:px-6 md:text-base">
                  {f.question}
                  <Plus
                    className="size-5 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]:rotate-45"
                    aria-hidden
                  />
                </A.Trigger>
              </A.Header>
              <A.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <p className="px-5 pb-5 text-sm leading-relaxed whitespace-pre-line text-white/90 md:px-6">{f.answer}</p>
              </A.Content>
            </A.Item>
          ))}
        </A.Root>
      </div>
    </section>
  );
}
