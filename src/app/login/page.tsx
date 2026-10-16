import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSiteSettings } from "@/lib/data/public";
import { getMemberSession } from "@/lib/auth/session";
import { AuthShell } from "@/components/site/auth-shell";
import { MemberLoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your account to watch your webinars.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const session = await getMemberSession();
  if (session) redirect("/dashboard");
  const settings = await getSiteSettings();
  const nextPath = typeof next === "string" ? next : "";
  const errorMsg = typeof error === "string" ? error : "";

  return (
    <AuthShell
      title="Welcome"
      accent="back"
      subtitle="Sign in to watch your webinars."
      siteName={settings.site_name}
      footer={
        <p>
          New here?{" "}
          <Link
            href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="font-medium text-lavender hover:text-white"
          >
            Create an account
          </Link>
        </p>
      }
    >
      {errorMsg && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-700"
        >
          {errorMsg}
        </p>
      )}
      <MemberLoginForm next={nextPath} />
    </AuthShell>
  );
}
