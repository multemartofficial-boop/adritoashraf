"use client";

import { useOptimistic, useTransition } from "react";
import { Briefcase, Clock, FolderPlus, Settings } from "lucide-react";
import { toast } from "sonner";
import { QuickActionCard } from "@/components/admin/quick-action-card";
import { setQuickSetupDismissed } from "./actions";

const CARDS = [
  {
    href: "/admin/projects/new",
    title: "Add Project",
    description: "Showcase a past project with screenshots and details.",
    icon: FolderPlus,
    iconClass: "bg-blue-50 text-admin-info",
  },
  {
    href: "/admin/availability",
    title: "Set Availability",
    description: "Choose the days and hours clients can book meetings.",
    icon: Clock,
    iconClass: "bg-emerald-50 text-admin-success",
  },
  {
    href: "/admin/services",
    title: "Manage Services",
    description: "Edit services, timelines and USD / BDT starting prices.",
    icon: Briefcase,
    iconClass: "bg-amber-50 text-admin-warning",
  },
  {
    href: "/admin/settings",
    title: "Site Settings",
    description: "Update hero text, header, social links and SEO.",
    icon: Settings,
    iconClass: "bg-rose-50 text-admin-danger",
  },
];

export function QuickSetup({ dismissed }: { dismissed: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(dismissed);
  const [, startTransition] = useTransition();

  if (optimistic) return null;

  const dismiss = () =>
    startTransition(async () => {
      setOptimistic(true);
      const res = await setQuickSetupDismissed(true);
      if (!res.ok) toast.error("Could not dismiss. Please try again.");
    });

  return (
    <section aria-labelledby="quick-setup" className="rounded-2xl border border-admin-border bg-black/[0.03] p-3 md:p-4">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 id="quick-setup" className="text-sm font-semibold">
          Quick Setup
        </h2>
        <button type="button" onClick={dismiss} className="text-xs font-medium text-admin-info hover:underline">
          Dismiss
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {CARDS.map((c) => (
          <QuickActionCard key={c.title} {...c} />
        ))}
      </div>
    </section>
  );
}
