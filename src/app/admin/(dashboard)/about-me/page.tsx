import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/session";
import { DEFAULT_ABOUT_ME } from "@/lib/site-config";
import { PageHeader } from "@/components/admin/page-header";
import { AboutMeForm } from "./about-me-form";

export const metadata: Metadata = { title: "About Me" };

export default async function AboutMePage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("about_me").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        title="About Me"
        description="The personal section between the hero and Results — bio, details, skills, CV and the profile card."
      />
      <AboutMeForm about={{ ...DEFAULT_ABOUT_ME, ...(data ?? {}) }} />
    </div>
  );
}
