"use server";

import { redirect } from "next/navigation";
import { isUniqueViolation, revalidatePublic, runAdmin, runAdminForm } from "@/lib/admin/run";
import { publicPathFromUrl, removePublicFilesByUrl } from "@/lib/storage";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { captionSchema, idListSchema, idSchema, parseProjectForm } from "@/lib/validators/content";
import type { ProjectImageRow } from "@/types/database";

const SLUG_TAKEN = { fieldErrors: { slug: "Another project already uses this slug." } };

export async function saveProjectAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseProjectForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    const data = parsed.data;

    if (!id) {
      const { data: last } = await supabase
        .from("projects")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { data: created, error } = await supabase
        .from("projects")
        .insert({ ...data, sort_order: (last?.sort_order ?? 0) + 1 })
        .select("id")
        .single();
      if (isUniqueViolation(error)) return SLUG_TAKEN;
      if (error || !created) return { error: "Could not create the project." };
      revalidatePublic("/admin/projects");
      redirect(`/admin/projects/${created.id}?created=1`);
    }

    const projectId = idSchema.parse(id);
    const { data: before } = await supabase.from("projects").select("cover_image").eq("id", projectId).maybeSingle();
    const { error } = await supabase.from("projects").update(data).eq("id", projectId);
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    if (error) return { error: "Could not save the project." };
    if (before?.cover_image && before.cover_image !== data.cover_image) await removePublicFilesByUrl([before.cover_image]);
    revalidatePublic("/admin/projects", `/admin/projects/${projectId}`);
    return { success: "Project saved.", savedAt: Date.now() };
  });
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export async function addProjectImageAction(
  projectId: string,
  url: string,
): Promise<ActionResult & { image?: ProjectImageRow }> {
  let image: ProjectImageRow | undefined;
  const res = await runAdmin(async ({ supabase }) => {
    const pid = idSchema.parse(projectId);
    if (!publicPathFromUrl(url)) return { ok: false, error: "Invalid image." };
    const { data: last } = await supabase
      .from("project_images")
      .select("sort_order")
      .eq("project_id", pid)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("project_images")
      .insert({ project_id: pid, image_url: url, sort_order: (last?.sort_order ?? 0) + 1 })
      .select("*")
      .single();
    if (error || !data) return { ok: false, error: "Could not add the image." };
    image = data;
    revalidatePublic(`/admin/projects/${pid}`);
    return { ok: true };
  });
  return { ...res, image };
}

export async function updateProjectImageCaptionAction(imageId: string, caption: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const parsed = captionSchema.safeParse(caption);
    if (!parsed.success) return { ok: false, error: "Caption is too long." };
    const { error } = await supabase.from("project_images").update({ caption: parsed.data }).eq("id", idSchema.parse(imageId));
    if (error) return { ok: false, error: "Could not save the caption." };
    revalidatePublic();
    return { ok: true };
  });
}

export async function reorderProjectImagesAction(projectId: string, ids: string[]): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const pid = idSchema.parse(projectId);
    const list = idListSchema.parse(ids);
    const results = await Promise.all(
      list.map((id, i) => supabase.from("project_images").update({ sort_order: i + 1 }).eq("id", id).eq("project_id", pid)),
    );
    if (results.some((r) => r.error)) return { ok: false, error: "Could not save the order." };
    revalidatePublic();
    return { ok: true };
  });
}

export async function deleteProjectImageAction(imageId: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const id = idSchema.parse(imageId);
    const { data } = await supabase.from("project_images").select("image_url").eq("id", id).maybeSingle();
    const { error } = await supabase.from("project_images").delete().eq("id", id);
    if (error) return { ok: false, error: "Could not delete the image." };
    if (data) await removePublicFilesByUrl([data.image_url]);
    revalidatePublic();
    return { ok: true };
  });
}
