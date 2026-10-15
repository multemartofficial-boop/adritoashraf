import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Shows the whole image inside a fixed-ratio frame without cropping: a blurred,
 * scaled copy of the same image fills the leftover space instead of empty bars.
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
        className="scale-125 object-cover opacity-60 blur-2xl"
      />
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn("object-contain", className)}
      />
    </>
  );
}
