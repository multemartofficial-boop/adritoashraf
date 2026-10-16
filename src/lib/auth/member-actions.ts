"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env/public";
import {
  magicLinkSchema,
  memberLoginSchema,
  memberSignupSchema,
  resetPasswordSchema,
  resetRequestSchema,
  safeMemberPath,
} from "@/lib/validators/auth";
import { getClientIp, rateLimit, resetRateLimit } from "./rate-limit";
import { zodFieldErrors, type FormState } from "@/lib/forms";

const LOCKOUT_WINDOW = 15 * 60;
const GENERIC_LOGIN_ERROR = "Invalid email or password.";

async function siteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return host ? `${proto}://${host}` : publicEnv.NEXT_PUBLIC_SITE_URL;
}

export async function memberLoginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = memberLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { error: GENERIC_LOGIN_ERROR };
  const { email, password, next } = parsed.data;

  const emailKey = `mlogin:email:${email}`;
  try {
    const ip = await getClientIp();
    const [ipOk, emailOk] = await Promise.all([
      rateLimit(`mlogin:ip:${ip}`, 20, LOCKOUT_WINDOW),
      rateLimit(emailKey, 5, LOCKOUT_WINDOW),
    ]);
    if (!ipOk || !emailOk)
      return {
        error: "Too many attempts. Please wait 15 minutes and try again.",
      };
  } catch {
    return {
      error: "Sign-in is temporarily unavailable. Please try again shortly.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return {
      error:
        error?.message === "Email not confirmed"
          ? "Please confirm your email first — check your inbox."
          : GENERIC_LOGIN_ERROR,
    };
  }

  await resetRateLimit(emailKey);
  redirect(safeMemberPath(next));
}

export async function memberSignupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = memberSignupSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
  const { full_name, email, next } = parsed.data;

  try {
    const ip = await getClientIp();
    if (!(await rateLimit(`msignup:ip:${ip}`, 10, LOCKOUT_WINDOW))) {
      return {
        error: "Too many attempts. Please wait 15 minutes and try again.",
      };
    }
  } catch {
    return {
      error: "Sign-up is temporarily unavailable. Please try again shortly.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const base = await siteUrl();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: { full_name },
      emailRedirectTo: `${base}/auth/callback`,
    },
  });
  if (error) {
    if (/already (registered|exists)/i.test(error.message))
      return {
        error: "An account with this email already exists. Try signing in.",
      };
    return { error: "Could not create the account. Please try again." };
  }

  // Email confirmation enabled: no session yet — user must click the email link.
  if (!data.session) {
    return {
      success: "Account created! Check your email to confirm it, then sign in.",
    };
  }
  redirect(safeMemberPath(next));
}

/** Magic link / passwordless sign-in (also creates the account on first use). */
export async function magicLinkAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
    next: formData.get("next") || undefined,
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };
  const { email, next } = parsed.data;

  try {
    const ip = await getClientIp();
    if (!(await rateLimit(`magic:ip:${ip}`, 10, LOCKOUT_WINDOW))) {
      return {
        error: "Too many attempts. Please wait 15 minutes and try again.",
      };
    }
  } catch {
    return { error: "Temporarily unavailable. Please try again shortly." };
  }

  const supabase = await createSupabaseServerClient();
  const base = await siteUrl();
  const nextPath = safeMemberPath(next);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${base}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      shouldCreateUser: true,
    },
  });
  if (error) return { error: "Could not send the link. Please try again." };
  return { success: "Check your email — we sent you a sign-in link." };
}

export async function forgotPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  try {
    const ip = await getClientIp();
    if (!(await rateLimit(`pwreset:ip:${ip}`, 10, LOCKOUT_WINDOW))) {
      return {
        error: "Too many attempts. Please wait 15 minutes and try again.",
      };
    }
  } catch {
    return { error: "Temporarily unavailable. Please try again shortly." };
  }

  const supabase = await createSupabaseServerClient();
  const base = await siteUrl();
  // Deliberately vague — don't reveal whether the email exists.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${base}/auth/callback?next=${encodeURIComponent("/reset-password")}`,
  });
  return {
    success: "If that email is registered, a reset link is on its way.",
  };
}

export async function resetPasswordAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: zodFieldErrors(parsed.error) };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return { error: "Your reset link has expired. Please request a new one." };

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error)
    return { error: "Could not update the password. Please try again." };
  redirect("/dashboard");
}

export async function memberLogoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
