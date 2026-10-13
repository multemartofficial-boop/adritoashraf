import type { ProcessStepRow, SectionText } from "@/types/database";
import { SectionHeading } from "@/components/site/section-heading";

export function Process({ steps, text }: { steps: ProcessStepRow[]; text?: SectionText }) {
  if (steps.length === 0) return null;

  return (
    <section
      id="process"
      className="section-x relative isolate flex min-h-svh flex-col justify-center gap-14 overflow-hidden bg-ink py-24 text-white md:py-32"
    >
      <div aria-hidden className="absolute -right-40 -bottom-40 -z-10 size-[40rem] rounded-full bg-violet/25 blur-[120px]" />
      <div aria-hidden className="absolute -top-40 -left-40 -z-10 size-[30rem] rounded-full bg-orange/15 blur-[120px]" />

      <SectionHeading text={text} tone="dark" />

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(13rem,1fr))]">
        {steps.map((step, i) => (
          <li
            key={step.id}
            className="glass card-lift scroll-reveal relative flex flex-col rounded-[1.75rem] p-6 hover:bg-white/[0.12]"
          >
            <span className="bg-orange-pill bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
            {step.description && <p className="mt-2 text-sm leading-relaxed text-white/65">{step.description}</p>}
            {i < steps.length - 1 && (
              <span aria-hidden className="absolute top-12 -right-3 hidden h-px w-6 bg-gradient-to-r from-white/40 to-transparent lg:block" />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
