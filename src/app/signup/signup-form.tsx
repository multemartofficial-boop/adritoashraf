"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { memberSignupAction } from "@/lib/auth/member-actions";
import type { FormState } from "@/lib/forms";

export function MemberSignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    memberSignupAction,
    {},
  );
  const [show, setShow] = useState(false);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <label htmlFor="full_name" className="block text-sm font-medium">
          Full name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          autoFocus
          aria-invalid={Boolean(errors.full_name)}
          aria-describedby={errors.full_name ? "full_name-error" : undefined}
          className="field-public"
        />
        {errors.full_name && (
          <p
            id="full_name-error"
            role="alert"
            className="text-xs text-rose-600"
          >
            {errors.full_name}
          </p>
        )}
      </div>

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
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          className="field-public"
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-xs text-rose-600">
            {errors.email}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={8}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? "password-error" : "password-hint"
            }
            className="field-public pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center text-neutral-400 hover:text-ink"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password ? (
          <p id="password-error" role="alert" className="text-xs text-rose-600">
            {errors.password}
          </p>
        ) : (
          <p id="password-hint" className="text-xs text-neutral-500">
            At least 8 characters.
          </p>
        )}
      </div>

      {state.error && (
        <p role="alert" aria-live="polite" className="text-sm text-rose-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-700"
        >
          {state.success}{" "}
          <Link href="/login" className="font-semibold underline">
            Sign in
          </Link>
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
          <UserRound className="size-4" />
        )}
        {pending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
