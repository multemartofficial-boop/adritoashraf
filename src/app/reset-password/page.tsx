import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthShell } from "@/components/site/auth-shell";
import { ResetPasswordForm } from "./reset-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Choose a new password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordPage() {
  const settings = await getSiteSettings();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <AuthShell
      title="New"
      accent="password"
      subtitle="Choose a fresh password for your account."
      siteName={settings.site_name}
      footer={
        <p>
          <Link
            href="/login"
            className="font-medium text-lavender hover:text-white"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      {user ? (
        <ResetPasswordForm />
      ) : (
        <div className="space-y-4 text-center">
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            This reset link has expired or was already used.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm font-semibold text-violet underline"
          >
            Request a new link
          </Link>
        </div>
      )}
    </AuthShell>
  );
}
