import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  href,
  title,
  description,
  icon: Icon,
  iconClass,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClass: string;
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 rounded-xl border border-admin-border bg-white p-4 shadow-xs transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-panel"
    >
      <ChevronRight className="absolute top-4 right-4 size-4 text-admin-muted transition-transform duration-150 group-hover:translate-x-0.5" />
      <span className={cn("grid size-8 place-items-center rounded-lg", iconClass)}>
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-admin-muted">{description}</span>
      </span>
    </Link>
  );
}
