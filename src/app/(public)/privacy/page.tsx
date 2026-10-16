import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/public";
import { publicEnv } from "@/lib/env/public";
import { LegalPage } from "@/components/site/legal-page";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How personal information is collected, used and protected on this website.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  const site = publicEnv.NEXT_PUBLIC_SITE_URL;
  const email = s.contact_email || "the contact address on this site";

  return (
    <LegalPage
      title="Privacy"
      accent="policy"
      updated="October 16, 2026"
      intro={`How ${s.owner_name} ("I", "me") handles personal information on ${site} — what is collected, why, and the choices you have.`}
    >
      <section>
        <h2>1. What I collect</h2>
        <p>
          This site only collects information you choose to send, mostly through
          the meeting booking form:
        </p>
        <ul>
          <li>
            <strong>Booking details</strong> — your name, email address, phone /
            WhatsApp number (optional), the project type, budget range,
            timeline, project description and any reference links you share,
            plus your timezone and chosen meeting time.
          </li>
          <li>
            <strong>Messages</strong> — anything you send by email or WhatsApp
            using the contact details on this site.
          </li>
          <li>
            <strong>Embedded forms</strong> — webinar or event registrations go
            through a form provided by Hostinger Reach, which processes your
            name and email under Hostinger&rsquo;s own privacy policy.
          </li>
          {s.ga4_id && (
            <li>
              <strong>Usage analytics</strong> — this site uses Google Analytics
              4, which collects anonymised data such as pages visited, device
              type and approximate location. Google may set cookies for this.
            </li>
          )}
        </ul>
        <p>
          There is no account registration and no comments — nothing else is
          gathered.
        </p>
      </section>

      <section>
        <h2>2. How it is used</h2>
        <ul>
          <li>
            To schedule, confirm and manage your meeting (including reminder
            emails and your private manage link).
          </li>
          <li>To prepare for our call and respond to your project enquiry.</li>
          <li>
            To keep basic records of client conversations and project history.
          </li>
          {s.ga4_id && (
            <li>
              To understand which pages are useful so the site can be improved.
            </li>
          )}
        </ul>
        <p>Your information is never sold, rented or used for advertising.</p>
      </section>

      <section>
        <h2>3. Where it is stored</h2>
        <p>
          Booking records are stored in a Supabase-hosted database with
          row-level access controls. Emails are delivered through a standard
          SMTP mail service. Embedded registration forms are processed by
          Hostinger Reach. Video meetings use Google Meet, so Google&rsquo;s own
          policies apply to the call itself.{" "}
          {s.ga4_id &&
            "Analytics data is processed by Google under its own privacy policy."}
        </p>
      </section>

      <section>
        <h2>4. Cookies</h2>
        <p>
          The public site does not set tracking cookies. A session cookie is
          used only on the <code>/admin</code> area to keep the site owner
          signed in.
          {s.ga4_id &&
            " If analytics is enabled, Google Analytics may set its own cookies."}
        </p>
      </section>

      <section>
        <h2>5. How long it is kept</h2>
        <p>
          Booking and enquiry records are kept only as long as needed to manage
          our working relationship and reasonable business records. Cancelled or
          stale bookings may be deleted periodically. You can ask for your data
          to be removed at any time (see below).
        </p>
      </section>

      <section>
        <h2>6. Your rights</h2>
        <p>
          You can request a copy of the information I hold about you, ask me to
          correct it, or ask me to delete it. Every booking confirmation email
          also includes a private link to view, reschedule or cancel your own
          booking — no account needed.
        </p>
      </section>

      <section>
        <h2>7. Security</h2>
        <p>
          The site is served over HTTPS, admin access is restricted to the
          owner, and booking management links use single-use hashed tokens. No
          system is perfectly secure, but reasonable technical and
          organisational measures are in place.
        </p>
      </section>

      <section>
        <h2>8. Third-party links</h2>
        <p>
          This site links to external sites (live project demos, social
          profiles, Google Meet). Their privacy practices are their own — this
          policy covers only {site}.
        </p>
      </section>

      <section>
        <h2>9. Changes &amp; contact</h2>
        <p>
          If this policy changes, the updated version will be posted here with a
          new date. Questions or requests about your data:{" "}
          <a href={`mailto:${s.contact_email}`}>{email}</a>.
        </p>
        <p>
          Also see the <Link href="/terms">Terms &amp; Conditions</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
