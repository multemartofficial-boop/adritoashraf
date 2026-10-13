"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublic, runAdmin, runAdminForm, isUniqueViolation } from "@/lib/admin/run";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { idSchema, parseRedirectForm } from "@/lib/validators/content";

const refresh = () => {
  revalidatePublic("/admin/redirects");
  revalidatePath("/admin/redirects");
};

export async function addRedirectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseRedirectForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    const from_path = parsed.data.from_path.replace(/\/+$/, "") || "/";

    if (["/admin", "/api", "/book", "/manage-booking"].some((p) => from_path === p || from_path.startsWith(`${p}/`))) {
      return { fieldErrors: { from_path: "Admin, API and booking paths can't be redirected." } };
    }

    const { error } = await supabase.from("redirects").insert({ from_path, to_path: parsed.data.to_path });
    if (isUniqueViolation(error)) return { fieldErrors: { from_path: "A redirect for that path already exists." } };
    if (error) return { error: "Could not add the redirect." };

    refresh();
    return { success: "Redirect added. It is live within a minute.", savedAt: Date.now() };
  });
}

export async function toggleRedirectAction(id: string, isActive: boolean): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid redirect." };
    const { error } = await supabase.from("redirects").update({ is_active: isActive }).eq("id", id);
    if (error) return { ok: false, error: "Could not update." };
    refresh();
    return { ok: true };
  });
}

export async function deleteRedirectAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid redirect." };
    const { error } = await supabase.from("redirects").delete().eq("id", id);
    if (error) return { ok: false, error: "Could not delete." };
    refresh();
    return { ok: true };
  });
}
