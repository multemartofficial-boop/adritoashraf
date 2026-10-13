"use server";

import { revalidatePublic, runAdminForm } from "@/lib/admin/run";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { parseAvailabilityForm, parseBookingSettingsForm } from "@/lib/validators/booking";

/** Replaces every weekly availability window with the submitted set. */
export async function saveAvailabilityAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseAvailabilityForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    const { error: delError } = await supabase.from("availability_rules").delete().gte("weekday", 0);
    if (delError) return { error: "Could not update availability." };

    if (parsed.data.windows.length) {
      const { error } = await supabase.from("availability_rules").insert(parsed.data.windows);
      if (error) return { error: "Could not update availability." };
    }

    revalidatePublic("/admin/availability", "/admin");
    return { success: "Availability saved. New slots apply immediately.", savedAt: Date.now() };
  });
}

/** Booking rules: slot length, buffer, caps, notice windows, timezone, Meet link, auto-confirm. */
export async function saveBookingSettingsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseBookingSettingsForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    const { error } = await supabase.from("booking_settings").upsert({ id: 1, ...parsed.data });
    if (error) return { error: "Could not save settings." };

    revalidatePublic("/admin/availability", "/admin");
    return { success: "Booking settings saved.", savedAt: Date.now() };
  });
}
