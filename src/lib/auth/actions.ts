"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { changePasswordSchema, loginSchema, safeAdminPath } from "@/lib/validators/auth";
import { getClientIp, rateLimit, resetRateLimit } from "./rate-limit";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { requireAdminAction } from "./session";

const LOCKOUT_WINDOW = 15 * 60;
const GENERIC_LOGIN_ERROR = "Invalid email or password.";

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { error: GENERIC_LOGIN_ERROR };
  const { email, password, next } = parsed.data;

  const emailKey = `login:email:${email}`;
  try {
    const ip = await getClientIp();
    const [ipOk, emailOk] = await Promise.all([
      rateLimit(`login:ip:${ip}`, 20, LOCKOUT_WINDOW),
      rateLimit(emailKey, 5, LOCKOUT_WINDOW),
    ]);
    if (!ipOk || !emailOk) return { error: "Too many attempts. Please wait 15 minutes and try again." };
  } catch {
    return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return { error: GENERIC_LOGIN_ERROR };

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: GENERIC_LOGIN_ERROR };
  }

  await resetRateLimit(emailKey);
  redirect(safeAdminPath(next));
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await requireAdminAction();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const key = `pwchange:${session.userId}`;
  if (!(await rateLimit(key, 5, LOCKOUT_WINDOW).catch(() => false))) {
    return { error: "Too many attempts. Please wait 15 minutes." };
  }

  // Re-authenticate with the current password before allowing the change.
  const { error: reauthError } = await session.supabase.auth.signInWithPassword({
    email: session.email,
    password: parsed.data.currentPassword,
  });
  if (reauthError) return { fieldErrors: { currentPassword: "Current password is incorrect." } };

  const { error } = await session.supabase.auth.updateUser({ password: parsed.data.newPassword });
  if (error) return { error: "Could not update the password. Please try again." };

  // Sign out every other device that still holds the old session.
  await session.supabase.auth.signOut({ scope: "others" });
  await resetRateLimit(key);
  return { success: "Password updated. Other devices have been signed out." };
}
