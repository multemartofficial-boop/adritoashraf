import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Shows the whole image inside a fixed-ratio frame without cropping: a blurred,
 * saturated copy of the same image fills the leftover space, and the sharp image
 * sits in an inset "window" with a ring + shadow, so any aspect ratio reads as a
 * framed screenshot instead of empty bars.
 * The parent must be `relative` + `overflow-hidden`.
 */
export function FitImage({
  src,
  alt,
  sizes,
  className,
  priority,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <>
      <Image
        src={src}
        alt=""
        aria-hidden
        fill
        sizes={sizes}
        className="scale-[1.6] object-cover opacity-75 blur-3xl saturate-150"
      />
      {/* Slight dim + edge vignette so the blurred backdrop reads as a mat, not a gap */}
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_30%,transparent_55%,rgb(0_0_0/0.35))]" />
      <div className="absolute inset-2.5 overflow-hidden rounded-[1.1rem] shadow-[0_18px_50px_rgb(0_0_0/0.35)] ring-1 ring-white/25 sm:inset-4">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-contain", className)}
        />
      </div>
    </>
  );
}
