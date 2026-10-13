import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-black/[0.04] text-admin-muted">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-admin-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
