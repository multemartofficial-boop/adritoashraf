import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { MEDIA_FOLDERS, storage } from "@/lib/storage";
import { PageHeader } from "@/components/admin/page-header";
import { MediaGrid, type MediaItem } from "./media-grid";

export const metadata: Metadata = { title: "Media Library" };

export default async function MediaPage() {
  const { supabase } = await requireAdmin();

  const [folders, projects, gallery, testimonials, settings] = await Promise.all([
    Promise.all(MEDIA_FOLDERS.map((f) => storage().list("public", f).catch(() => []))),
    supabase.from("projects").select("cover_image"),
    supabase.from("project_images").select("image_url"),
    supabase.from("testimonials").select("avatar_url, poster_url"),
    supabase.from("site_settings").select("og_image"),
  ]);

  // Which uploaded files are referenced by content (to warn before deleting).
  const used = new Set<string>(
    [
      ...(projects.data ?? []).map((r) => r.cover_image),
      ...(gallery.data ?? []).map((r) => r.image_url),
      ...(testimonials.data ?? []).flatMap((r) => [r.avatar_url, r.poster_url]),
      ...(settings.data ?? []).map((r) => r.og_image),
    ].filter(Boolean),
  );

  const items: MediaItem[] = folders
    .flat()
    .map((o) => ({ ...o, folder: o.path.split("/")[0], inUse: used.has(o.url) }))
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="All uploaded images. Files used by a project, testimonial or setting are marked “In use”."
      />
      <MediaGrid items={items} />
    </div>
  );
}
