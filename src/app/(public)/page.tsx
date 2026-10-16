import {
  getAboutMe,
  getFaqs,
  getProcessSteps,
  getProjects,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/lib/data/public";
import { JsonLd } from "@/components/site/json-ld";
import { WebinarBadge } from "@/components/site/webinar-badge";
import { About } from "@/components/sections/about";
import { AboutMe } from "@/components/sections/about-me";
import { BookingCta } from "@/components/sections/booking-cta";
import { GiftCta } from "@/components/sections/gift-cta";
import { Faq } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Portfolio } from "@/components/sections/portfolio";
import { Process } from "@/components/sections/process";
import { Services } from "@/components/sections/services";
import { Testimonials } from "@/components/sections/testimonials";

// Static page, refreshed on demand when admin content changes (and hourly as a fallback).
export const revalidate = 3600;

export default async function HomePage() {
  const [settings, aboutMe, projects, services, steps, testimonials, faqs] =
    await Promise.all([
      getSiteSettings(),
      getAboutMe(),
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
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.question,
              acceptedAnswer: { "@type": "Answer", text: f.answer },
            })),
          }}
        />
      )}
      <Hero settings={settings} />
      <AboutMe data={aboutMe} />
      <About settings={settings} featured={featured} />
      <Portfolio
        projects={projects.slice(0, 4)}
        total={projects.length}
        text={t.portfolio}
      />
      <Services
        services={services}
        text={t.services}
        defaultCurrency={settings.default_currency}
      />
      <Process steps={steps} text={t.process} />
      <Testimonials items={testimonials} text={t.testimonials} />
      <BookingCta text={t.booking} ownerName={settings.owner_name} />
      <GiftCta />
      <Faq faqs={faqs} text={t.faq} contactEmail={settings.contact_email} />
      <WebinarBadge />
    </>
  );
}
