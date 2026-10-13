"use client";

import type { SiteSettingsRow } from "@/types/database";
import { parseSiteSettingsForm, SECTION_KEYS, SOCIAL_PLATFORMS } from "@/lib/validators/content";
import { Field, FormSection, errProps } from "@/components/admin/form/field";
import { FormActions } from "@/components/admin/form/form-actions";
import { ImageField } from "@/components/admin/form/image-field";
import { ListField } from "@/components/admin/form/list-field";
import { RowsField } from "@/components/admin/form/rows-field";
import { useAdminForm } from "@/components/admin/form/use-admin-form";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { saveSiteSettingsAction } from "./actions";

const SECTION_LABELS: Record<(typeof SECTION_KEYS)[number], string> = {
  portfolio: "Portfolio",
  services: "Services",
  process: "How I Work",
  testimonials: "Testimonials",
  booking: "Book a Call",
  faq: "FAQ",
};

export function SettingsForm({ settings: s }: { settings: SiteSettingsRow }) {
  const { formAction, onSubmit, pending, errors } = useAdminForm(saveSiteSettingsAction, parseSiteSettingsForm);
  const e = errors;

  return (
    <form action={formAction} onSubmit={onSubmit} noValidate className="space-y-6">
      <FormSection title="Identity" description="Your name and brand, used across the site.">
        <Field label="Logo / brand word" htmlFor="site_name" error={e.site_name} hint="Shown in italic serif inside the logo pill.">
          <Input {...errProps("site_name", e.site_name)} defaultValue={s.site_name} />
        </Field>
        <Field label="Your full name" htmlFor="owner_name" error={e.owner_name}>
          <Input {...errProps("owner_name", e.owner_name)} defaultValue={s.owner_name} />
        </Field>
        <Field label="Role" htmlFor="role" error={e.role}>
          <Input {...errProps("role", e.role)} defaultValue={s.role} />
        </Field>
        <Field label="Default currency" htmlFor="default_currency" error={e.default_currency} hint="Visitors can switch on the Services section.">
          <Select {...errProps("default_currency", e.default_currency)} defaultValue={s.default_currency}>
            <option value="USD">USD ($)</option>
            <option value="BDT">BDT (৳)</option>
          </Select>
        </Field>
        <Field label="Tagline" htmlFor="tagline" error={e.tagline} className="md:col-span-2">
          <Textarea {...errProps("tagline", e.tagline)} rows={2} defaultValue={s.tagline} />
        </Field>
      </FormSection>

      <FormSection title="Header" description="Logo, navigation pill and the call-to-action button.">
        <Field label="Button label" htmlFor="header_cta_label" error={e.header_cta_label}>
          <Input {...errProps("header_cta_label", e.header_cta_label)} defaultValue={s.header_cta_label} />
        </Field>
        <Field label="Button link" htmlFor="header_cta_href" error={e.header_cta_href} hint="e.g. /book or #contact">
          <Input {...errProps("header_cta_href", e.header_cta_href)} defaultValue={s.header_cta_href} />
        </Field>
        <Field label="Navigation links" error={e.nav_links} hint="Up to 8. Use #about style links for sections." className="md:col-span-2">
          <RowsField
            name="nav_links"
            defaultValue={s.nav_links}
            max={8}
            addLabel="Add link"
            errors={e}
            columns={[
              { key: "label", label: "Label", placeholder: "About" },
              { key: "href", label: "Link", placeholder: "#about" },
            ]}
          />
        </Field>
      </FormSection>

      <FormSection title="Hero" description="“I Am …” line, the two huge headline words and the logo marquee.">
        <Field label="Intro line (italic)" htmlFor="hero_intro" error={e.hero_intro}>
          <Input {...errProps("hero_intro", e.hero_intro)} defaultValue={s.hero_intro} />
        </Field>
        <div className="hidden md:block" />
        <Field label="Headline line 1 (gradient)" htmlFor="hero_line_1" error={e.hero_line_1}>
          <Input {...errProps("hero_line_1", e.hero_line_1)} defaultValue={s.hero_line_1} />
        </Field>
        <Field label="Headline line 2 (after the arrow pill)" htmlFor="hero_line_2" error={e.hero_line_2}>
          <Input {...errProps("hero_line_2", e.hero_line_2)} defaultValue={s.hero_line_2} />
        </Field>
        <Field label="Marquee items" htmlFor="marquee_items" error={e.marquee_items} hint="Tools or clients scrolling under the hero." className="md:col-span-2">
          <ListField name="marquee_items" defaultValue={s.marquee_items} max={20} error={e.marquee_items} placeholder="e.g. Next.js" />
        </Field>
      </FormSection>

      <FormSection title="Results" description="The stats + quote section (its tag pill reads “Results”). The heading has three colour parts: orange, dark, then grey.">
        <Field label="Orange part" htmlFor="about_heading_accent" error={e["about_heading.accent"]}>
          <Input id="about_heading_accent" name="about_heading_accent" defaultValue={s.about_heading.accent ?? ""} />
        </Field>
        <Field label="Grey part (revealed on scroll)" htmlFor="about_heading_muted" error={e["about_heading.muted"]}>
          <Input id="about_heading_muted" name="about_heading_muted" defaultValue={s.about_heading.muted ?? ""} />
        </Field>
        <Field label="Dark part" htmlFor="about_heading_strong" error={e["about_heading.strong"]} className="md:col-span-2">
          <Textarea id="about_heading_strong" name="about_heading_strong" rows={2} defaultValue={s.about_heading.strong ?? ""} />
        </Field>
        <Field label="Paragraph" htmlFor="about_text" error={e.about_text} className="md:col-span-2">
          <Textarea {...errProps("about_text", e.about_text)} rows={3} defaultValue={s.about_text} />
        </Field>
        <Field label="Quote card text" htmlFor="about_quote" error={e.about_quote} hint="The ink card's blockquote. Empty = uses your first written testimonial." className="md:col-span-2">
          <Textarea {...errProps("about_quote", e.about_quote)} rows={2} defaultValue={s.about_quote} maxLength={300} />
        </Field>
        <Field label="Quote author" htmlFor="about_quote_author" error={e.about_quote_author} hint="Name shown under the quote (only when the quote above is set).">
          <Input {...errProps("about_quote_author", e.about_quote_author)} defaultValue={s.about_quote_author} />
        </Field>
        <Field label="Stat cards" error={e.about_stats} hint="Up to 3 cards in the bento grid, e.g. “4+” · “Production systems delivered”." className="md:col-span-2">
          <RowsField
            name="about_stats"
            defaultValue={s.about_stats}
            max={3}
            addLabel="Add stat"
            errors={e}
            columns={[
              { key: "value", label: "Value", placeholder: "4+", className: "sm:max-w-28" },
              { key: "label", label: "Caption", placeholder: "Production systems delivered" },
            ]}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Section headings"
        description="Each section has a tag pill and a heading in three colours: orange, dark, then grey. Portfolio uses the tag as the giant word."
      >
        <div className="space-y-3 md:col-span-2">
          {SECTION_KEYS.map((k) => {
            const t = s.section_texts?.[k] ?? {};
            const f = (part: string) => `st_${k}_${part}`;
            const err = (part: string) => e[`section_texts.${k}.${part}`];
            return (
              <details key={k} className="group rounded-xl border border-admin-border bg-white/60 open:bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium">
                  {SECTION_LABELS[k]}
                  <span className="text-xs font-normal text-admin-muted group-open:hidden">{t.tag}</span>
                </summary>
                <div className="grid gap-3 border-t border-admin-border p-4 md:grid-cols-2">
                  <Field label="Tag pill" htmlFor={f("tag")} error={err("tag")}>
                    <Input id={f("tag")} name={f("tag")} defaultValue={t.tag ?? ""} />
                  </Field>
                  <Field label="Orange part" htmlFor={f("accent")} error={err("accent")}>
                    <Input id={f("accent")} name={f("accent")} defaultValue={t.accent ?? ""} />
                  </Field>
                  <Field label="Dark part" htmlFor={f("strong")} error={err("strong")}>
                    <Input id={f("strong")} name={f("strong")} defaultValue={t.strong ?? ""} />
                  </Field>
                  <Field label="Grey part" htmlFor={f("muted")} error={err("muted")}>
                    <Input id={f("muted")} name={f("muted")} defaultValue={t.muted ?? ""} />
                  </Field>
                  <Field label="Short description" htmlFor={f("description")} error={err("description")} className="md:col-span-2">
                    <Textarea id={f("description")} name={f("description")} rows={2} defaultValue={t.description ?? ""} />
                  </Field>
                </div>
              </details>
            );
          })}
        </div>
      </FormSection>

      <FormSection title="Contact & social">
        <Field label="Contact email" htmlFor="contact_email" error={e.contact_email}>
          <Input {...errProps("contact_email", e.contact_email)} type="email" defaultValue={s.contact_email} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={e.phone}>
          <Input {...errProps("phone", e.phone)} type="tel" defaultValue={s.phone} />
        </Field>
        <Field label="WhatsApp number" htmlFor="whatsapp" error={e.whatsapp} hint="International format, e.g. +8801XXXXXXXXX">
          <Input {...errProps("whatsapp", e.whatsapp)} type="tel" defaultValue={s.whatsapp} />
        </Field>
        <Field label="Address" htmlFor="address" error={e.address}>
          <Input {...errProps("address", e.address)} defaultValue={s.address} />
        </Field>
        <Field label="Social links" error={e.social_links} hint="Leave the URL empty to hide an icon." className="md:col-span-2">
          <RowsField
            name="social_links"
            defaultValue={s.social_links}
            max={10}
            addLabel="Add social link"
            errors={e}
            columns={[
              { key: "platform", label: "Platform", options: SOCIAL_PLATFORMS, className: "sm:max-w-40" },
              { key: "url", label: "URL", placeholder: "https://" },
            ]}
          />
        </Field>
        <Field label="Footer text" htmlFor="footer_text" error={e.footer_text} className="md:col-span-2">
          <Textarea {...errProps("footer_text", e.footer_text)} rows={2} defaultValue={s.footer_text} />
        </Field>
      </FormSection>

      <FormSection title="SEO & sharing" description="How the site appears in Google and when shared on social media.">
        <Field label="SEO title" htmlFor="seo_title" error={e.seo_title} hint="About 50 to 60 characters.">
          <Input {...errProps("seo_title", e.seo_title)} defaultValue={s.seo_title} maxLength={70} />
        </Field>
        <Field label="SEO description" htmlFor="seo_description" error={e.seo_description} hint="About 150 characters.">
          <Textarea {...errProps("seo_description", e.seo_description)} rows={3} defaultValue={s.seo_description} maxLength={170} />
        </Field>
        <Field label="Social share image" htmlFor="og_image" error={e.og_image} hint="1200 × 630 recommended." className="md:col-span-2">
          <ImageField name="og_image" folder="site" defaultValue={s.og_image} error={e.og_image} />
        </Field>
        <Field label="Focus keyword" htmlFor="seo_focus_keyword" error={e.seo_focus_keyword} hint="Main search term for the home page, e.g. “freelance full stack developer”.">
          <Input {...errProps("seo_focus_keyword", e.seo_focus_keyword)} defaultValue={s.seo_focus_keyword} />
        </Field>
        <Field label="GA4 Measurement ID" htmlFor="ga4_id" error={e.ga4_id} hint="Google Analytics, e.g. G-XXXXXXXXXX. Empty = analytics off.">
          <Input {...errProps("ga4_id", e.ga4_id)} defaultValue={s.ga4_id} placeholder="G-" />
        </Field>
        <Field
          label="Search Console verification"
          htmlFor="search_console_verification"
          error={e.search_console_verification}
          hint="The token from Google's meta tag (the long string after content=), or the full content value."
          className="md:col-span-2"
        >
          <Input {...errProps("search_console_verification", e.search_console_verification)} defaultValue={s.search_console_verification} />
        </Field>
      </FormSection>

      <FormActions pending={pending} label="Save settings" />
    </form>
  );
}
