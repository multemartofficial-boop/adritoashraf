import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";
import { LegalPage } from "@/components/site/legal-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms that apply when using this website and working together on a project.",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const s = await getSiteSettings();
  const site = publicEnv.NEXT_PUBLIC_SITE_URL;
  const email = s.contact_email || "the contact address on this site";

  return (
    <LegalPage
      title="Terms &amp;"
      accent="conditions"
      updated="October 16, 2026"
      intro={`The ground rules for using ${site} and for working with ${s.owner_name} on websites, SaaS products and business software.`}
    >
      <section>
        <h2>1. About this site</h2>
        <p>
          {site} is the personal portfolio of {s.owner_name}, a freelance
          full-stack developer. Case studies, service descriptions and prices
          shown here are for information only and may change without notice. By
          using this site you agree to these terms.
        </p>
      </section>

      <section>
        <h2>2. Booking a meeting</h2>
        <ul>
          <li>
            Intro calls booked through this site are free and carry no
            obligation on either side.
          </li>
          <li>
            Available slots reflect real availability, but a booking is only
            final once confirmed by email.
          </li>
          <li>
            You can reschedule or cancel through the private link in your
            confirmation email.
          </li>
          <li>
            Repeated no-shows or abusive enquiries may be declined or blocked.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Quotes and project agreements</h2>
        <p>
          Any estimate discussed on a call or shown on this site is indicative.
          Work only starts after both sides agree — in writing (email is fine) —
          on scope, price, payment schedule and timeline. That agreement, not
          this page, governs the project.
        </p>
      </section>

      <section>
        <h2>4. Payments</h2>
        <ul>
          <li>
            Payment terms are set per project in the agreed proposal; a deposit
            may be required before work begins.
          </li>
          <li>Final deliverables are handed over once payment is complete.</li>
          <li>
            Third-party costs (hosting, domains, subscriptions, licences) are
            yours unless agreed otherwise.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Your responsibilities</h2>
        <p>
          Timelines depend on timely input: content, brand assets, access
          details, and feedback at agreed checkpoints. You confirm that material
          you supply (text, images, logos, data) is yours to use and doesn&rsquo;t
          infringe anyone else&rsquo;s rights.
        </p>
      </section>

      <section>
        <h2>6. Intellectual property</h2>
        <ul>
          <li>
            On full payment, the final deliverables built for you are yours.
          </li>
          <li>
            I keep the right to show the work in this portfolio and case
            studies, unless we agree otherwise in writing.
          </li>
          <li>
            Reusable tools, libraries and know-how I bring to a project remain
            mine — you get a licence to use them within your project.
          </li>
        </ul>
      </section>

      <section>
        <h2>7. Third-party services</h2>
        <p>
          Projects often rely on services outside my control — hosting
          providers, Supabase, Google, payment gateways and APIs. Their uptime,
          pricing and terms are their own. I&rsquo;m not responsible for outages or
          changes on their side, though I&rsquo;ll always help find a fix.
        </p>
      </section>

      <section>
        <h2>8. Liability</h2>
        <p>
          This site is provided &quot;as is&quot;. To the extent the law allows, I&rsquo;m not
          liable for indirect losses (lost profit, lost data, business
          interruption) arising from this site or from work delivered, and total
          liability is capped at the amount paid for the project in question.
        </p>
      </section>

      <section>
        <h2>9. Acceptable use</h2>
        <p>
          Don&rsquo;t misuse this site: no scraping at scale, no attempting to access
          the admin area, and no sending spam or malicious content through the
          booking form. Abuse protections (rate limits, honeypots) are in place.
        </p>
      </section>

      <section>
        <h2>10. Governing law</h2>
        <p>
          These terms are governed by the laws of Bangladesh. Any dispute will
          first be handled in good faith over a call or email — most things get
          sorted that way.
        </p>
      </section>

      <section>
        <h2>11. Changes &amp; contact</h2>
        <p>
          If these terms change, the updated version will be posted here with a
          new date. Questions: <a href={`mailto:${s.contact_email}`}>{email}</a>
          .
        </p>
        <p>
          Also see the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
