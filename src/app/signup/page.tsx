import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/data/public";
import { getMemberSession } from "@/lib/auth/session";
import { AuthShell } from "@/components/site/auth-shell";
import { MemberSignupForm } from "./signup-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a free account to access your webinars.",
  robots: { index: false, follow: false },
};

export default async function SignupPage({
  searchParams,
}: PageProps<"/signup">) {
  const { next } = await searchParams;
  const session = await getMemberSession();
  if (session) redirect("/dashboard");
  const settings = await getSiteSettings();
  const nextPath = typeof next === "string" ? next : "";

  return (
    <AuthShell
      title="Create your"
      accent="account"
      subtitle="Sign up once — your approved webinars appear in your dashboard."
      siteName={settings.site_name}
      footer={
        <p>
          Already have an account?{" "}
          <Link
            href={`/login${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="font-medium text-lavender hover:text-white"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <MemberSignupForm next={nextPath} />
    </AuthShell>
  );
}
