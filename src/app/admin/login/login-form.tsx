"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { loginAction } from "@/lib/auth/actions";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(loginAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          autoFocus
          aria-invalid={Boolean(state.error)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-10"
            aria-invalid={Boolean(state.error)}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-xl text-admin-muted hover:text-admin-text"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <p role="alert" aria-live="polite" className="min-h-5 text-sm text-admin-danger">
        {state.error}
      </p>

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
