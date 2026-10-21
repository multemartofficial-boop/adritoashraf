"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog as D } from "radix-ui";
import { Play, Quote, Star, X } from "lucide-react";
import type { SectionText, TestimonialRow } from "@/types/database";
import { parseVideoUrl } from "@/lib/video";
import { SectionHeading } from "@/components/site/section-heading";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5 text-orange" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={i < rating ? "size-4 fill-current" : "size-4 opacity-25"} aria-hidden />
      ))}
    </span>
  );
}

function Avatar({ t }: { t: TestimonialRow }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/60 bg-gradient-to-br from-violet to-orange font-semibold text-white shadow-[0_10px_25px_rgb(11_11_18/0.18)]">
      {t.avatar_url ? <Image src={t.avatar_url} alt={t.client_name} fill sizes="44px" className="object-cover" /> : t.client_name.charAt(0)}
    </span>
  );
}

function CompanyBadge({ url, name }: { url?: string; name: string }) {
  if (!url) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-white/70 bg-white/80 px-3 py-1 shadow-sm">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" className="h-6 w-auto max-w-20 object-contain" />
      <span className="sr-only">{name}</span>
    </span>
  );
}

function TextCard({ t }: { t: TestimonialRow }) {
  return (
    <figure className="relative flex h-full min-h-72 flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-[linear-gradient(155deg,rgba(255,255,255,0.9),rgba(239,232,255,0.82)_45%,rgba(251,227,239,0.72)_100%)] p-6 shadow-[0_20px_50px_rgb(11_11_18/0.08)] backdrop-blur-xl">
      <Quote className="absolute top-5 right-5 size-9 text-white/85 drop-shadow" aria-hidden />
      <figcaption className="flex items-start gap-3">
        <Avatar t={t} />
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{t.client_name}</span>
          {t.client_role && <span className="block text-xs text-neutral-600">{t.client_role}</span>}
          <span className="mt-1 inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-600 shadow-sm">Verified client</span>
        </span>
        <div className="ml-auto">
          <CompanyBadge url={t.company_logo_url} name={t.client_name} />
        </div>
      </figcaption>
      {t.result && <p className="mt-4 inline-flex w-fit rounded-full bg-ink px-3 py-1 text-xs font-semibold tracking-wide text-white">{t.result}</p>}
      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-neutral-700">“{t.content}”</blockquote>
      {t.screenshot_url && (
        <a
          href={t.link_url || t.screenshot_url}
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-4 block aspect-video overflow-hidden rounded-xl border border-white/70 shadow-[0_12px_30px_rgb(11_11_18/0.08)]"
        >
          <Image src={t.screenshot_url} alt={`Proof for ${t.client_name}'s review`} fill sizes="33vw" className="object-cover" />
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm">Proof</span>
        </a>
      )}
      <div className="mt-5 flex items-center justify-between gap-3">
        <Stars rating={t.rating} />
        {t.company_logo_url && <CompanyBadge url={t.company_logo_url} name={t.client_name} />}
      </div>
    </figure>
  );
}

function VideoCard({ t, onPlay }: { t: TestimonialRow; onPlay: () => void }) {
  const img = t.poster_url || t.avatar_url;
  return (
    <figure className="relative h-full min-h-72 overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#0b0b12] text-white shadow-[0_24px_70px_rgb(0_0_0/0.35)]">
      {img && <Image src={img} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover opacity-92" />}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_15%,rgb(123_79_255/0.22),transparent_55%),linear-gradient(180deg,transparent_25%,rgb(0_0_0/0.72)_100%)]" />
      <figcaption className="absolute inset-x-5 bottom-5 flex items-end gap-3">
        <span className="min-w-0 flex-1">
          <span className="block font-semibold">{t.client_name}</span>
          {t.client_role && <span className="block text-xs text-white/72">{t.client_role}</span>}
        </span>
        <CompanyBadge url={t.company_logo_url} name={t.client_name} />
      </figcaption>
      <button
        type="button"
        onClick={onPlay}
        className="bg-cta absolute right-5 bottom-5 grid size-12 place-items-center rounded-full text-white shadow-[0_10px_30px_rgb(123_79_255/0.35)] transition-transform duration-200 hover:scale-110"
        aria-label={`Play video review from ${t.client_name}`}
      >
        <Play className="ml-0.5 size-5 fill-current" />
      </button>
      {t.result && <span className="absolute top-5 left-5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">{t.result}</span>}
    </figure>
  );
}

export function Testimonials({ items, text }: { items: TestimonialRow[]; text?: SectionText }) {
  const [playing, setPlaying] = useState<TestimonialRow | null>(null);
  if (items.length === 0) return null;
  const video = playing ? parseVideoUrl(playing.video_url) : null;

  return (
    <section id="testimonials" className="section-x flex min-h-svh flex-col justify-center gap-12 bg-white py-24 text-ink md:py-32">
      <SectionHeading text={text} />
      <ul className="grid auto-rows-[minmax(18rem,auto)] gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-3">
        {items.map((t) => (
          <li key={t.id} className="card-lift scroll-reveal">
            {t.type === "video" ? <VideoCard t={t} onPlay={() => setPlaying(t)} /> : <TextCard t={t} />}
          </li>
        ))}
      </ul>

      <D.Root open={playing !== null} onOpenChange={(o) => !o && setPlaying(null)}>
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" />
          <D.Content className="fixed top-1/2 left-1/2 z-[60] w-[min(92vw,960px)] -translate-x-1/2 -translate-y-1/2 outline-none">
            <D.Title className="sr-only">Video review from {playing?.client_name}</D.Title>
            <D.Description className="sr-only">{playing?.content || "Client video testimonial"}</D.Description>
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl">
              {video?.kind === "file" && <video src={video.src} controls autoPlay playsInline className="size-full" />}
              {video && video.kind !== "file" && (
                <iframe
                  src={video.embed}
                  title={`Video review from ${playing?.client_name}`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="size-full"
                />
              )}
              {!video && <p className="grid size-full place-items-center text-white/70">This video cannot be played.</p>}
            </div>
            <D.Close className="absolute -top-12 right-0 grid size-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label="Close video">
              <X className="size-5" />
            </D.Close>
          </D.Content>
        </D.Portal>
      </D.Root>
    </section>
  );
}
