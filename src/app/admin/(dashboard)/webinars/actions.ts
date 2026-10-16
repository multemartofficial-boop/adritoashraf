"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isUniqueViolation, runAdmin, runAdminForm } from "@/lib/admin/run";
import { publicPathFromUrl, removePublicFilesByUrl, storage } from "@/lib/storage";
import { zodFieldErrors, type ActionResult, type FormState } from "@/lib/forms";
import { idSchema } from "@/lib/validators/content";
import {
  emailListSchema,
  parseWebinarForm,
  resourceTitleSchema,
  resourceUrlSchema,
} from "@/lib/validators/webinar";
import type { WebinarResourceRow } from "@/types/database";

const WEBINARS = "/admin/webinars";
const SLUG_TAKEN = { fieldErrors: { slug: "Another webinar already uses this slug." } };

const refresh = (id?: string) => {
  revalidatePath(WEBINARS);
  revalidatePath("/admin/users");
  if (id) revalidatePath(`${WEBINARS}/${id}`);
};

export async function saveWebinarAction(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  return runAdminForm(async ({ supabase }) => {
    const parsed = parseWebinarForm(formData);
    if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
    const { published, ...rest } = parsed.data;
    const data = { ...rest, status: published ? ("published" as const) : ("draft" as const) };

    if (!id) {
      const { data: created, error } = await supabase.from("webinars").insert(data).select("id").single();
      if (isUniqueViolation(error)) return SLUG_TAKEN;
      if (error || !created) return { error: "Could not create the webinar." };
      refresh();
      redirect(`${WEBINARS}/${created.id}?created=1`);
    }

    const webinarId = idSchema.parse(id);
    const { data: before } = await supabase.from("webinars").select("thumbnail_url").eq("id", webinarId).maybeSingle();
    const { error } = await supabase.from("webinars").update(data).eq("id", webinarId);
    if (isUniqueViolation(error)) return SLUG_TAKEN;
    if (error) return { error: "Could not save the webinar." };
    if (before?.thumbnail_url && before.thumbnail_url !== data.thumbnail_url) {
      await removePublicFilesByUrl([before.thumbnail_url]);
    }
    refresh(webinarId);
    return { success: "Webinar saved.", savedAt: Date.now() };
  });
}

export async function setWebinarStatusAction(id: string, published: boolean): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const { error } = await supabase
      .from("webinars")
      .update({ status: published ? "published" : "draft" })
      .eq("id", idSchema.parse(id));
    if (error) return { ok: false, error: "Could not update the status." };
    refresh(id);
    return { ok: true };
  });
}

export async function deleteWebinarAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const webinarId = idSchema.parse(id);
    const [{ data: webinar }, { data: resources }] = await Promise.all([
      supabase.from("webinars").select("thumbnail_url").eq("id", webinarId).maybeSingle(),
      supabase.from("webinar_resources").select("file_url").eq("webinar_id", webinarId),
    ]);

    const { error } = await supabase.from("webinars").delete().eq("id", webinarId);
    if (error) return { ok: false, error: "Could not delete the webinar." };

    // Best-effort storage cleanup (public thumbnail + private resource files).
    if (webinar?.thumbnail_url && publicPathFromUrl(webinar.thumbnail_url)) {
      await removePublicFilesByUrl([webinar.thumbnail_url]);
    }
    const privatePaths = (resources ?? []).map((r) => r.file_url).filter((u) => !/^https?:\/\//i.test(u));
    if (privatePaths.length) await storage().remove("private", privatePaths).catch(() => {});
    refresh();
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------
export async function addResourceAction(
  webinarId: string,
  title: string,
  fileUrl: string,
): Promise<ActionResult & { resource?: WebinarResourceRow }> {
  let resource: WebinarResourceRow | undefined;
  const res = await runAdmin(async ({ supabase }) => {
    const wid = idSchema.parse(webinarId);
    const t = resourceTitleSchema.safeParse(title);
    const u = resourceUrlSchema.safeParse(fileUrl);
    if (!t.success) return { ok: false, error: "Give the resource a title." };
    if (!u.success) return { ok: false, error: "Upload a file or paste a valid link." };

    const { data: last } = await supabase
      .from("webinar_resources")
      .select("sort_order")
      .eq("webinar_id", wid)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data, error } = await supabase
      .from("webinar_resources")
      .insert({ webinar_id: wid, title: t.data, file_url: u.data, sort_order: (last?.sort_order ?? 0) + 1 })
      .select("*")
      .single();
    if (error || !data) return { ok: false, error: "Could not add the resource." };
    resource = data;
    refresh(wid);
    return { ok: true };
  });
  return { ...res, resource };
}

export async function deleteResourceAction(id: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const rid = idSchema.parse(id);
    const { data } = await supabase.from("webinar_resources").select("file_url, webinar_id").eq("id", rid).maybeSingle();
    const { error } = await supabase.from("webinar_resources").delete().eq("id", rid);
    if (error) return { ok: false, error: "Could not delete the resource." };
    if (data?.file_url && !/^https?:\/\//i.test(data.file_url)) {
      await storage().remove("private", [data.file_url]).catch(() => {});
    }
    if (data) refresh(data.webinar_id);
    return { ok: true };
  });
}

// ---------------------------------------------------------------------------
// Access grants
// ---------------------------------------------------------------------------
export async function grantAccessAction(
  webinarId: string,
  emails: string[],
): Promise<ActionResult & { added?: number; skipped?: number }> {
  let added = 0;
  let skipped = 0;
  const res = await runAdmin(async ({ supabase, userId }) => {
    const wid = idSchema.parse(webinarId);
    const parsed = emailListSchema.safeParse(emails);
    if (!parsed.success) return { ok: false, error: "Add at least one valid email." };

    const unique = [...new Set(parsed.data)];
    const { data: existing } = await supabase.from("webinar_access").select("email").eq("webinar_id", wid).in("email", unique);
    const have = new Set((existing ?? []).map((e) => e.email));
    const toInsert = unique.filter((e) => !have.has(e));
    skipped = unique.length - toInsert.length;

    if (toInsert.length) {
      const { error } = await supabase
        .from("webinar_access")
        .insert(toInsert.map((email) => ({ webinar_id: wid, email, granted_by: userId })));
      if (error) return { ok: false, error: "Could not grant access." };
      added = toInsert.length;
    }
    refresh(wid);
    return { ok: true };
  });
  return { ...res, added, skipped };
}

export async function revokeAccessAction(accessId: string): Promise<ActionResult> {
  return runAdmin(async ({ supabase }) => {
    const { data } = await supabase
      .from("webinar_access")
      .select("webinar_id")
      .eq("id", idSchema.parse(accessId))
      .maybeSingle();
    const { error } = await supabase.from("webinar_access").delete().eq("id", accessId);
    if (error) return { ok: false, error: "Could not revoke access." };
    if (data) refresh(data.webinar_id);
    return { ok: true };
  });
}

/** Grant or revoke a specific webinar for one user — used from the Users page. */
export async function setUserWebinarAccessAction(
  webinarId: string,
  email: string,
  grant: boolean,
): Promise<ActionResult> {
  return runAdmin(async ({ supabase, userId }) => {
    const wid = idSchema.parse(webinarId);
    const parsed = emailListSchema.safeParse([email]);
    if (!parsed.success) return { ok: false, error: "Invalid email." };
    const target = parsed.data[0];

    if (grant) {
      const { error } = await supabase
        .from("webinar_access")
        .upsert({ webinar_id: wid, email: target, granted_by: userId }, { onConflict: "webinar_id,email" });
      if (error) return { ok: false, error: "Could not grant access." };
    } else {
      const { error } = await supabase.from("webinar_access").delete().eq("webinar_id", wid).eq("email", target);
      if (error) return { ok: false, error: "Could not revoke access." };
    }
    revalidatePath("/admin/users");
    revalidatePath(`${WEBINARS}/${wid}`);
    return { ok: true };
  });
}
