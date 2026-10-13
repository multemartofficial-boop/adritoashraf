import { Info, type LucideIcon } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Panel } from "./panel";

export type Stat = {
  label: string;
  hint: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  tone: "success" | "info" | "warning" | "danger";
};

const TONE: Record<Stat["tone"], string> = {
  success: "bg-emerald-50 text-admin-success ring-emerald-100",
  info: "bg-blue-50 text-admin-info ring-blue-100",
  warning: "bg-amber-50 text-admin-warning ring-amber-100",
  danger: "bg-rose-50 text-admin-danger ring-rose-100",
};

export function StatCard({ stat }: { stat: Stat }) {
  const Icon = stat.icon;
  return (
    <div className="flex items-center gap-3 p-4 md:p-5">
      <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl ring-1", TONE[stat.tone])}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="flex items-center gap-1 text-xs text-admin-muted">
          {stat.label}
          <Tooltip content={stat.hint}>
            <button type="button" className="rounded-full text-admin-muted/70 hover:text-admin-text" aria-label={`About ${stat.label}`}>
              <Info className="size-3.5" />
            </button>
          </Tooltip>
        </p>
        <p className="mt-0.5 truncate text-lg font-semibold tracking-tight">
          {stat.value}
          {stat.unit && <span className="ml-1 text-sm font-normal text-admin-muted">{stat.unit}</span>}
        </p>
      </div>
    </div>
  );
}

export function StatsRow({ stats, footnote }: { stats: Stat[]; footnote?: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Panel className="grid grid-cols-2 gap-px overflow-hidden bg-admin-border lg:grid-cols-4 [&>*]:bg-white">
        {stats.map((s) => (
          <StatCard key={s.label} stat={s} />
        ))}
      </Panel>
      {footnote && <p className="px-1 text-xs text-admin-muted">{footnote}</p>}
    </div>
  );
}
