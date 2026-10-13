"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronDown,
  CircleHelp,
  ExternalLink,
  Globe,
  Keyboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { StatusPill } from "./status-pill";

type Props = { email: string; name: string; siteName: string };

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "A";

const crumbBtn =
  "inline-flex h-8 items-center gap-2 rounded-full px-2.5 text-sm font-medium text-admin-text hover:bg-black/5 data-[state=open]:bg-black/5";

function LogoutItem() {
  const [pending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      variant="danger"
      disabled={pending}
      onSelect={(e) => {
        e.preventDefault();
        startTransition(() => logoutAction());
      }}
    >
      <LogOut /> {pending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}

export function Topbar({ email, name, siteName }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 px-3 lg:px-4">
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open navigation">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent title="Navigation">
          <div className="h-14 shrink-0" />
          <Sidebar onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <Link
        href="/admin"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-neutral-950 text-sm font-semibold text-white"
        aria-label="Admin home"
      >
        A
      </Link>

      <span className="hidden text-admin-muted/60 sm:inline">/</span>

      <DropdownMenu>
        <DropdownMenuTrigger className={`${crumbBtn} hidden sm:inline-flex`}>
          <UserRound className="size-4 text-admin-muted" />
          <span className="max-w-48 truncate">{email}</span>
          <span className="rounded-md border border-admin-border bg-white px-1.5 py-px text-[11px] font-medium text-admin-muted">
            Admin
          </span>
          <ChevronDown className="size-3.5 text-admin-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Signed in as {email}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href="/admin/account">
              <ShieldCheck /> Account & security
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <LogoutItem />
        </DropdownMenuContent>
      </DropdownMenu>

      <span className="hidden text-admin-muted/60 md:inline">/</span>

      <DropdownMenu>
        <DropdownMenuTrigger className={`${crumbBtn} hidden md:inline-flex`}>
          <Globe className="size-4 text-admin-muted" />
          <span className="max-w-40 truncate">{siteName}</span>
          <ChevronDown className="size-3.5 text-admin-muted" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem asChild>
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink /> View live site
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/admin/settings">
              <Settings /> Site settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="ml-auto flex items-center gap-2">
        <StatusPill />

        <DropdownMenu>
          <Tooltip content="Help" side="bottom">
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="Help">
                <CircleHelp />
              </Button>
            </DropdownMenuTrigger>
          </Tooltip>
          <DropdownMenuContent>
            <DropdownMenuLabel>Keyboard shortcuts</DropdownMenuLabel>
            <DropdownMenuItem disabled className="justify-between">
              <span className="flex items-center gap-2">
                <Keyboard /> Search sections
              </span>
              <kbd className="rounded border border-admin-border px-1.5 text-[11px]">/</kbd>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink /> Open public site
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="grid size-8 place-items-center rounded-full bg-emerald-700 text-xs font-semibold text-white ring-2 ring-white hover:bg-emerald-800"
            aria-label="Account menu"
          >
            {initials(name)}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel className="text-admin-text">
              <span className="block text-sm font-medium">{name}</span>
              <span className="block truncate text-xs font-normal text-admin-muted">{email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/account">
                <UserRound /> Profile & password
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <LogoutItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
