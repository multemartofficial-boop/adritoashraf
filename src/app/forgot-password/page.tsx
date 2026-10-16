import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings } from "@/lib/data/public";
import { AuthShell } from "@/components/site/auth-shell";
import { ForgotPasswordForm } from "./forgot-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage() {
  const settings = await getSiteSettings();

  return (
    <AuthShell
      title="Reset"
      accent="password"
      subtitle="Enter your account email and we'll send you a reset link."
      siteName={settings.site_name}
      footer={
        <p>
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-lavender hover:text-white"
          >
            Back to sign in
          </Link>
        </p>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
