import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(254).transform((v) => v.trim().toLowerCase()),
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
  if (!next || !next.startsWith("/admin") || next.startsWith("//") || next.startsWith("/admin/login")) {
    return "/admin";
  }
  return next;
}
