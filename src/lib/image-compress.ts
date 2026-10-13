// Browser-only: downscale + convert images to WebP before upload. The server has no
// image optimizer (shared hosting), so this keeps public pages fast.

const MAX_EDGE = 2400;
const QUALITY = 0.82;
const PASS_THROUGH = new Set(["image/gif", "image/avif", "image/svg+xml"]);

export async function compressImage(file: File): Promise<File> {
  if (PASS_THROUGH.has(file.type) || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale);
    const h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", QUALITY));
    if (!blob || blob.type !== "image/webp" || (blob.size >= file.size && scale === 1)) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

export type UploadedImage = { url: string; path: string; size: number };

export async function uploadImage(file: File, folder: string): Promise<UploadedImage> {
  const prepared = await compressImage(file);
  if (prepared.size > 5 * 1024 * 1024) throw new Error("Image is larger than 5 MB even after compression.");
  const body = new FormData();
  body.append("file", prepared);
  body.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as Partial<UploadedImage> & { error?: string };
  if (!res.ok || !data.url || !data.path) throw new Error(data.error ?? "Upload failed.");
  return { url: data.url, path: data.path, size: data.size ?? prepared.size };
}
