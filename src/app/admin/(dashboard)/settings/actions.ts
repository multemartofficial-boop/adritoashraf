"use server";

import { revalidatePublic, runAdminForm } from "@/lib/admin/run";
import { removePublicFilesByUrl } from "@/lib/storage";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { parseSiteSettingsForm } from "@/lib/validators/content";

export async function saveSiteSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseSiteSettingsForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    const { data: before } = await supabase.from("site_settings").select("og_image").eq("id", 1).maybeSingle();
    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...parsed.data });
    if (error) return { error: "Could not save settings." };
    if (before?.og_image && before.og_image !== parsed.data.og_image) await removePublicFilesByUrl([before.og_image]);

    revalidatePublic("/admin/settings", "/admin");
    return { success: "Settings saved. The public site is updated.", savedAt: Date.now() };
  });
}
