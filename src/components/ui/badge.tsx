import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium", {
  variants: {
    tone: {
      success: "bg-emerald-50 text-emerald-700",
      warning: "bg-amber-50 text-amber-700",
      info: "bg-blue-50 text-blue-700",
      danger: "bg-rose-50 text-rose-700",
      neutral: "bg-black/[0.05] text-admin-muted",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({
  className,
  tone,
  dot,
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { dot?: boolean }) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
