"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Dialog as D } from "radix-ui";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { FitImage } from "@/components/ui/fit-image";

type Img = { id: string; url: string; caption: string };

export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const go = useCallback(
    (d: number) =>
      setIndex((i) =>
        i === null ? i : (i + d + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  const current = index === null ? null : images[index];

  return (
    <>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <li
            key={img.id}
            className={
              i === 0 && images.length % 2 === 1 ? "sm:col-span-2" : undefined
            }
          >
            <button
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full overflow-hidden rounded-[1.5rem] bg-neutral-100 text-left"
              aria-label={`Open screenshot ${i + 1}${img.caption ? `: ${img.caption}` : ""}`}
            >
              <span className="relative block aspect-video">
                <FitImage
                  src={img.url}
                  alt={img.caption || `${title} screenshot ${i + 1}`}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              {img.caption && (
                <span className="block px-4 py-3 text-sm text-neutral-600">
                  {img.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <D.Root
        open={current !== null}
        onOpenChange={(o) => !o && setIndex(null)}
      >
        <D.Portal>
          <D.Overlay className="fixed inset-0 z-[60] bg-black/90" />
          <D.Content className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-4 outline-none md:p-10">
            <D.Title className="sr-only">
              {current?.caption || `${title} screenshot`}
            </D.Title>
            <D.Description className="sr-only">
              Use the arrow keys to browse screenshots.
            </D.Description>
            {current && (
              <figure className="relative h-full max-h-[85vh] w-full max-w-6xl">
                <Image
                  src={current.url}
                  alt={current.caption || `${title} screenshot`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </figure>
            )}
            {current?.caption && (
              <p className="mt-4 text-center text-sm text-white/80">
                {current.caption}
              </p>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                  aria-label="Previous screenshot"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-3 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
                  aria-label="Next screenshot"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
            <D.Close
              className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
              aria-label="Close"
            >
              <X className="size-5" />
            </D.Close>
          </D.Content>
        </D.Portal>
      </D.Root>
    </>
  );
}
