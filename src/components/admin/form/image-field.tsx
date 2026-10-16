"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { FitImage } from "@/components/ui/fit-image";
import { cn } from "@/lib/utils";

/** Upload one image (compressed to WebP in the browser) and store its URL in a hidden input. */
export function ImageField({
  name,
  defaultValue = "",
  folder,
  aspect = "aspect-video",
  error,
}: {
  name: string;
  defaultValue?: string;
  folder:
    | "projects"
    | "services"
    | "testimonials"
    | "site"
    | "media"
    | "about"
    | "gifts";
  aspect?: string;
  error?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, folder);
      setUrl(uploaded.url);
      toast.success("Image uploaded. Save the form to apply it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        id={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0])}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      <div
        className={cn(
          "relative w-full max-w-md overflow-hidden rounded-xl border border-dashed border-admin-border bg-black/[0.02]",
          aspect,
          error && "border-admin-danger",
        )}
      >
        {url ? (
          <FitImage src={url} alt="" sizes="448px" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-admin-muted hover:bg-black/[0.02]"
          >
            <ImagePlus className="size-6" />
            Click to upload (max 5 MB)
          </button>
        )}
        {busy && (
          <div className="absolute inset-0 grid place-items-center bg-white/70">
            <Loader2 className="size-5 animate-spin text-admin-muted" />
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <Upload /> {url ? "Replace" : "Upload"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setUrl("")}
            disabled={busy}
          >
            <Trash2 /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}
