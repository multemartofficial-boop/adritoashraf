"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Upload one file (PDF/image — passed through uncompressed for non-images) or
 * paste a URL. The final value lives in the named input the form reads.
 */
export function FileField({
  name,
  defaultValue = "",
  folder,
  accept = "application/pdf,image/jpeg,image/png,image/webp",
  error,
}: {
  name: string;
  defaultValue?: string;
  folder: string;
  accept?: string;
  error?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileName = url.split("/").pop() ?? "";

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const uploaded = await uploadImage(file, folder);
      setUrl(uploaded.url);
      toast.success("File uploaded. Save the form to apply it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={accept} className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
      {url && (
        <div className="flex items-center gap-3 rounded-xl border border-admin-border bg-black/[0.02] px-4 py-3">
          <FileText className="size-5 shrink-0 text-admin-muted" />
          <span className="min-w-0 flex-1 truncate text-sm" title={url}>
            {fileName}
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-admin-muted hover:text-admin-text" aria-label="Open file">
            <ExternalLink className="size-4" />
          </a>
          <button type="button" onClick={() => setUrl("")} className="text-admin-muted hover:text-admin-danger" aria-label="Remove file">
            <Trash2 className="size-4" />
          </button>
        </div>
      )}
      <div className={cn("flex gap-2", busy && "pointer-events-none opacity-60")}>
        <Input
          id={name}
          name={name}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… or upload"
          aria-describedby={error ? `${name}-error` : undefined}
          className="flex-1"
        />
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload
        </Button>
      </div>
    </div>
  );
}
