"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/admin/panel";

export default function AdminError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Panel className="mx-auto mt-10 flex max-w-md flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="grid size-11 place-items-center rounded-2xl bg-rose-50 text-admin-danger">
        <TriangleAlert className="size-5" />
      </span>
      <h1 className="text-base font-semibold">Something went wrong</h1>
      <p className="text-sm text-admin-muted">The page could not be loaded. Please try again.</p>
      <Button variant="outline" onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </Panel>
  );
}
