"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Copy, Images, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/image-compress";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { cn } from "@/lib/utils";
import { deleteMediaAction } from "./actions";

export type MediaItem = {
  path: string;
  url: string;
  size: number;
  mime: string;
  createdAt: string | null;
  folder: string;
  inUse: boolean;
};

const FILTERS = ["all", "projects", "services", "testimonials", "site", "media"] as const;

const formatSize = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function MediaGrid({ items: initial }: { items: MediaItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [source, setSource] = useState(initial);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (source !== initial) {
    setSource(initial);
    setItems(initial);
  }

  const visible = useMemo(() => (filter === "all" ? items : items.filter((i) => i.folder === filter)), [items, filter]);
  const total = items.reduce((s, i) => s + i.size, 0);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    let ok = 0;
    for (const file of Array.from(files)) {
      try {
        await uploadImage(file, "media");
        ok++;
      } catch (e) {
        toast.error(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
    if (ok) {
      toast.success(`${ok} image${ok > 1 ? "s" : ""} uploaded`);
      router.refresh();
    }
  };

  const remove = async (path: string) => {
    const res = await deleteMediaAction(path);
    if (!res.ok) return void toast.error(res.error ?? "Could not delete.");
    setItems((cur) => cur.filter((i) => i.path !== path));
    toast.success("File deleted");
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by folder">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full border border-admin-border px-3 py-1 text-xs font-medium capitalize transition-colors",
                filter === f ? "border-neutral-950 bg-neutral-950 text-white" : "bg-white hover:bg-neutral-50",
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-admin-muted">
            {items.length} files · {formatSize(total)}
          </span>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="sr-only"
            onChange={(e) => onFiles(e.target.files)}
            aria-label="Upload images"
          />
          <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
            Upload
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <Panel>
          <EmptyState icon={Images} title="No images here" description="Uploaded images appear here. Max 5 MB each; converted to WebP automatically." />
        </Panel>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {visible.map((m) => (
            <li key={m.path} className="group overflow-hidden rounded-xl border border-admin-border bg-white shadow-xs">
              <div className="relative aspect-square bg-[repeating-conic-gradient(#f1f5f9_0_25%,#fff_0_50%)] bg-[length:16px_16px]">
                <Image src={m.url} alt="" fill sizes="(min-width:1536px) 16vw, (min-width:1024px) 25vw, 50vw" className="object-contain" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge className="bg-white/90 capitalize backdrop-blur">{m.folder}</Badge>
                  {m.inUse && (
                    <Badge tone="success" className="backdrop-blur">
                      In use
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <span className="truncate text-xs text-admin-muted">{formatSize(m.size)}</span>
                <div className="flex">
                  <Button variant="ghost" size="icon-sm" onClick={() => copy(m.url)} aria-label="Copy image URL">
                    <Copy />
                  </Button>
                  <ConfirmButton
                    title="Delete this image?"
                    description={
                      m.inUse
                        ? "This image is used on the site. Deleting it will leave an empty spot until you choose another image."
                        : "The file is permanently removed from storage."
                    }
                    onConfirm={() => remove(m.path)}
                  >
                    <Button variant="ghost" size="icon-sm" aria-label="Delete image" className="hover:text-admin-danger">
                      <Trash2 />
                    </Button>
                  </ConfirmButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
