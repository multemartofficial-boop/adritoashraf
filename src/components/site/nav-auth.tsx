"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, Loader2, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { memberLogoutAction } from "@/lib/auth/member-actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MemberUser = { email: string; name: string };

function useMemberUser() {
  const [user, setUser] = useState<MemberUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const toUser = (
      u: { email?: string; user_metadata?: Record<string, unknown> } | null,
    ): MemberUser | null =>
      u?.email
        ? {
            email: u.email,
            name:
              String(u.user_metadata?.full_name ?? "").trim() ||
              u.email.split("@")[0],
          }
        : null;

    supabase.auth.getUser().then(({ data }) => {
      setUser(toUser(data.user));
      setReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setUser(toUser(session?.user ?? null)),
    );
    return () => subscription.unsubscribe();
  }, []);

  return { user, ready };
}

function LogoutItem({ onDone }: { onDone?: () => void }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <DropdownMenuItem
      variant="danger"
      disabled={pending}
      onSelect={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await memberLogoutAction();
          router.refresh();
          onDone?.();
        });
      }}
    >
      <LogOut /> {pending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}

/** Desktop pill slot: quiet "Log in" link, or avatar + dropdown when signed in. */
export function NavAuth() {
  const { user, ready } = useMemberUser();
  if (!ready)
    return <span aria-hidden className="hidden size-9 lg:inline-block" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="hidden rounded-full px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white lg:block"
      >
        Log in
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="hidden size-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--violet),#b44cff)] text-sm font-bold text-white ring-2 ring-white/25 transition-transform duration-200 hover:scale-105 lg:grid"
        aria-label="Account menu"
      >
        {user.name.charAt(0).toUpperCase()}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[70]">
        <DropdownMenuLabel>
          <span className="block text-sm font-medium">{user.name}</span>
          <span className="block truncate text-xs font-normal text-admin-muted">
            {user.email}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutGrid /> My Webinars
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Mobile menu rows: Login link, or My Webinars + Logout when signed in. */
export function MobileNavAuth({ onNavigate }: { onNavigate?: () => void }) {
  const { user, ready } = useMemberUser();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  if (!ready) return null;

  if (!user) {
    return (
      <li>
        <Link
          href="/login"
          onClick={onNavigate}
          className="block rounded-2xl px-4 py-3 text-base text-white/85 hover:bg-white/10"
        >
          Log in
        </Link>
      </li>
    );
  }

  return (
    <>
      <li>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-base text-white/85 hover:bg-white/10"
        >
          <span className="grid size-6 place-items-center rounded-full bg-[linear-gradient(135deg,var(--violet),#b44cff)] text-[11px] font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          My Webinars
        </Link>
      </li>
      <li>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await memberLogoutAction();
              router.refresh();
              onNavigate?.();
            })
          }
          className="flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 text-left text-base text-white/60 hover:bg-white/10 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <LogOut className="size-4" />
          )}
          Log out
        </button>
      </li>
    </>
  );
}
