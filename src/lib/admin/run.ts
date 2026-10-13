import "server-only";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { getAdminSession, type AdminSession } from "@/lib/auth/session";
import type { ActionResult, FormState } from "@/lib/forms";

const SESSION_EXPIRED = "Your session has expired. Please sign in again.";
const GENERIC = "Something went wrong. Please try again.";

/** Re-checks the admin session and turns unexpected errors into a safe message. */
export async function runAdminForm(fn: (session: AdminSession) => Promise<FormState>): Promise<FormState> {
  const session = await getAdminSession();
  if (!session) return { error: SESSION_EXPIRED };
  try {
    return await fn(session);
  } catch (err) {
    unstable_rethrow(err); // let redirect()/notFound() through
    console.error("[admin action]", err);
    return { error: GENERIC };
  }
}

export async function runAdmin(fn: (session: AdminSession) => Promise<ActionResult>): Promise<ActionResult> {
  const session = await getAdminSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  try {
    return await fn(session);
  } catch (err) {
    unstable_rethrow(err);
    console.error("[admin action]", err);
    return { ok: false, error: GENERIC };
  }
}

/** Refresh every public page after content changes. */
export function revalidatePublic(...adminPaths: string[]) {
  revalidatePath("/", "layout");
  adminPaths.forEach((p) => revalidatePath(p));
}

export const isUniqueViolation = (error: { code?: string } | null) => error?.code === "23505";
