import { getFaqs, getProcessSteps, getProjects, getServices, getSiteSettings, getTestimonials } from "@/lib/data/public";
import { About } from "@/components/sections/about";
import { BookingCta } from "@/components/sections/booking-cta";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Portfolio } from "@/components/sections/portfolio";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";

// Static page, refreshed on demand when admin content changes (and hourly as a fallback).
export const revalidate = 3600;

export default async function HomePage() {
  const [settings, projects, services, steps, testimonials, faqs] = await Promise.all([
    getSiteSettings(),
    getProjects(),
    getServices(),
    getProcessSteps(),
    getTestimonials(),
    getFaqs(),
  ]);
  const t = settings.section_texts;
  const featured = testimonials.find((x) => x.type === "text" && x.content);

  return (
    <>
      <Hero settings={settings} />
      <About settings={settings} featured={featured} />
      <Portfolio projects={projects} text={t.portfolio} />
      <Services services={services} text={t.services} defaultCurrency={settings.default_currency} />
      <Process steps={steps} text={t.process} />
      <Testimonials items={testimonials} text={t.testimonials} />
      <BookingCta text={t.booking} ownerName={settings.owner_name} />
      <Faq faqs={faqs} text={t.faq} contactEmail={settings.contact_email} />
    </>
  );
}
