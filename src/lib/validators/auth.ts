import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(8).max(200),
  next: z.string().max(500).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(12, "Use at least 12 characters.")
      .max(200)
      .regex(/[a-z]/, "Add a lowercase letter.")
      .regex(/[A-Z]/, "Add an uppercase letter.")
      .regex(/[0-9]/, "Add a number."),
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "Choose a different password.",
  });

/** Only allow redirects back into /admin (prevents open redirects). */
export function safeAdminPath(next: string | undefined | null): string {
  if (
    !next ||
    !next.startsWith("/admin") ||
    next.startsWith("//") ||
    next.startsWith("/admin/login")
  ) {
    return "/admin";
  }
  return next;
}

// ---------------------------------------------------------------------------
// Member accounts (webinar area)
// ---------------------------------------------------------------------------
export const memberPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .max(200);

export const memberSignupSchema = z.object({
  full_name: z.string().trim().min(2, "Enter your name.").max(80),
  email: z
    .email("Enter a valid email address.")
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
  password: memberPasswordSchema,
  next: z.string().max(500).optional(),
});

export const memberLoginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1).max(200),
  next: z.string().max(500).optional(),
});

export const magicLinkSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
  next: z.string().max(500).optional(),
});

export const resetRequestSchema = z.object({
  email: z
    .email("Enter a valid email address.")
    .max(254)
    .transform((v) => v.trim().toLowerCase()),
});

export const resetPasswordSchema = z
  .object({
    password: memberPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

/**
 * Only allow redirects inside this site and away from /admin —
 * members land on /dashboard by default (prevents open redirects).
 */
export function safeMemberPath(next: string | undefined | null): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/admin") ||
    next.startsWith("/api")
  ) {
    return "/dashboard";
  }
  if (
    ["/login", "/signup", "/forgot-password", "/reset-password"].some((p) =>
      next.startsWith(p),
    )
  )
    return "/dashboard";
  return next;
}
