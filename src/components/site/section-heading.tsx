import type { SectionText } from "@/types/database";
import { cn } from "@/lib/utils";

/** Gradient-outlined section tag pill (orange to purple). */
export function SectionTag({ children, tone = "light" }: { children: React.ReactNode; tone?: "light" | "dark" }) {
  if (!children) return null;
  return (
    <span
      className={cn(
        tone === "light" ? "tag-pill text-ink" : "inline-flex items-center rounded-full border border-white/70 px-4 py-1.5 text-sm font-medium text-white",
      )}
    >
      {children}
    </span>
  );
}

/** Three-colour heading: orange accent, strong (dark or white) and muted grey. */
export function TriHeading({
  text,
  tone = "light",
  as: Tag = "h2",
  className,
}: {
  text: Pick<SectionText, "accent" | "strong" | "muted">;
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  className?: string;
}) {
  if (!text.accent && !text.strong && !text.muted) return null;
  return (
    <Tag
      className={cn(
        "max-w-4xl text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.15] font-semibold tracking-tight text-balance",
        className,
      )}
    >
      {text.accent && <span className="text-orange">{text.accent} </span>}
      {text.strong && <span className={tone === "light" ? "text-ink" : "text-white"}>{text.strong} </span>}
      {text.muted && <span className={tone === "light" ? "text-neutral-300" : "text-white/35"}>{text.muted}</span>}
    </Tag>
  );
}

export function SectionHeading({
  text,
  tone = "light",
  aside,
  className,
}: {
  text?: SectionText;
  tone?: "light" | "dark";
  aside?: React.ReactNode;
  className?: string;
}) {
  if (!text) return null;
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="space-y-5">
        <SectionTag tone={tone}>{text.tag}</SectionTag>
        <TriHeading text={text} tone={tone} />
        {text.description && (
          <p className={cn("max-w-xl text-sm leading-relaxed md:text-base", tone === "light" ? "text-neutral-600" : "text-white/65")}>
            {text.description}
          </p>
        )}
      </div>
      {aside}
    </div>
  );
}
