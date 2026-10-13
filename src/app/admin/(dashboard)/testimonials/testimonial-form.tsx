"use client";

import { useState } from "react";
import { MessageSquareText, Video } from "lucide-react";
import type { TestimonialRow, TestimonialType } from "@/types/database";
import type { FormState } from "@/lib/forms";
import { parseTestimonialForm } from "@/lib/validators/content";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ImageField } from "@/components/admin/form/image-field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Action = (state: FormState, fd: FormData) => Promise<FormState>;

const TYPES: { value: TestimonialType; label: string; hint: string; icon: typeof Video }[] = [
  { value: "text", label: "Text review", hint: "Avatar, quote and stars", icon: MessageSquareText },
  { value: "video", label: "Video review", hint: "Portrait with a play button", icon: Video },
];

export function TestimonialForm({ action, testimonial }: { action: Action; testimonial?: TestimonialRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(action, parseTestimonialForm);
  const [type, setType] = useState<TestimonialType>(testimonial?.type ?? "text");

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title="Type">
        <input type="hidden" name="type" value={type} />
        <div className="grid gap-3 sm:grid-cols-2 md:col-span-2" role="radiogroup" aria-label="Testimonial type">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              role="radio"
              aria-checked={type === t.value}
              onClick={() => setType(t.value)}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-admin-border bg-white p-3 text-left transition-colors",
                type === t.value && "border-admin-text ring-1 ring-admin-text",
              )}
            >
              <span className="grid size-9 place-items-center rounded-lg bg-black/[0.04]">
                <t.icon className="size-4" />
              </span>
              <span>
                <span className="block text-sm font-medium">{t.label}</span>
                <span className="block text-xs text-admin-muted">{t.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </FormSection>

      <FormSection title="Client">
        <Field label="Client name" htmlFor="client_name" error={errors.client_name}>
          <Input {...errProps("client_name", errors.client_name)} defaultValue={testimonial?.client_name} />
        </Field>
        <Field label="Role and company" htmlFor="client_role" error={errors.client_role} hint="e.g. Owner, Aungko Studio">
          <Input {...errProps("client_role", errors.client_role)} defaultValue={testimonial?.client_role} />
        </Field>
        <Field label="Rating" htmlFor="rating" error={errors.rating}>
          <Select {...errProps("rating", errors.rating)} defaultValue={String(testimonial?.rating ?? 5)}>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {"★".repeat(r)} ({r})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Avatar" htmlFor="avatar_url" error={errors.avatar_url} hint="Square photo, optional.">
          <ImageField name="avatar_url" folder="testimonials" aspect="aspect-square max-w-40" defaultValue={testimonial?.avatar_url} error={errors.avatar_url} />
        </Field>
        <Field
          label={type === "text" ? "Review" : "Short quote (optional)"}
          htmlFor="content"
          error={errors.content}
          className="md:col-span-2"
        >
          <Textarea {...errProps("content", errors.content)} rows={4} defaultValue={testimonial?.content} />
        </Field>
      </FormSection>

      <div className={type === "video" ? "contents" : "hidden"}>
        <FormSection title="Video" description="Paste a YouTube, Vimeo or direct .mp4 link (https).">
          <Field label="Video URL" htmlFor="video_url" error={errors.video_url} className="md:col-span-2">
            <Input {...errProps("video_url", errors.video_url)} type="url" defaultValue={testimonial?.video_url} placeholder="https://www.youtube.com/watch?v=..." />
          </Field>
          <Field label="Poster image" htmlFor="poster_url" error={errors.poster_url} hint="Portrait photo shown before playing.">
            <ImageField name="poster_url" folder="testimonials" aspect="aspect-[3/4] max-w-56" defaultValue={testimonial?.poster_url} error={errors.poster_url} />
          </Field>
        </FormSection>
      </div>

      <FormSection title="Visibility">
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch name="is_published" defaultChecked={testimonial?.is_published ?? true} />
          <span className="text-sm font-medium">Published</span>
        </label>
      </FormSection>

      <FormActions pending={pending} cancelHref="/admin/testimonials" label={testimonial ? "Save testimonial" : "Create testimonial"} />
    </form>
  );
}
