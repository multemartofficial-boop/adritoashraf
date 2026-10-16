import "server-only";
import { serverEnv } from "@/lib/env/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ATTACHMENT_TYPES,
  IMAGE_TYPES,
  validateUpload,
  type AllowedMime,
} from "./validate";

export type StoredObject = {
  path: string;
  url: string;
  size: number;
  mime: string;
  createdAt: string | null;
};
export type BucketKind = "public" | "private";

// Swap this interface's implementation to move off Supabase Storage (e.g. S3, local disk).
export interface StorageProvider {
  put(
    kind: BucketKind,
    path: string,
    bytes: Uint8Array,
    mime: AllowedMime,
  ): Promise<void>;
  remove(kind: BucketKind, paths: string[]): Promise<void>;
  list(kind: BucketKind, prefix: string): Promise<StoredObject[]>;
  publicUrl(path: string): string;
  signedUrl(path: string, expiresInSeconds?: number): Promise<string>;
  usageBytes(kind: BucketKind): Promise<number>;
}

// Uses the service-role client: callers MUST verify the admin session (or validate the
// public booking request) before calling.
function supabaseStorage(): StorageProvider {
  const env = serverEnv();
  const bucket = (kind: BucketKind) =>
    supabaseAdmin().storage.from(
      kind === "public"
        ? env.STORAGE_PUBLIC_BUCKET
        : env.STORAGE_PRIVATE_BUCKET,
    );

  const provider: StorageProvider = {
    async put(kind, path, bytes, mime) {
      const { error } = await bucket(kind).upload(path, bytes, {
        contentType: mime,
        cacheControl: "31536000",
        upsert: false,
      });
      if (error) throw new Error(`Storage upload failed: ${error.message}`);
    },
    async remove(kind, paths) {
      if (paths.length === 0) return;
      const { error } = await bucket(kind).remove(paths);
      if (error) throw new Error(`Storage delete failed: ${error.message}`);
    },
    async list(kind, prefix) {
      const { data, error } = await bucket(kind).list(prefix, {
        limit: 1000,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw new Error(`Storage list failed: ${error.message}`);
      return data
        .filter((o) => o.id)
        .map((o) => {
          const path = prefix ? `${prefix}/${o.name}` : o.name;
          return {
            path,
            url: kind === "public" ? provider.publicUrl(path) : "",
            size: Number(o.metadata?.size ?? 0),
            mime: String(o.metadata?.mimetype ?? ""),
            createdAt: o.created_at ?? null,
          };
        });
    },
    publicUrl(path) {
      return bucket("public").getPublicUrl(path).data.publicUrl;
    },
    async signedUrl(path, expiresInSeconds = 300) {
      const { data, error } = await bucket("private").createSignedUrl(
        path,
        expiresInSeconds,
      );
      if (error) throw new Error(`Signed URL failed: ${error.message}`);
      return data.signedUrl;
    },
    async usageBytes(kind) {
      // Uploads are stored one folder deep (`folder/file`), so two levels cover everything.
      const { data: root, error } = await bucket(kind).list("", {
        limit: 1000,
      });
      if (error) throw new Error(`Storage list failed: ${error.message}`);
      const folders = root.filter((o) => !o.id).map((o) => o.name);
      const rootBytes = root.reduce(
        (sum, o) => sum + Number(o.metadata?.size ?? 0),
        0,
      );
      const nested = await Promise.all(
        folders.map((f) => provider.list(kind, f)),
      );
      return rootBytes + nested.flat().reduce((sum, o) => sum + o.size, 0);
    },
  };
  return provider;
}

let provider: StorageProvider | undefined;
export function storage(): StorageProvider {
  provider ??= supabaseStorage();
  return provider;
}

const randomName = (ext: string) => `${crypto.randomUUID()}.${ext}`;

export const MEDIA_FOLDERS = [
  "projects",
  "services",
  "testimonials",
  "site",
  "media",
  "about",
  "webinars",
] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

/** Storage path for a public-bucket URL we issued, or null for anything else. */
export function publicPathFromUrl(url: string): string | null {
  if (!url) return null;
  const env = serverEnv();
  const prefix = `${env.SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/${env.STORAGE_PUBLIC_BUCKET}/`;
  if (!url.startsWith(prefix)) return null;
  const path = decodeURIComponent(url.slice(prefix.length));
  return isSafeMediaPath(path) ? path : null;
}

export function isSafeMediaPath(path: string): boolean {
  const [folder, file, ...rest] = path.split("/");
  return (
    rest.length === 0 &&
    MEDIA_FOLDERS.includes(folder as MediaFolder) &&
    /^[a-f0-9-]{36}\.(jpg|png|webp|avif|gif|pdf)$/.test(file ?? "")
  );
}

/** Best-effort delete of uploaded files referenced by URL (ignores foreign URLs). */
export async function removePublicFilesByUrl(urls: string[]) {
  const paths = urls
    .map(publicPathFromUrl)
    .filter((p): p is string => Boolean(p));
  if (paths.length)
    await storage()
      .remove("public", paths)
      .catch((e) => console.error("[storage cleanup]", e));
}

/** Validate + upload a site file (image or PDF) to the public bucket. Returns its public URL and path. */
export async function uploadSiteFile(file: File, folder: MediaFolder) {
  const v = await validateUpload(file, [...IMAGE_TYPES, "application/pdf"]);
  const path = `${folder}/${randomName(v.ext)}`;
  await storage().put("public", path, v.bytes, v.mime);
  return { path, url: storage().publicUrl(path), size: v.size, mime: v.mime };
}

/** Validate + upload a client booking attachment to the private bucket. Returns its path. */
export async function uploadBookingAttachment(file: File) {
  const v = await validateUpload(file, ATTACHMENT_TYPES);
  const now = new Date();
  const path = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}/${randomName(v.ext)}`;
  await storage().put("private", path, v.bytes, v.mime);
  return { path, size: v.size, mime: v.mime };
}
