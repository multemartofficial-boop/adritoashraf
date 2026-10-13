import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/session";
import { safeAdminPath } from "@/lib/validators/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const nextPath = safeAdminPath(typeof next === "string" ? next : undefined);
  if (await getAdminSession()) redirect(nextPath);

  return (
    <main className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_15%_-10%,rgb(59_130_246/0.12),transparent),radial-gradient(50rem_35rem_at_110%_110%,rgb(22_163_74/0.10),transparent)]"
      />
      <div className="relative w-full max-w-sm rounded-2xl border border-admin-border bg-admin-panel p-8 shadow-panel backdrop-blur-xl">
        <div className="mb-8 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-neutral-950 text-base font-semibold text-white">
            A
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Admin sign in</h1>
            <p className="text-sm text-admin-muted">Adrito Ashraf · Portfolio</p>
          </div>
        </div>
        <LoginForm next={nextPath} />
      </div>
    </main>
  );
}
