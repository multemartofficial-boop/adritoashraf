import { Globe, Layers } from "lucide-react";
import type { ProjectKind, ProjectOrigin } from "@/types/database";
import { cn } from "@/lib/utils";

/**
 * Subtle identity chips for portfolio cards. Website and SaaS get slightly
 * different accents (warm vs violet) so the type is recognisable at a glance
 * without dominating the card.
 */
export function ProjectKindBadge({
  kind,
  dark,
  className,
}: {
  kind: ProjectKind;
  dark?: boolean;
  className?: string;
}) {
  const Icon = kind === "saas" ? Layers : Globe;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase backdrop-blur-md",
        kind === "saas"
          ? dark
            ? "border-violet/40 bg-violet/20 text-white"
            : "border-violet/35 bg-violet/15 text-violet"
          : dark
            ? "border-white/25 bg-white/10 text-white/85"
            : "border-ink/15 bg-white/60 text-ink/70",
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {kind === "saas" ? "SaaS" : "Website"}
    </span>
  );
}

export function ProjectOriginText({
  origin,
  dark,
  className,
}: {
  origin: ProjectOrigin;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("text-xs font-medium", dark ? "text-white/45" : "text-neutral-500", className)}>
      · {origin === "practice" ? "Practice project" : "Client work"}
    </span>
  );
}
