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
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-violet to-orange font-semibold text-white">
      {t.avatar_url ? <Image src={t.avatar_url} alt="" fill sizes="44px" className="object-cover" /> : t.client_name.charAt(0)}
    </span>
  );
}

function TextCard({ t }: { t: TestimonialRow }) {
  return (
    <figure className="relative flex h-full min-h-72 flex-col rounded-[1.75rem] bg-[linear-gradient(150deg,#efe8ff_0%,#fbe3ef_55%,#ffe9dd_100%)] p-6">
      <Quote className="absolute top-5 right-5 size-9 text-white/90 drop-shadow" aria-hidden />
      <figcaption className="flex items-center gap-3">
        <Avatar t={t} />
        <span>
          <span className="block text-sm font-semibold">{t.client_name}</span>
          {t.client_role && <span className="block text-xs text-neutral-600">{t.client_role}</span>}
        </span>
      </figcaption>
      <blockquote className="mt-5 flex-1 text-sm leading-relaxed text-neutral-700">“{t.content}”</blockquote>
      <div className="mt-5">
        <Stars rating={t.rating} />
      </div>
    </figure>
  );
}

function VideoCard({ t, onPlay }: { t: TestimonialRow; onPlay: () => void }) {
  const img = t.poster_url || t.avatar_url;
  return (
    <figure className="relative h-full min-h-72 overflow-hidden rounded-[1.75rem] bg-ink">
      {img && <Image src={img} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <figcaption className="absolute bottom-5 left-5 text-white">
        <span className="block font-semibold">{t.client_name}</span>
        {t.client_role && <span className="block text-xs text-white/75">{t.client_role}</span>}
      </figcaption>
      <button
        type="button"
        onClick={onPlay}
        className="bg-cta absolute right-5 bottom-5 grid size-12 place-items-center rounded-full text-white shadow-lg transition-transform duration-200 hover:scale-110"
        aria-label={`Play video review from ${t.client_name}`}
      >
        <Play className="ml-0.5 size-5 fill-current" />
      </button>
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
