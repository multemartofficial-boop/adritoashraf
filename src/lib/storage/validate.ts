export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const;
export const ATTACHMENT_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

export type AllowedMime = (typeof IMAGE_TYPES)[number] | (typeof ATTACHMENT_TYPES)[number];

const EXTENSIONS: Record<AllowedMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "application/pdf": "pdf",
};

const ascii = (b: Uint8Array, start: number, end: number) => String.fromCharCode(...b.subarray(start, end));

// Detect the real type from file signature bytes; never trust the client-sent MIME type.
export function sniffMime(bytes: Uint8Array): AllowedMime | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(bytes, 1, 4) === "PNG") return "image/png";
  if (ascii(bytes, 0, 4) === "GIF8") return "image/gif";
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp";
  if (ascii(bytes, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(bytes, 8, 12))) return "image/avif";
  if (ascii(bytes, 0, 5) === "%PDF-") return "application/pdf";
  return null;
}

export type ValidatedFile = { bytes: Uint8Array; mime: AllowedMime; ext: string; size: number };

export class UploadError extends Error {}

export async function validateUpload(
  file: File,
  allowed: readonly AllowedMime[] = IMAGE_TYPES,
): Promise<ValidatedFile> {
  if (!file || file.size === 0) throw new UploadError("No file provided.");
  if (file.size > MAX_UPLOAD_BYTES) throw new UploadError("File is larger than 5 MB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = sniffMime(bytes);
  if (!mime || !allowed.includes(mime)) throw new UploadError("Unsupported file type.");
  return { bytes, mime, ext: EXTENSIONS[mime], size: file.size };
}
