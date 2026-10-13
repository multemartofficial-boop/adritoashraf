"use server";

import { revalidatePublic, runAdmin, runAdminForm, isUniqueViolation } from "@/lib/admin/run";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { idSchema } from "@/lib/validators/content";
import { parseBlockedDateForm } from "@/lib/validators/booking";

const refresh = () => revalidatePublic("/admin/blocked-dates", "/admin/availability", "/admin");

export async function addBlockedDateAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseBlockedDateForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    const { error } = await supabase.from("blocked_dates").insert(parsed.data);
    if (isUniqueViolation(error)) return { fieldErrors: { date: "That date is already blocked." } };
    if (error) return { error: "Could not block the date." };

    refresh();
    return { success: "Date blocked.", savedAt: Date.now() };
  });
}

export async function removeBlockedDateAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid date." };
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    if (error) return { ok: false, error: "Could not remove." };
    refresh();
    return { ok: true };
  });
}
