"use server";

import { revalidatePath } from "next/cache";
import { isUniqueViolation, runAdmin, runAdminForm } from "@/lib/admin/run";
import { parseContact } from "@/lib/validators/contact";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";

const EMAIL_TAKEN = { fieldErrors: { email: "A contact with this email already exists." } };

/** Adds a contact by hand (source = 'manual'). */
export async function createContactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseContact(formData);
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  return runAdminForm(async ({ supabase }) => {
    const { error } = await supabase.from("contacts").insert({ ...parsed.data, source: "manual" });
    if (isUniqueViolation(error)) return EMAIL_TAKEN;
    if (error) return { error: "Could not add the contact." };
    revalidatePath("/admin/contacts");
    return { success: "Contact added.", savedAt: Date.now() };
  });
}

/** Edits name/email/phone/notes. The source never changes. */
export async function updateContactAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseContact(formData);
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  return runAdminForm(async ({ supabase }) => {
    const { error } = await supabase.from("contacts").update(parsed.data).eq("id", id);
    if (isUniqueViolation(error)) return EMAIL_TAKEN;
    if (error) return { error: "Could not save the contact." };
    revalidatePath("/admin/contacts");
    return { success: "Contact saved.", savedAt: Date.now() };
  });
}

export async function deleteContactAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const { error } = await supabase.from("contacts").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/admin/contacts");
    return { ok: true };
  });
}
