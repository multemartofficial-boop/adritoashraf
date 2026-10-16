"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, Mail } from "lucide-react";
import { magicLinkAction, memberLoginAction } from "@/lib/auth/member-actions";
import type { FormState } from "@/lib/forms";

export function MemberLoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    memberLoginAction,
    {},
  );
  const [magic, magicAction, magicPending] = useActionState<
    FormState,
    FormData
  >(magicLinkAction, {});
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="next" value={next} />
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(state.error)}
            className="field-public"
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-violet hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.error)}
              className="field-public pr-10"
            />
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
          </div>
        </div>

        <p
          role="alert"
          aria-live="polite"
          className="min-h-5 text-sm text-rose-600"
        >
          {state.error}
        </p>

        <button
          type="submit"
          disabled={pending}
          className="bg-cta flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogIn className="size-4" />
          )}
          {pending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div
        className="flex items-center gap-3 text-xs text-neutral-400"
        aria-hidden
      >
        <span className="h-px flex-1 bg-neutral-200" /> or{" "}
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <form action={magicAction} noValidate>
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="email" value={email} />
        {magic.success ? (
          <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-center text-sm text-emerald-700">
            {magic.success}
          </p>
        ) : (
          <>
            <button
              type="submit"
              disabled={magicPending || !email.includes("@")}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-60"
            >
              {magicPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Mail className="size-4" />
              )}
              Email me a sign-in link
            </button>
            {magic.error && (
              <p
                role="alert"
                className="mt-2 text-center text-sm text-rose-600"
              >
                {magic.error}
              </p>
            )}
          </>
        )}
      </form>
    </div>
  );
}
