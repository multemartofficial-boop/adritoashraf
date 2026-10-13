"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { runAdmin, runAdminForm } from "@/lib/admin/run";
import type { AdminSession } from "@/lib/auth/session";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { idSchema } from "@/lib/validators/content";
import { bookingStatusActionSchema, parseBookingAdminUpdate } from "@/lib/validators/booking";
import { issueManageToken, sendBookingEmail } from "@/lib/email/booking-emails";
import { storage } from "@/lib/storage";
import type { BookingRow, Database } from "@/types/database";

const refresh = () => {
  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
};

/** confirm / cancel / complete. Emails the client on confirm and cancel. */
export async function setBookingStatusAction(id: string, action: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const idOk = idSchema.safeParse(id);
    const act = bookingStatusActionSchema.safeParse(action);
    if (!idOk.success || !act.success) return { ok: false, error: "Invalid request." };

    const { data: current } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
    if (!current) return { ok: false, error: "Booking not found." };

    const allowed: Record<typeof act.data, BookingRow["status"][]> = {
      confirm: ["pending"],
      cancel: ["pending", "confirmed"],
      complete: ["confirmed", "pending"],
    };
    if (!allowed[act.data].includes(current.status)) {
      return { ok: false, error: `Cannot ${act.data} a ${current.status} booking.` };
    }

    const patch: Database["public"]["Tables"]["bookings"]["Update"] =
      act.data === "confirm"
        ? { status: "confirmed", meeting_link: current.meeting_link || (await defaultMeetLink(supabase)) }
        : act.data === "cancel"
          ? { status: "cancelled", cancelled_at: new Date().toISOString(), cancelled_by: "admin" }
          : { status: "completed" };

    const { data: updated, error } = await supabase.from("bookings").update(patch).eq("id", id).select("*").single();
    if (error || !updated) return { ok: false, error: "Could not update the booking." };

    if (act.data === "confirm") {
      after(async () => {
        const token = await issueManageToken(id);
        await sendBookingEmail("booking_confirmed_client", updated, { manageToken: token });
      });
    } else if (act.data === "cancel") {
      after(() => sendBookingEmail("cancelled_client", updated));
    }

    refresh();
    return { ok: true };
  });
}

async function defaultMeetLink(supabase: AdminSession["supabase"]) {
  const { data } = await supabase.from("booking_settings").select("meeting_link_default").eq("id", 1).maybeSingle();
  return data?.meeting_link_default ?? "";
}

/** Meeting link + private notes. */
export async function updateBookingDetailsAction(id: string, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { error: "Invalid booking." };
    const parsed = parseBookingAdminUpdate(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

    const { error } = await supabase.from("bookings").update(parsed.data).eq("id", id);
    if (error) return { error: "Could not save." };
    refresh();
    return { success: "Saved.", savedAt: Date.now() };
  });
}

/** Short-lived signed URL for the client's private attachment. */
export async function getAttachmentUrlAction(id: string): Promise<ActionResult & { url?: string }> {
  return runAdmin(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid booking." };
    const { data } = await supabase.from("bookings").select("attachment_path").eq("id", id).maybeSingle();
    if (!data?.attachment_path) return { ok: false, error: "No attachment." };
    const url = await storage().signedUrl(data.attachment_path, 300);
    return { ok: true, url };
  });
}

/** Permanently remove a cancelled/completed booking (and its attachment). */
export async function deleteBookingAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    if (!idSchema.safeParse(id).success) return { ok: false, error: "Invalid booking." };
    const { data } = await supabase.from("bookings").select("status, attachment_path").eq("id", id).maybeSingle();
    if (!data) return { ok: false, error: "Booking not found." };
    if (data.status === "pending" || data.status === "confirmed") {
      return { ok: false, error: "Cancel the booking before deleting it." };
    }
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) return { ok: false, error: "Could not delete." };
    if (data.attachment_path) await storage().remove("private", [data.attachment_path]).catch(() => {});
    refresh();
    return { ok: true };
  });
}
