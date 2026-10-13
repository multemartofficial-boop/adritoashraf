import type { z } from "zod";

export type FieldErrors = Record<string, string>;
export type FormState = { error?: string; success?: string; fieldErrors?: FieldErrors; savedAt?: number };
export type ActionResult = { ok: boolean; error?: string };

/** Flatten zod issues into { "field": msg, "list.0.href": msg } (first message wins). */
export function zodFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const full = issue.path.map(String).join(".");
    const top = String(issue.path[0] ?? "form");
    out[full] ??= issue.message;
    out[top] ??= issue.message;
  }
  return out;
}

// FormData readers shared by client-side validation and server actions.
export const fdString = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
};
export const fdBool = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
};
export const fdJson = (fd: FormData, key: string): unknown => {
  try {
    return JSON.parse(fdString(fd, key) || "null");
  } catch {
    return null;
  }
};
