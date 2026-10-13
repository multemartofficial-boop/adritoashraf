import Image from "next/image";
import Link from "next/link";
import { Award, CircleCheck, Download, Mail, MapPin, UserRound, Briefcase, ArrowUpRight } from "lucide-react";
import type { AboutMeRow } from "@/types/database";
import { SectionTag, TriHeading } from "@/components/site/section-heading";
import { SOCIAL_LABEL, SocialIcon } from "@/components/site/social-icon";

const INFO_ICONS = [UserRound, Briefcase, MapPin, Award, Mail, CircleCheck] as const;

export function AboutMe({ data }: { data: AboutMeRow }) {
  if (!data.is_visible) return null;

  const info = [
    { label: "Name", value: data.full_name },
    { label: "Role", value: data.role },
    { label: "Location", value: data.location },
    { label: "Experience", value: data.experience_years ? `${data.experience_years} years` : "" },
    { label: "Email", value: data.email },
    { label: "Availability", value: data.availability_enabled ? data.availability_text : "Currently booked" },
  ].filter((i) => i.value);

  const socials = data.social_links.filter((l) => l.url);

  return (
    <section id="about" aria-labelledby="about-me-heading" className="section-x bg-[#f6f5fb] py-24 text-ink md:py-32">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        {/* Image card — first on mobile, right column on desktop */}
        <div className="scroll-reveal relative order-first mx-auto w-full max-w-md lg:order-last lg:max-w-none">
          <div
            aria-hidden
            className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(60%_60%_at_50%_40%,rgb(123_79_255/0.35),transparent_75%)] blur-2xl"
          />
          <div className="card-lift relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[linear-gradient(150deg,#141633_0%,#3a2050_55%,#7b4fff_140%)] shadow-[0_30px_80px_rgb(20_22_51/0.35)]">
            {data.image_url ? (
              <Image
                src={data.image_url}
                alt={data.full_name ? `Portrait of ${data.full_name}` : "Profile photo"}
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover object-top"
              />
            ) : (
              <span aria-hidden className="absolute inset-0 grid place-items-center font-serif text-8xl italic text-white/70">
                {data.full_name.split(" ").map((n) => n[0]).join("") || "A"}
              </span>
            )}
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgb(20_22_51/0.65),transparent)]" />

            {data.experience_badge && (
              <span className="glass absolute top-5 right-5 rounded-full px-4 py-2 text-xs font-semibold text-white">
                {data.experience_badge}
              </span>
            )}
            {data.availability_enabled && (
              <span className="glass absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white">
                <span className="relative flex size-2.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
                </span>
                {data.availability_text}
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="scroll-reveal space-y-7">
          <div className="space-y-5">
            <SectionTag>{data.tag || "About Me"}</SectionTag>
            <TriHeading text={data.heading} id="about-me-heading" />
          </div>

          {data.bio_1 && <p className="max-w-xl leading-relaxed text-neutral-600">{data.bio_1}</p>}
          {data.bio_2 && <p className="max-w-xl leading-relaxed text-neutral-600">{data.bio_2}</p>}

          {info.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              {info.map((item, i) => {
                const Icon = INFO_ICONS[i] ?? UserRound;
                return (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 size-4 shrink-0 text-violet" aria-hidden />
                    <div className="min-w-0">
                      <dt className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{item.label}</dt>
                      <dd className="mt-0.5 truncate text-sm font-semibold" title={item.value}>
                        {item.value}
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          )}

          {data.skills.length > 0 && (
            <ul className="flex flex-wrap gap-2" aria-label="Skills">
              {data.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-violet/20 bg-white px-3.5 py-1.5 text-xs font-medium text-ink shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:border-violet/40"
                >
                  {skill}
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap items-center gap-4">
            {data.primary_cta_label && (
              <Link
                href={data.primary_cta_href}
                className="bg-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:scale-[1.03]"
              >
                {data.primary_cta_label} <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            )}
            {data.cv_url && (
              <a
                href={data.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors duration-300 hover:border-ink/30 hover:bg-neutral-50"
              >
                <Download className="size-4" aria-hidden /> Download CV
              </a>
            )}
            {socials.length > 0 && (
              <ul className="flex items-center gap-1.5">
                {socials.map((l) => (
                  <li key={l.platform}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABEL[l.platform] ?? l.platform}
                      className="grid size-10 place-items-center rounded-full border border-ink/10 bg-white text-neutral-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet/40 hover:text-violet"
                    >
                      <SocialIcon platform={l.platform} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
