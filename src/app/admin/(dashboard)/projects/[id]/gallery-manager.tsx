"use client";

import { useRef, useState, useTransition } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Images,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ProjectImageRow } from "@/types/database";
import { uploadImage } from "@/lib/image-compress";
import { EmptyState } from "@/components/admin/empty-state";
import { Panel } from "@/components/admin/panel";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { FitImage } from "@/components/ui/fit-image";
import { Input } from "@/components/ui/input";
import {
  addProjectImageAction,
  deleteProjectImageAction,
  reorderProjectImagesAction,
  updateProjectImageCaptionAction,
} from "../actions";

const MAX_IMAGES = 24;

export function GalleryManager({
  projectId,
  initial,
}: {
  projectId: string;
  initial: ProjectImageRow[];
}) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, MAX_IMAGES - images.length);
    setUploading({ done: 0, total: list.length });
    for (const [i, file] of list.entries()) {
      try {
        const { url } = await uploadImage(file, "projects");
        const res = await addProjectImageAction(projectId, url);
        if (!res.ok || !res.image) throw new Error(res.error);
        setImages((cur) => [...cur, res.image!]);
      } catch (e) {
        toast.error(
          `${file.name}: ${e instanceof Error && e.message ? e.message : "upload failed"}`,
        );
      }
      setUploading({ done: i + 1, total: list.length });
    }
    setUploading(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= images.length) return;
    const prev = images;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    setImages(next);
    startTransition(async () => {
      const res = await reorderProjectImagesAction(
        projectId,
        next.map((i) => i.id),
      );
      if (!res.ok) {
        setImages(prev);
        toast.error(res.error ?? "Could not reorder.");
      }
    });
  };

  const saveCaption = (img: ProjectImageRow, caption: string) => {
    if (caption === img.caption) return;
    setImages((cur) =>
      cur.map((i) => (i.id === img.id ? { ...i, caption } : i)),
    );
    startTransition(async () => {
      const res = await updateProjectImageCaptionAction(img.id, caption);
      if (res.ok) toast.success("Caption saved");
      else toast.error(res.error ?? "Could not save caption.");
    });
  };

  const remove = async (id: string) => {
    const res = await deleteProjectImageAction(id);
    if (!res.ok) return void toast.error(res.error ?? "Could not delete.");
    setImages((cur) => cur.filter((i) => i.id !== id));
    toast.success("Image deleted");
  };

  return (
    <Panel className="p-5 md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Screenshots gallery</h2>
          <p className="mt-0.5 text-xs text-admin-muted">
            Shown on the project page. Saved instantly. {images.length}/
            {MAX_IMAGES} images.
          </p>
        </div>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
          aria-label="Upload screenshots"
        />
        <Button
          variant="outline"
          onClick={() => fileRef.current?.click()}
          disabled={Boolean(uploading) || images.length >= MAX_IMAGES}
        >
          {uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />}
          {uploading
            ? `Uploading ${uploading.done}/${uploading.total}`
            : "Add screenshots"}
        </Button>
      </div>

      {images.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No screenshots yet"
          description="Upload screenshots of the finished product (max 5 MB each)."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((img, i) => (
            <li
              key={img.id}
              className="overflow-hidden rounded-xl border border-admin-border bg-white"
            >
              <div className="relative aspect-video overflow-hidden bg-black/[0.03]">
                <FitImage
                  src={img.image_url}
                  alt={img.caption || `Screenshot ${i + 1}`}
                  sizes="(min-width:1280px) 33vw, 50vw"
                />
              </div>
              <div className="space-y-2 p-3">
                <label htmlFor={`caption-${img.id}`} className="sr-only">
                  Caption for screenshot {i + 1}
                </label>
                <Input
                  id={`caption-${img.id}`}
                  defaultValue={img.caption}
                  maxLength={200}
                  placeholder="Caption (optional)"
                  onBlur={(e) => saveCaption(img, e.target.value.trim())}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label="Move left"
                    >
                      <ArrowLeft />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => move(i, 1)}
                      disabled={i === images.length - 1}
                      aria-label="Move right"
                    >
                      <ArrowRight />
                    </Button>
                  </div>
                  <ConfirmButton
                    title="Delete screenshot?"
                    description="The image file is removed from storage."
                    onConfirm={() => remove(img.id)}
                  >
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Delete screenshot"
                      className="hover:text-admin-danger"
                    >
                      <Trash2 />
                    </Button>
                  </ConfirmButton>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
