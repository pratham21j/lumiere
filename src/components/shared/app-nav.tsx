"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  MessageCircle,
  Search,
  ListVideo,
  GaugeCircle,
  Smile,
  LogOut,
  FolderHeart,
} from "lucide-react";
import { SITE } from "@/lib/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface NavUser {
  name: string | null;
  email: string | null;
  image: string | null;
}

const LINKS = [
  { href: "/home", label: "Home", icon: Compass },
  { href: "/chat", label: "Chat", icon: MessageCircle, ai: true },
  { href: "/search", label: "Search", icon: Search },
  { href: "/moods", label: "Moods", icon: Smile },
  { href: "/watchlist", label: "Watchlist", icon: ListVideo },
  { href: "/dashboard", label: "Dashboard", icon: GaugeCircle },
];

export function AppNav({
  user,
  signOutAction,
}: {
  user: NavUser | null;
  signOutAction: () => Promise<void>;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-1 px-4 sm:gap-2 sm:px-6">
        <Link
          href="/"
          className="font-display mr-2 shrink-0 text-base font-bold tracking-tight text-linen sm:mr-4"
        >
          {SITE.name}
        </Link>

        <nav aria-label="App" className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                  active
                    ? l.ai
                      ? "bg-phosphor/10 text-phosphor"
                      : "bg-surface-raised text-linen"
                    : "text-ash hover:text-linen"
                }`}
              >
                <l.icon aria-hidden className="size-4" />
                <span className="hidden sm:inline">{l.label}</span>
                <span className="sr-only sm:hidden">{l.label}</span>
              </Link>
            );
          })}
        </nav>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
            >
              <Avatar className="size-8 border border-border">
                {user.image && <AvatarImage src={user.image} alt="" />}
                <AvatarFallback className="bg-surface-raised text-xs text-linen">
                  {(user.name ?? user.email ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="truncate">
                {user.name ?? user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/collections" />}>
                <FolderHeart aria-hidden className="size-4" /> Collections
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void signOutAction()}
                variant="destructive"
              >
                <LogOut aria-hidden className="size-4" /> Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link
            href="/login"
            className="shrink-0 rounded-lg bg-surface-raised px-3 py-1.5 text-sm text-linen transition-colors hover:bg-surface-raised/70"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
