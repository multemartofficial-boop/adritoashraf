"use client";

import { useActionState, useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import type { z } from "zod";
import { zodFieldErrors, type FieldErrors, type FormState } from "@/lib/forms";

type Action = (state: FormState, formData: FormData) => Promise<FormState>;
type Parser = (fd: FormData) => z.ZodSafeParseResult<unknown>;

/**
 * Runs the same zod parser in the browser (instant feedback, no round trip) and
 * then submits to the server action, which validates again.
 */
export function useAdminForm(action: Action, parse: Parser) {
  const [state, formAction, pending] = useActionState(action, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors | null>(null);

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    const result = parse(new FormData(e.currentTarget));
    if (!result.success) {
      e.preventDefault();
      setClientErrors(zodFieldErrors(result.error));
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setClientErrors(null);
  };

  const errors: FieldErrors = clientErrors ?? state.fieldErrors ?? {};
  return { formAction, onSubmit, pending, errors, state };
}
