"use client";

import { useState } from "react";
import type { ServiceRow } from "@/types/database";
import type { FormState } from "@/lib/forms";
import { parseServiceForm, SERVICE_ICONS, slugify } from "@/lib/validators/content";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ListField } from "@/components/admin/form/list-field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ServiceIcon } from "@/components/service-icon";

type Action = (state: FormState, fd: FormData) => Promise<FormState>;

export function ServiceForm({ action, service }: { action: Action; service?: ServiceRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(action, parseServiceForm);
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(service));
  const [icon, setIcon] = useState(service?.icon ?? "code");

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title="Service">
        <Field label="Title" htmlFor="title" error={errors.title}>
          <Input
            {...errProps("title", errors.title)}
            defaultValue={service?.title}
            onChange={(e) => !slugTouched && setSlug(slugify(e.target.value))}
            placeholder="Website Development"
          />
        </Field>
        <Field label="Slug" htmlFor="slug" error={errors.slug} hint="Used to preselect this service in the booking form.">
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
          <Textarea {...errProps("description", errors.description)} rows={3} defaultValue={service?.description} />
        </Field>
        <Field label="What is included" htmlFor="includes" error={errors.includes} className="md:col-span-2">
          <ListField name="includes" defaultValue={service?.includes} max={15} error={errors.includes} placeholder="e.g. Admin panel to edit content" />
        </Field>
      </FormSection>

      <FormSection title="Pricing & timeline" description="“Starting from” prices. Enter both currencies; visitors choose which to see.">
        <Field label="Starting price (USD $)" htmlFor="price_usd" error={errors.price_usd}>
          <Input {...errProps("price_usd", errors.price_usd)} type="number" min={0} step="1" inputMode="decimal" defaultValue={service?.price_usd ?? 0} />
        </Field>
        <Field label="Starting price (BDT ৳)" htmlFor="price_bdt" error={errors.price_bdt}>
          <Input {...errProps("price_bdt", errors.price_bdt)} type="number" min={0} step="1" inputMode="decimal" defaultValue={service?.price_bdt ?? 0} />
        </Field>
        <Field label="Typical timeline" htmlFor="timeline" error={errors.timeline}>
          <Input {...errProps("timeline", errors.timeline)} defaultValue={service?.timeline} placeholder="2 - 4 weeks" />
        </Field>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Icon</legend>
          <input type="hidden" name="icon" value={icon} />
          <div className="flex flex-wrap gap-2">
            {SERVICE_ICONS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setIcon(name)}
                aria-pressed={icon === name}
                aria-label={name}
                className={cn(
                  "grid size-10 place-items-center rounded-xl border border-admin-border bg-white text-admin-muted transition-colors hover:text-admin-text",
                  icon === name && "border-admin-text bg-neutral-950 text-white hover:text-white",
                )}
              >
                <ServiceIcon name={name} className="size-4" />
              </button>
            ))}
          </div>
        </fieldset>
        <label className="flex items-center gap-3 md:col-span-2">
          <Switch name="is_published" defaultChecked={service?.is_published ?? true} />
          <span className="text-sm font-medium">Published</span>
        </label>
      </FormSection>

      <FormActions pending={pending} cancelHref="/admin/services" label={service ? "Save service" : "Create service"} />
    </form>
  );
}
