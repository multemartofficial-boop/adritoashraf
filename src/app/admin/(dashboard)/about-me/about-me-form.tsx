"use client";

import type { AboutMeRow } from "@/types/database";
import { parseAboutMeForm, SOCIAL_PLATFORMS } from "@/lib/validators/content";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ImageField } from "@/components/admin/form/image-field";
import { FileField } from "@/components/admin/form/file-field";
import { ListField } from "@/components/admin/form/list-field";
import { RowsField } from "@/components/admin/form/rows-field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { saveAboutMeAction } from "./actions";

export function AboutMeForm({ about: a }: { about: AboutMeRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(saveAboutMeAction, parseAboutMeForm);
  const e = errors;

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="rounded-2xl border border-admin-border bg-white/60 px-5 py-4">
        <label className="flex items-center gap-3">
          <Switch name="is_visible" defaultChecked={a.is_visible} />
          <span className="text-sm">
            <span className="font-medium">Show the About Me section</span>
            <span className="block text-xs text-admin-muted">Hidden sections are removed from the homepage entirely.</span>
          </span>
        </label>
      </div>

      <FormSection title="Content" description="Tag pill, the three-colour heading and the bio paragraphs.">
        <Field label="Tag pill" htmlFor="tag" error={e.tag}>
          <Input {...errProps("tag", e.tag)} defaultValue={a.tag} placeholder="About Me" />
        </Field>
        <div className="hidden md:block" />
        <Field label="Orange part" htmlFor="heading_accent" error={e["heading.accent"]}>
          <Input id="heading_accent" name="heading_accent" defaultValue={a.heading.accent ?? ""} placeholder="Hi, I'm Adrito," />
        </Field>
        <Field label="Grey part (faded)" htmlFor="heading_muted" error={e["heading.muted"]}>
          <Input id="heading_muted" name="heading_muted" defaultValue={a.heading.muted ?? ""} placeholder="Who Builds Real Products." />
        </Field>
        <Field label="Black part" htmlFor="heading_strong" error={e["heading.strong"]} className="md:col-span-2">
          <Input id="heading_strong" name="heading_strong" defaultValue={a.heading.strong ?? ""} placeholder="A Full Stack Developer" />
        </Field>
        <Field label="Bio paragraph 1" htmlFor="bio_1" error={e.bio_1} className="md:col-span-2">
          <Textarea {...errProps("bio_1", e.bio_1)} rows={3} defaultValue={a.bio_1} />
        </Field>
        <Field label="Bio paragraph 2" htmlFor="bio_2" error={e.bio_2} className="md:col-span-2">
          <Textarea {...errProps("bio_2", e.bio_2)} rows={3} defaultValue={a.bio_2} />
        </Field>
      </FormSection>

      <FormSection title="Details" description="The small info grid under the bio.">
        <Field label="Full name" htmlFor="full_name" error={e.full_name}>
          <Input {...errProps("full_name", e.full_name)} defaultValue={a.full_name} />
        </Field>
        <Field label="Role" htmlFor="role" error={e.role}>
          <Input {...errProps("role", e.role)} defaultValue={a.role} />
        </Field>
        <Field label="Location" htmlFor="location" error={e.location}>
          <Input {...errProps("location", e.location)} defaultValue={a.location} />
        </Field>
        <Field label="Years of experience" htmlFor="experience_years" error={e.experience_years} hint="Shown as “N years”.">
          <Input {...errProps("experience_years", e.experience_years)} defaultValue={a.experience_years} placeholder="4+" />
        </Field>
        <Field label="Email" htmlFor="email" error={e.email}>
          <Input {...errProps("email", e.email)} type="email" defaultValue={a.email} />
        </Field>
        <Field label="Experience badge" htmlFor="experience_badge" error={e.experience_badge} hint="Floating chip on the photo card.">
          <Input {...errProps("experience_badge", e.experience_badge)} defaultValue={a.experience_badge} placeholder="4+ Years Experience" />
        </Field>
        <Field label="Availability badge" htmlFor="availability_text" error={e.availability_text} hint="Green-dot pill on the photo card." className="md:col-span-2">
          <Input {...errProps("availability_text", e.availability_text)} defaultValue={a.availability_text} placeholder="Available for projects" />
        </Field>
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch name="availability_enabled" defaultChecked={a.availability_enabled} />
          <span className="text-sm">
            <span className="font-medium">Available for projects</span>
            <span className="block text-xs text-admin-muted">Off hides the photo badge and shows “Currently booked” in the info grid.</span>
          </span>
        </label>
      </FormSection>

      <FormSection title="Skills & social" description="Skill chips and the social icon row.">
        <Field label="Skills" htmlFor="skills" error={e.skills} hint="One chip each, up to 30." className="md:col-span-2">
          <ListField name="skills" defaultValue={a.skills} max={30} error={e.skills} placeholder="e.g. Next.js" />
        </Field>
        <Field label="Social links" error={e.social_links} hint="Leave a URL empty to skip the icon." className="md:col-span-2">
          <RowsField
            name="social_links"
            defaultValue={a.social_links}
            max={10}
            addLabel="Add social link"
            errors={e}
            columns={[
              { key: "platform", label: "Platform", options: SOCIAL_PLATFORMS, className: "sm:max-w-40" },
              { key: "url", label: "URL", placeholder: "https://" },
            ]}
          />
        </Field>
      </FormSection>

      <FormSection title="Buttons & media" description="The two action buttons, the CV file and the profile photo.">
        <Field label="Primary button label" htmlFor="primary_cta_label" error={e.primary_cta_label}>
          <Input {...errProps("primary_cta_label", e.primary_cta_label)} defaultValue={a.primary_cta_label} placeholder="Let's Talk" />
        </Field>
        <Field label="Primary button link" htmlFor="primary_cta_href" error={e.primary_cta_href} hint="e.g. /book or #book">
          <Input {...errProps("primary_cta_href", e.primary_cta_href)} defaultValue={a.primary_cta_href} />
        </Field>
        <Field label="CV / résumé" htmlFor="cv_url" error={e.cv_url} hint="Upload a PDF or paste a URL — the Download CV button opens it in a new tab." className="md:col-span-2">
          <FileField name="cv_url" folder="about" defaultValue={a.cv_url} error={e.cv_url} />
        </Field>
        <Field label="Profile image" htmlFor="image_url" error={e.image_url} hint="Portrait works best — shown inside the gradient card." className="md:col-span-2">
          <ImageField name="image_url" folder="about" defaultValue={a.image_url} aspect="aspect-[4/5]" error={e.image_url} />
        </Field>
      </FormSection>

      <FormActions pending={pending} label="Save About Me" />
    </form>
  );
}
