import type { Metadata } from "next";
import Link from "next/link";
import { resolved } from "@/lib/env";
import { requireUser } from "@/features/auth/session";
import { getWatchlist } from "@/features/watchlist/queries";
import { WatchlistTabs } from "@/features/watchlist/components/watchlist-tabs";
import { DbRequiredNotice } from "@/components/shared/db-required-notice";

export const metadata: Metadata = { title: "Watchlist" };

export default async function WatchlistPage() {
  if (!resolved.hasDatabase) {
    return <DbRequiredNotice feature="Your watchlist" />;
  }
  const user = await requireUser();
  const entries = await getWatchlist(user.id);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        <p className="eyebrow mb-1">Your library</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          Watchlist
        </h1>
        <p className="mt-1 text-sm text-ash">
          {entries.length === 0 ? (
            <>
              Save films from any page — or{" "}
              <Link href="/home" className="text-phosphor underline-offset-4 hover:underline">
                start browsing
              </Link>
              .
            </>
          ) : (
            `${entries.length} film${entries.length === 1 ? "" : "s"} saved.`
          )}
        </p>
      </div>
      <WatchlistTabs entries={entries} />
    </main>
  );
}
