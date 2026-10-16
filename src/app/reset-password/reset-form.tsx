"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, KeyRound } from "lucide-react";
import { resetPasswordAction } from "@/lib/auth/member-actions";
import type { FormState } from "@/lib/forms";

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    resetPasswordAction,
    {},
  );
  const [show, setShow] = useState(false);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {(["password", "confirmPassword"] as const).map((field) => (
        <div key={field} className="space-y-1.5">
          <label htmlFor={field} className="block text-sm font-medium">
            {field === "password" ? "New password" : "Repeat new password"}
          </label>
          <div className="relative">
            <input
              id={field}
              name={field}
              type={show ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={Boolean(errors[field])}
              className="field-public pr-10"
            />
            {field === "password" && (
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute inset-y-0 right-0 grid w-10 place-items-center text-neutral-400 hover:text-ink"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            )}
          </div>
          {errors[field] && (
            <p role="alert" className="text-xs text-rose-600">
              {errors[field]}
            </p>
          )}
        </div>
      ))}

      {state.error && (
        <p role="alert" aria-live="polite" className="text-sm text-rose-600">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-cta flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <KeyRound className="size-4" />
        )}
        {pending ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}
