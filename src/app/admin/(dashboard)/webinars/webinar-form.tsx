"use client";

import { useState } from "react";
import type { WebinarRow } from "@/types/database";
import type { FormState } from "@/lib/forms";
import { parseWebinarForm } from "@/lib/validators/webinar";
import { slugify } from "@/lib/validators/content";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ImageField } from "@/components/admin/form/image-field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type Action = (state: FormState, fd: FormData) => Promise<FormState>;

/** ISO instant -> "YYYY-MM-DDTHH:mm" for a datetime-local input (browser local tz). */
const toLocalInput = (iso: string | null) => (iso ? new Date(iso).toLocaleString("sv-SE").replace(" ", "T").slice(0, 16) : "");

export function WebinarForm({ action, webinar }: { action: Action; webinar?: WebinarRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(action, parseWebinarForm);
  const [slug, setSlug] = useState(webinar?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(webinar));

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title="Webinar">
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input
            {...errProps("title", errors.title)}
            defaultValue={webinar?.title}
            onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
            placeholder="Custom software for small business"
          />
        </Field>
        <Field label="Slug" htmlFor="slug" error={errors.slug} hint="Internal identifier — lowercase, dashes only.">
          <Input
            {...errProps("slug", errors.slug)}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </Field>
        <Field label="Description" htmlFor="description" error={errors.description} className="md:col-span-2">
          <Textarea {...errProps("description", errors.description)} rows={4} defaultValue={webinar?.description} placeholder="What attendees will learn, who it's for…" />
        </Field>
      </FormSection>

      <FormSection title="Schedule" description="Times are in your device's timezone; members see them in GMT+6.">
        <Field label="Starts at" htmlFor="start_at" error={errors.start_at}>
          <Input {...errProps("start_at", errors.start_at)} type="datetime-local" defaultValue={toLocalInput(webinar?.start_at ?? null)} />
        </Field>
        <Field label="Ends at" htmlFor="end_at" error={errors.end_at} hint="Used to show the 'Live now' badge.">
          <Input {...errProps("end_at", errors.end_at)} type="datetime-local" defaultValue={toLocalInput(webinar?.end_at ?? null)} />
        </Field>
      </FormSection>

      <FormSection title="Links & media">
        <Field label="Thumbnail" htmlFor="thumbnail_url" error={errors.thumbnail_url} className="md:col-span-2">
          <ImageField name="thumbnail_url" folder="webinars" defaultValue={webinar?.thumbnail_url ?? ""} />
        </Field>
        <Field label="Live link" htmlFor="live_url" error={errors.live_url} hint="Zoom or Google Meet URL — only visible to members with access.">
          <Input {...errProps("live_url", errors.live_url)} type="url" defaultValue={webinar?.live_url} placeholder="https://meet.google.com/…" />
        </Field>
        <Field label="Recording link" htmlFor="recording_url" error={errors.recording_url} hint="YouTube (unlisted), Vimeo or a direct video URL.">
          <Input {...errProps("recording_url", errors.recording_url)} type="url" defaultValue={webinar?.recording_url} placeholder="https://youtube.com/watch?v=…" />
        </Field>
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch name="published" defaultChecked={webinar?.status === "published"} />
          <span className="text-sm font-medium">Published — members with access can see it</span>
        </label>
      </FormSection>

      <FormActions pending={pending} cancelHref="/admin/webinars" label={webinar ? "Save webinar" : "Create webinar"} />
    </form>
  );
}
