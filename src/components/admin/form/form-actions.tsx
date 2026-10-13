import Link from "next/link";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sticky save bar at the bottom of long admin forms. */
export function FormActions({ pending, cancelHref, label = "Save changes" }: { pending: boolean; cancelHref?: string; label?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-admin-border bg-admin-bg/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
      {cancelHref && (
        <Button variant="outline" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />}
        {pending ? "Saving..." : label}
      </Button>
    </div>
  );
}
