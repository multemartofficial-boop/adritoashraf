"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import { leadSchema } from "@/lib/validators/contact";
import { zodFieldErrors, type FieldErrors } from "@/lib/forms";
import { track } from "@/lib/track";

/** Name + email signup for a gift landing page; posts to /api/lp/subscribe. */
export function LeadForm({ slug, buttonLabel }: { slug: string; buttonLabel: string }) {
  const router = useRouter();
  const startedAt = useRef(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = { name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), slug };
    const parsed = leadSchema.safeParse(values);
    if (!parsed.success) {
      const fe = zodFieldErrors(parsed.error);
      setErrors(fe);
      document.getElementById(`lead-${Object.keys(fe)[0]}`)?.focus();
      return;
    }
    setErrors({});
    setFormError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/lp/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          website: String(fd.get("website") ?? ""),
          form_started_at: startedAt.current,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; redirect?: string; error?: string; fieldErrors?: FieldErrors };
      if (res.ok && body.ok) {
        track("checklist_form_submit", { slug });
        router.push(body.redirect ?? `/${slug}/thank-you`);
        return;
      }
      if (body.fieldErrors) setErrors(body.fieldErrors);
      setFormError(body.error ?? "Something went wrong. Please try again.");
      setSubmitting(false);
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      {/* Honeypot: hidden from humans, filled by bots. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden>
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="lead-name" className="sr-only">
          Your name
        </label>
        <input
          id="lead-name"
          name="name"
          className="field-public"
          placeholder="Your name"
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "lead-name-error" : undefined}
        />
        {errors.name && (
          <p id="lead-name-error" className="mt-1 text-xs text-rose-300">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="lead-email" className="sr-only">
          Email address
        </label>
        <input
          id="lead-email"
          name="email"
          type="email"
          className="field-public"
          placeholder="you@company.com"
          autoComplete="email"
          inputMode="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "lead-email-error" : undefined}
        />
        {errors.email && (
          <p id="lead-email-error" className="mt-1 text-xs text-rose-300">
            {errors.email}
          </p>
        )}
      </div>

      {formError && (
        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7C4DFF,#F78FD0)] px-6 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_24px_rgb(124_77_255/0.55)] disabled:opacity-60"
      >
        {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
        {buttonLabel}
        {!submitting && <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />}
      </button>
    </form>
  );
}
