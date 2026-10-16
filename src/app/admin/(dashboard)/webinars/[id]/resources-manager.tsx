"use client";

import { useRef, useState, useTransition } from "react";
import { ExternalLink, FileText, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { addResourceAction, deleteResourceAction } from "../actions";
import { Panel } from "@/components/admin/panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/admin/empty-state";
import type { WebinarResourceRow } from "@/types/database";

export function ResourcesManager({ webinarId, resources }: { webinarId: string; resources: WebinarResourceRow[] }) {
  const [items, setItems] = useState(resources);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const add = (fileUrl: string, resourceTitle: string) => {
    startTransition(async () => {
      const res = await addResourceAction(webinarId, resourceTitle, fileUrl);
      if (!res.ok) {
        toast.error(res.error ?? "Could not add the resource.");
        return;
      }
      if (res.resource) setItems((cur) => [...cur, res.resource!]);
      setTitle("");
      setUrl("");
      toast.success("Resource added");
    });
  };

  const upload = async (file: File) => {
    if (!title.trim()) {
      toast.error("Give the resource a title first.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      fd.set("webinar_id", webinarId);
      const res = await fetch("/api/admin/webinar-upload", { method: "POST", body: fd });
      const json = (await res.json()) as { path?: string; error?: string };
      if (!res.ok || !json.path) {
        toast.error(json.error ?? "Upload failed.");
        return;
      }
      add(json.path, title.trim());
    } catch {
      toast.error("Upload failed.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const remove = (r: WebinarResourceRow) => {
    if (!confirm(`Remove "${r.title}"?`)) return;
    const prev = items;
    setItems(items.filter((i) => i.id !== r.id));
    startTransition(async () => {
      const res = await deleteResourceAction(r.id);
      if (!res.ok) {
        setItems(prev);
        toast.error(res.error ?? "Could not delete.");
      } else toast.success("Removed");
    });
  };

  const isExternal = (u: string) => /^https?:\/\//i.test(u);
  const busy = pending || uploading;

  return (
    <Panel className="flex flex-col p-5 md:p-6">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Resources</h2>
        <p className="mt-0.5 text-xs text-admin-muted">
          PDFs and slides members can download. Uploaded files stay private — members get expiring links.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState icon={FileText} title="No resources" description="Add a PDF, slide deck or link." />
      ) : (
        <ul className="mb-4 space-y-2">
          {items.map((r) => (
            <li
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-admin-border bg-white px-3.5 py-2.5"
            >
              {isExternal(r.file_url) ? (
                <ExternalLink className="size-4 shrink-0 text-admin-muted" />
              ) : (
                <FileText className="size-4 shrink-0 text-admin-muted" />
              )}
              <span className="min-w-0 flex-1 truncate text-sm">{r.title}</span>
              <span className="hidden text-[11px] text-admin-muted sm:block">{isExternal(r.file_url) ? "Link" : "File"}</span>
              <button
                type="button"
                onClick={() => remove(r)}
                aria-label={`Delete ${r.title}`}
                className="grid size-7 place-items-center rounded-lg text-admin-muted transition-colors hover:bg-rose-50 hover:text-admin-danger"
              >
                <Trash2 className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto space-y-2.5 border-t border-admin-border pt-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resource title (e.g. Slide deck)" aria-label="Resource title" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Link2 className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-admin-muted" />
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Or paste a link (https://…)"
              aria-label="Resource link"
              className="pl-8"
            />
          </div>
          <Button type="button" variant="outline" size="sm" disabled={busy || !title.trim() || !url.trim()} onClick={() => add(url.trim(), title.trim())}>
            {pending ? <Loader2 className="animate-spin" /> : <Link2 />} Add link
          </Button>
          <Button type="button" size="sm" disabled={busy || !title.trim()} onClick={() => fileRef.current?.click()}>
            {uploading ? <Loader2 className="animate-spin" /> : <Upload />} Upload file
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            aria-label="Upload resource file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
            }}
          />
        </div>
        <p className="text-[11px] text-admin-muted">PDF or image, max 5 MB.</p>
      </div>
    </Panel>
  );
}
