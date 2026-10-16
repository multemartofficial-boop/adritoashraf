"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, LogOut } from "lucide-react";
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

function LogoutItem() {
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
        });
      }}
    >
      <LogOut /> {pending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}

/** Right-side slot of the pill: quiet "Log in" link, or the purple avatar + dropdown when signed in. */
export function NavAuth() {
  const { user, ready } = useMemberUser();
  const router = useRouter();
  const prefetch = () => router.prefetch("/dashboard");
  if (!ready) return <span aria-hidden className="inline-block size-10" />;

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-[#A1A1B5] transition-colors hover:text-white"
      >
        Log in
      </Link>
    );
  }

  return (
    <DropdownMenu onOpenChange={(open) => open && prefetch()}>
      <DropdownMenuTrigger
        onMouseEnter={prefetch}
        onFocus={prefetch}
        className="grid size-10 place-items-center rounded-full bg-[#7C4DFF] text-sm font-bold text-white ring-2 ring-[#B794FF]/50 transition-all duration-200 hover:scale-105 hover:ring-[#B794FF]"
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
