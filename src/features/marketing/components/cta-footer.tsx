import Link from "next/link";
import { SITE } from "@/lib/site";
import { Button } from "@/components/ui/button";

export function CtaAndFooter() {
  return (
    <>
      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 50% 100%, color-mix(in srgb, var(--tungsten) 8%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:py-32">
          <h2 className="font-display text-3xl font-bold tracking-tight text-linen sm:text-5xl">
            Tonight&apos;s film is one sentence away
          </h2>
          <p className="mt-4 max-w-md text-ash">
            Free while in beta. No card, no setup — describe a mood and press
            enter.
          </p>
          <Button
            nativeButton={false}
            render={<Link href="/home" />}
            size="lg"
            className="glow-tungsten mt-8 bg-tungsten text-[#171203] hover:bg-tungsten/90"
          >
            Start watching smarter
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="font-display text-lg font-bold text-linen">{SITE.name}</div>
            <p className="mt-2 max-w-xs text-sm text-ash">{SITE.tagline}.</p>
            <p className="font-data mt-6 text-xs text-ash/70">
              Film data from TMDB. This product uses the TMDB API but is not
              endorsed or certified by TMDB.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <div className="eyebrow mb-3">Product</div>
              <ul className="space-y-2 text-sm">
                <li><Link className="text-ash hover:text-linen" href="/chat">AI chat</Link></li>
                <li><Link className="text-ash hover:text-linen" href="/search">Search</Link></li>
                <li><Link className="text-ash hover:text-linen" href="/home">Browse</Link></li>
                <li><Link className="text-ash hover:text-linen" href="/moods">Moods</Link></li>
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-3">Account</div>
              <ul className="space-y-2 text-sm">
                <li><Link className="text-ash hover:text-linen" href="/login">Sign in</Link></li>
                <li><Link className="text-ash hover:text-linen" href="/watchlist">Watchlist</Link></li>
                <li><Link className="text-ash hover:text-linen" href="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <div className="eyebrow mb-3">Company</div>
              <ul className="space-y-2 text-sm">
                <li><a className="text-ash hover:text-linen" href="#features">Features</a></li>
                <li><a className="text-ash hover:text-linen" href="#faq">FAQ</a></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="border-t border-border/60 py-6 text-center">
          <p className="font-data text-xs text-ash/60">
            © {new Date().getFullYear()} {SITE.name}. All films remain the
            property of their studios.
          </p>
        </div>
      </footer>
    </>
  );
}
