"use client";

import { useState } from "react";
import type { ProjectRow } from "@/types/database";
import type { FormState } from "@/lib/forms";
import { CARD_THEMES, parseProjectForm, slugify } from "@/lib/validators/content";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ImageField } from "@/components/admin/form/image-field";
import { ListField } from "@/components/admin/form/list-field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CARD_THEME_META } from "./card-themes";

type Action = (state: FormState, fd: FormData) => Promise<FormState>;

export function ProjectForm({ action, project }: { action: Action; project?: ProjectRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(action, parseProjectForm);
  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [theme, setTheme] = useState(project?.card_theme ?? "sky");

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title="Basics" description="The title is shown as bold sans + italic serif accent, e.g. “Web Development”.">
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input
            {...errProps("title", errors.title)}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Cycle Shop"
            required
          />
        </Field>
        <Field label="Italic accent word" htmlFor="title_accent" error={errors.title_accent} hint="Optional, e.g. “Platform”.">
          <Input {...errProps("title_accent", errors.title_accent)} defaultValue={project?.title_accent} />
        </Field>
        <Field label="URL slug" htmlFor="slug" error={errors.slug} hint={`Page address: /projects/${slug || "your-slug"}`}>
          <Input
            {...errProps("slug", errors.slug)}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </Field>
        <Field label="Live URL" htmlFor="live_url" error={errors.live_url} hint="Optional link to the live website.">
          <Input {...errProps("live_url", errors.live_url)} type="url" defaultValue={project?.live_url} placeholder="https://" />
        </Field>
        <Field label="Short description" htmlFor="short_description" error={errors.short_description} className="md:col-span-2">
          <Textarea
            {...errProps("short_description", errors.short_description)}
            rows={2}
            defaultValue={project?.short_description}
          />
        </Field>
        <Field label="Card tags" htmlFor="tags" error={errors.tags} hint="Glass chips on the portfolio card (up to 10)." className="md:col-span-2">
          <ListField name="tags" defaultValue={project?.tags} max={10} error={errors.tags} placeholder="e.g. Dashboard" />
        </Field>
      </FormSection>

      <FormSection title="Case study" description="Shown on the project detail page.">
        <Field label="Problem" htmlFor="problem" error={errors.problem}>
          <Textarea {...errProps("problem", errors.problem)} rows={5} defaultValue={project?.problem} />
        </Field>
        <Field label="Solution" htmlFor="solution" error={errors.solution}>
          <Textarea {...errProps("solution", errors.solution)} rows={5} defaultValue={project?.solution} />
        </Field>
        <Field label="Key features" htmlFor="features" error={errors.features} className="md:col-span-2">
          <ListField name="features" defaultValue={project?.features} max={20} error={errors.features} placeholder="e.g. Online servicing bookings" />
        </Field>
        <Field label="Tech stack" htmlFor="tech_stack" error={errors.tech_stack} className="md:col-span-2">
          <ListField name="tech_stack" defaultValue={project?.tech_stack} max={30} error={errors.tech_stack} placeholder="e.g. Next.js" />
        </Field>
        <Field label="Duration" htmlFor="duration" error={errors.duration}>
          <Input {...errProps("duration", errors.duration)} defaultValue={project?.duration} placeholder="2 months" />
        </Field>
        <Field label="My role" htmlFor="role" error={errors.role}>
          <Input {...errProps("role", errors.role)} defaultValue={project?.role} placeholder="Full stack developer" />
        </Field>
      </FormSection>

      <FormSection title="Appearance">
        <Field label="Cover image" htmlFor="cover_image" error={errors.cover_image} hint="Shown on the card and as the hover preview. 16:9 works best.">
          <ImageField name="cover_image" folder="projects" defaultValue={project?.cover_image} error={errors.cover_image} />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Card background</legend>
          <input type="hidden" name="card_theme" value={theme} />
          <div className="grid gap-2">
            {CARD_THEMES.map((t) => (
              <label
                key={t}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border border-admin-border bg-white p-2 text-sm transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-admin-info/30",
                  theme === t && "border-admin-text",
                )}
              >
                <input type="radio" name="card_theme_choice" value={t} checked={theme === t} onChange={() => setTheme(t)} className="sr-only" />
                <span className={cn("h-8 w-14 rounded-lg", CARD_THEME_META[t].swatch)} />
                {CARD_THEME_META[t].label}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch name="is_published" defaultChecked={project?.is_published ?? false} />
          <span className="text-sm">
            <span className="font-medium">Published</span>
            <span className="block text-xs text-admin-muted">Visible on the public site.</span>
          </span>
        </label>
      </FormSection>

      <FormSection title="SEO" description="Optional overrides for this project page. Leave empty to use the generated values.">
        <Field label="Meta title" htmlFor="seo_title" error={errors.seo_title} hint="Default: project title. About 50–60 characters.">
          <Input {...errProps("seo_title", errors.seo_title)} defaultValue={project?.seo_title} maxLength={70} />
        </Field>
        <Field label="Focus keyword" htmlFor="focus_keyword" error={errors.focus_keyword} hint="Main search term for this page.">
          <Input {...errProps("focus_keyword", errors.focus_keyword)} defaultValue={project?.focus_keyword} />
        </Field>
        <Field label="Meta description" htmlFor="seo_description" error={errors.seo_description} className="md:col-span-2" hint="Default: short description. About 150 characters.">
          <Textarea {...errProps("seo_description", errors.seo_description)} rows={2} defaultValue={project?.seo_description} maxLength={170} />
        </Field>
        <Field label="Cover image alt text" htmlFor="cover_image_alt" error={errors.cover_image_alt} hint="Describe the cover for screen readers and Google Images.">
          <Input {...errProps("cover_image_alt", errors.cover_image_alt)} defaultValue={project?.cover_image_alt} />
        </Field>
        <Field label="Canonical URL" htmlFor="canonical_url" error={errors.canonical_url} hint="Only if this page also exists elsewhere.">
          <Input {...errProps("canonical_url", errors.canonical_url)} type="url" defaultValue={project?.canonical_url} placeholder="https://" />
        </Field>
        <Field label="Social share image" htmlFor="og_image" error={errors.og_image} hint="Default: cover image. 1200 × 630 recommended." className="md:col-span-2">
          <ImageField name="og_image" folder="projects" defaultValue={project?.og_image} error={errors.og_image} />
        </Field>
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch name="noindex" defaultChecked={project?.noindex ?? false} />
          <span className="text-sm">
            <span className="font-medium">Hide from search engines</span>
            <span className="block text-xs text-admin-muted">Adds noindex and removes the page from the sitemap.</span>
          </span>
        </label>
      </FormSection>

      <FormActions pending={pending} cancelHref="/admin/projects" label={project ? "Save project" : "Create project"} />
    </form>
  );
}
