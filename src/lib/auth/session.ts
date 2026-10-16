import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

// Verifies the JWT with Supabase Auth AND that the user is listed in public.admins.
// Memoised per request so layouts + pages share one lookup.
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id, email, name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) return null;

  return {
    userId: admin.user_id,
    email: admin.email,
    name: admin.name,
    supabase,
  };
});

/** For pages/layouts: redirects to the login page when not an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}

/** For server actions and API routes: throws UnauthorizedError when not an admin. */
export async function requireAdminAction(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

// ---------------------------------------------------------------------------
// Member sessions (webinar area) — any authenticated user, no admin check.
// ---------------------------------------------------------------------------
export type MemberSession = {
  userId: string;
  email: string;
  name: string;
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
};

export const getMemberSession = cache(
  async (): Promise<MemberSession | null> => {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    return {
      userId: user.id,
      email: user.email ?? "",
      name: profile?.full_name || user.email?.split("@")[0] || "Member",
      supabase,
    };
  },
);

/** For member pages/layouts: redirects to /login when signed out. */
export async function requireMember(): Promise<MemberSession> {
  const session = await getMemberSession();
  if (!session) redirect("/login");
  return session;
}

/** For member server actions: throws UnauthorizedError when signed out. */
export async function requireMemberAction(): Promise<MemberSession> {
  const session = await getMemberSession();
  if (!session) throw new UnauthorizedError();
  return session;
}
