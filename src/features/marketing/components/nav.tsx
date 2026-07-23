import Link from "next/link";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function MarketingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-ink/70 backdrop-blur-xl">
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-linen"
        >
          {SITE.name}
          <span className="ml-1.5 align-middle text-[9px] font-normal tracking-[0.2em] text-ash uppercase">
            beta
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-ash transition-colors hover:text-linen"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button
            nativeButton={false}
            render={<Link href="/login" />}
            variant="ghost"
            size="sm"
            className="text-ash hover:text-linen"
          >
            Sign in
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/home" />}
            size="sm"
            className="bg-tungsten text-[#171203] hover:bg-tungsten/90"
          >
            Start watching smarter
          </Button>
        </div>
      </nav>
    </header>
  );
}
