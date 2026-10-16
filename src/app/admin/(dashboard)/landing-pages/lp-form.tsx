"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { FileText, Loader2, Trash2, Upload } from "lucide-react";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ImageField } from "@/components/admin/form/image-field";
import { ListField } from "@/components/admin/form/list-field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { landingPageSchema, landingPageFromFormData, type LandingPageInput } from "@/lib/validators/landing-page";
import { LP_TEMPLATE } from "@/lib/landing-page-shared";
import type { LandingPageRow } from "@/types/database";
import { saveLandingPageAction } from "./actions";

/** Private-bucket upload for the gift file (PDF/image, max 5 MB). */
function GiftFileField({ defaultValue, error }: { defaultValue: string; error?: string }) {
  const [path, setPath] = useState(defaultValue);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileName = path.split("/").pop() ?? "";

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/gift-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed.");
      setPath(data.path);
      toast.success("Gift file uploaded. Save the form to apply it.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name="gift_file" value={path} />
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Upload gift file"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      {path ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-admin-border bg-black/[0.02] px-3 py-2.5">
          <span className="flex min-w-0 items-center gap-2 text-sm">
            <FileText className="size-4 shrink-0 text-violet-600" />
            <span className="truncate">{fileName}</span>
          </span>
          <button
            type="button"
            onClick={() => setPath("")}
            className="shrink-0 rounded-lg p-1.5 text-admin-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
            aria-label="Remove gift file"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload gift file
        </Button>
      )}
      {error && <p className="text-xs text-admin-danger">{error}</p>}
    </div>
  );
}

export function LpForm({ page }: { page?: LandingPageRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(saveLandingPageAction, (fd) =>
    landingPageSchema.safeParse(landingPageFromFormData(fd)),
  );
  const d: LandingPageInput = page
    ? {
        ...page,
        heading: {
          accent: page.heading?.accent ?? "",
          strong: page.heading?.strong ?? "",
          muted: page.heading?.muted ?? "",
        },
      }
    : LP_TEMPLATE;
  const [giftType, setGiftType] = useState<LandingPageInput["gift_type"]>(d.gift_type ?? "pdf");

  return (
    <form action={formAction} onSubmit={onSubmit} className="space-y-6">
      {page && <input type="hidden" name="id" value={page.id} />}

      <FormSection title="Basics" description="Internal name, public URL slug and visibility.">
        <Field label="Internal name" htmlFor="internal_name" error={errors.internal_name}>
          <Input defaultValue={d.internal_name} placeholder="7-Step Checklist — Excel to Software" {...errProps("internal_name", errors.internal_name)} />
        </Field>
        <Field label="Public URL" htmlFor="slug" error={errors.slug} hint="Visitors open yoursite.com/slug — lowercase letters, numbers, dashes.">
          <div className="flex items-center gap-2">
            <span className="text-sm text-admin-muted">/</span>
            <Input defaultValue={d.slug} placeholder="free-guide" {...errProps("slug", errors.slug)} />
          </div>
        </Field>
        <Field label="Status" htmlFor="status" error={errors.status} hint="Draft pages return 404 for visitors.">
          <Select id="status" name="status" defaultValue={d.status}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </Field>
      </FormSection>

      <FormSection title="Landing content" description="What visitors see above the signup form.">
        <Field label="Pill badge text" htmlFor="pill_text" error={errors.pill_text}>
          <Input id="pill_text" name="pill_text" defaultValue={d.pill_text} placeholder="Free Gift" />
        </Field>
        <Field label="Cover tag" htmlFor="cover_tag" error={errors.cover_tag}>
          <Input id="cover_tag" name="cover_tag" defaultValue={d.cover_tag} placeholder="100% Free" />
        </Field>
        <Field label="Headline — accent part" htmlFor="heading_accent" error={errors["heading.accent"]}>
          <Input id="heading_accent" name="heading_accent" defaultValue={d.heading?.accent} placeholder="Stop running your business on spreadsheets." />
        </Field>
        <Field label="Headline — strong part" htmlFor="heading_strong" error={errors["heading.strong"]}>
          <Input id="heading_strong" name="heading_strong" defaultValue={d.heading?.strong} placeholder="7-Step Checklist:" />
        </Field>
        <Field label="Headline — muted part" htmlFor="heading_muted" error={errors["heading.muted"]} className="md:col-span-2">
          <Input id="heading_muted" name="heading_muted" defaultValue={d.heading?.muted} placeholder="move from Excel to real software, the right way." />
        </Field>
        <Field label="Subheadline" htmlFor="subheadline" error={errors.subheadline} className="md:col-span-2">
          <Textarea id="subheadline" name="subheadline" rows={3} defaultValue={d.subheadline} />
        </Field>
        <Field label="What's inside" className="md:col-span-2" hint="3–5 bullets, press Enter after each.">
          <ListField name="bullets" defaultValue={d.bullets} max={6} error={errors.bullets} placeholder="What readers get" />
        </Field>
        <Field label="Who this is for" htmlFor="audience_line" error={errors.audience_line} className="md:col-span-2">
          <Input id="audience_line" name="audience_line" defaultValue={d.audience_line} placeholder="For business owners buried in spreadsheets…" />
        </Field>
      </FormSection>

      <FormSection title="Gift cover" description="The mockup image shown next to the form.">
        <Field label="Cover image" className="md:col-span-2" error={errors.cover_image}>
          <ImageField name="cover_image" folder="gifts" defaultValue={d.cover_image} aspect="aspect-[4/5]" />
        </Field>
      </FormSection>

      <FormSection
        title="Signup form"
        description="Paste the Hostinger Reach embed snippet (or just the form ID). The form's own button text + redirect to /your-slug/thank-you are set inside Hostinger Reach."
      >
        <Field label="Form button / heading text" htmlFor="cta_label" error={errors.cta_label}>
          <Input id="cta_label" name="cta_label" defaultValue={d.cta_label} placeholder="Send me the free checklist" />
        </Field>
        <Field label="Privacy line" htmlFor="privacy_line" error={errors.privacy_line}>
          <Input id="privacy_line" name="privacy_line" defaultValue={d.privacy_line} placeholder="No spam. Unsubscribe anytime." />
        </Field>
        <Field
          label="Reach form embed code"
          htmlFor="form_embed"
          error={errors.form_embed}
          hint='Paste the full snippet like <div data-reach-form="your-id"></div> — or just the form ID.'
          className="md:col-span-2"
        >
          <Textarea id="form_embed" name="form_embed" rows={3} defaultValue={d.form_embed} placeholder='<div data-reach-form="xxxxxxxx-…"></div>' />
        </Field>
      </FormSection>

      <FormSection title="The gift" description="What subscribers get. The link is only revealed on the thank-you page, never in the landing page HTML.">
        <Field label="Gift type" htmlFor="gift_type" error={errors.gift_type}>
          <Select id="gift_type" name="gift_type" value={giftType} onChange={(e) => setGiftType(e.target.value as LandingPageInput["gift_type"])}>
            <option value="pdf">File upload (PDF)</option>
            <option value="link">External link (Drive / Notion)</option>
            <option value="video">Video tutorial</option>
          </Select>
        </Field>
        {giftType === "pdf" ? (
          <Field label="Gift file" hint="PDF or image, max 5 MB — stored privately.">
            <GiftFileField defaultValue={d.gift_file ?? ""} error={errors.gift_file} />
          </Field>
        ) : (
          <Field label={giftType === "video" ? "Video URL" : "Resource URL"} htmlFor="gift_url" error={errors.gift_url}>
            <Input type="url" defaultValue={d.gift_url} placeholder="https://…" {...errProps("gift_url", errors.gift_url)} />
          </Field>
        )}
      </FormSection>

      <FormSection title="Thank-you page" description="Shown after the form redirect, at /your-slug/thank-you.">
        <Field label="Title" htmlFor="thank_you_title" error={errors.thank_you_title}>
          <Input id="thank_you_title" name="thank_you_title" defaultValue={d.thank_you_title} placeholder="You're all set!" />
        </Field>
        <Field label="Next-step button" htmlFor="next_step_label" error={errors.next_step_label}>
          <Input id="next_step_label" name="next_step_label" defaultValue={d.next_step_label} placeholder="Book a free 15-minute call" />
        </Field>
        <Field label="Text" htmlFor="thank_you_text" error={errors.thank_you_text} className="md:col-span-2">
          <Textarea id="thank_you_text" name="thank_you_text" rows={2} defaultValue={d.thank_you_text} placeholder="Your checklist is ready — grab it below." />
        </Field>
        <Field label="Next-step link" htmlFor="next_step_href" error={errors.next_step_href} hint="e.g. /book or a full https URL.">
          <Input defaultValue={d.next_step_href} placeholder="/book" {...errProps("next_step_href", errors.next_step_href)} />
        </Field>
      </FormSection>

      <FormSection title="SEO & social" description="Used for search results and WhatsApp/Facebook link previews.">
        <Field label="SEO title" htmlFor="seo_title" error={errors.seo_title}>
          <Input id="seo_title" name="seo_title" defaultValue={d.seo_title} maxLength={70} />
        </Field>
        <Field label="Meta description" htmlFor="seo_description" error={errors.seo_description}>
          <Input id="seo_description" name="seo_description" defaultValue={d.seo_description} maxLength={160} />
        </Field>
        <Field label="OG image (1200×630)" className="md:col-span-2" error={errors.og_image}>
          <ImageField name="og_image" folder="gifts" defaultValue={d.og_image} aspect="aspect-[1200/630]" />
        </Field>
      </FormSection>

      <FormActions pending={pending} cancelHref="/admin/landing-pages" label={page ? "Save changes" : "Create page"} />
    </form>
  );
}
