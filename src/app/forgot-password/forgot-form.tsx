"use client";

import { useActionState } from "react";
import { Loader2, Mail } from "lucide-react";
import { forgotPasswordAction } from "@/lib/auth/member-actions";
import type { FormState } from "@/lib/forms";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    forgotPasswordAction,
    {},
  );

  if (state.success) {
    return (
      <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        {state.success}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className="field-public"
        />
        {state.fieldErrors?.email && (
          <p role="alert" className="text-xs text-rose-600">
            {state.fieldErrors.email}
          </p>
        )}
      </div>

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
          <Mail className="size-4" />
        )}
        {pending ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
