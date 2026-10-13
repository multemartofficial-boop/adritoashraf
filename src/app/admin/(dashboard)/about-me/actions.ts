"use server";

import { isUniqueViolation, revalidatePublic, runAdminForm } from "@/lib/admin/run";
import { publicPathFromUrl, removePublicFilesByUrl } from "@/lib/storage";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { parseAboutMeForm } from "@/lib/validators/content";

export async function saveAboutMeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseAboutMeForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    const data = parsed.data;

    const { data: before } = await supabase.from("about_me").select("image_url, cv_url").eq("id", 1).maybeSingle();
    const { error } = await supabase
      .from("about_me")
      .upsert({ id: 1, ...data });

    if (isUniqueViolation(error) || error) return { error: "Could not save About Me." };

    // Drop replaced uploads from storage (best-effort, only files we issued).
    const removed = [before?.image_url, before?.cv_url]
      .filter((u): u is string => Boolean(u && ![data.image_url, data.cv_url].includes(u) && publicPathFromUrl(u)));
    if (removed.length) await removePublicFilesByUrl(removed);

    revalidatePublic("/admin/about-me");
    return { success: "About Me saved.", savedAt: Date.now() };
  });
}
