"use client";

import { useActionState, useEffect, useRef } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/lib/auth/actions";
import type { FormState } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FIELDS = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  { name: "newPassword", label: "New password", autoComplete: "new-password" },
  { name: "confirmPassword", label: "Confirm new password", autoComplete: "new-password" },
] as const;

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(changePasswordAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      formRef.current?.reset();
    }
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form ref={formRef} action={action} className="mt-5 space-y-4" noValidate>
      {FIELDS.map((f) => {
        const err = state.fieldErrors?.[f.name];
        return (
          <div key={f.name} className="space-y-1.5">
            <Label htmlFor={f.name}>{f.label}</Label>
            <Input
              id={f.name}
              name={f.name}
              type="password"
              autoComplete={f.autoComplete}
              required
              aria-invalid={Boolean(err)}
              aria-describedby={err ? `${f.name}-error` : undefined}
            />
            {err && (
              <p id={`${f.name}-error`} className="text-xs text-admin-danger">
                {err}
              </p>
            )}
          </div>
        );
      })}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
        Update password
      </Button>
    </form>
  );
}
