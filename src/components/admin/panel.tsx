import { cn } from "@/lib/utils";

/** Frosted white panel used for every admin card. */
export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-2xl border border-admin-border bg-white/80 shadow-panel backdrop-blur-xl", className)}
      {...props}
    />
  );
}
