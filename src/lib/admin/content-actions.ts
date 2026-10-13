"use server";

import { z } from "zod";
import { revalidatePublic, runAdmin } from "@/lib/admin/run";
import { removePublicFilesByUrl } from "@/lib/storage";
import type { ActionResult } from "@/lib/forms";
import { contentTableSchema, idListSchema, idSchema, type ContentTable } from "@/lib/validators/content";

const ADMIN_PATH: Record<ContentTable, string> = {
  projects: "/admin/projects",
  services: "/admin/services",
  testimonials: "/admin/testimonials",
  process_steps: "/admin/process",
  faqs: "/admin/faqs",
};

export async function setPublishedAction(table: ContentTable, id: string, value: boolean): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const t = contentTableSchema.parse(table);
    const { error } = await supabase.from(t).update({ is_published: z.boolean().parse(value) }).eq("id", idSchema.parse(id));
    if (error) return { ok: false, error: "Could not update visibility." };
    revalidatePublic(ADMIN_PATH[t]);
    return { ok: true };
  });
}

export async function reorderAction(table: ContentTable, ids: string[]): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const t = contentTableSchema.parse(table);
    const list = idListSchema.parse(ids);
    const results = await Promise.all(
      list.map((id, i) => supabase.from(t).update({ sort_order: i + 1 }).eq("id", id)),
    );
    if (results.some((r) => r.error)) return { ok: false, error: "Could not save the new order." };
    revalidatePublic(ADMIN_PATH[t]);
    return { ok: true };
  });
}

export async function deleteItemAction(table: ContentTable, id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const t = contentTableSchema.parse(table);
    const itemId = idSchema.parse(id);

    // Collect uploaded files owned by the row so they can be removed from storage too.
    const files: string[] = [];
    if (t === "projects") {
      const [{ data: p }, { data: imgs }] = await Promise.all([
        supabase.from("projects").select("cover_image").eq("id", itemId).maybeSingle(),
        supabase.from("project_images").select("image_url").eq("project_id", itemId),
      ]);
      if (p?.cover_image) files.push(p.cover_image);
      imgs?.forEach((i) => files.push(i.image_url));
    } else if (t === "testimonials") {
      const { data } = await supabase.from("testimonials").select("avatar_url, poster_url").eq("id", itemId).maybeSingle();
      if (data) files.push(data.avatar_url, data.poster_url);
    }

    const { error } = await supabase.from(t).delete().eq("id", itemId);
    if (error) return { ok: false, error: "Could not delete this item." };
    await removePublicFilesByUrl(files);
    revalidatePublic(ADMIN_PATH[t]);
    return { ok: true };
  });
}
