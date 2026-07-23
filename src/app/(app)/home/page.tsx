import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { PosterRail } from "@/components/shared/poster-rail";
import { getBrowseList } from "@/features/movies/queries";
import type { BrowseList } from "@/lib/providers/movie";
import { resolved } from "@/lib/env";
import { getFeaturedCollections } from "@/features/collections/queries";
import { CollectionCard } from "@/features/collections/components/collection-card";

export const metadata: Metadata = { title: "Browse" };

const RAILS: { list: BrowseList; title: string; eyebrow: string }[] = [
  { list: "trending", title: "Trending today", eyebrow: "What everyone's watching" },
  { list: "popular", title: "Popular this week", eyebrow: "Crowd favorites" },
  { list: "top_rated", title: "Top rated", eyebrow: "The canon" },
  { list: "now_playing", title: "Now playing", eyebrow: "In theaters" },
  { list: "upcoming", title: "Upcoming", eyebrow: "Worth the wait" },
];

async function Rail({
  list,
  title,
  eyebrow,
  priority,
}: (typeof RAILS)[number] & { priority?: boolean }) {
  const { results } = await getBrowseList(list);
  return (
    <PosterRail
      title={title}
      eyebrow={eyebrow}
      movies={results}
      href={`/movies?list=${list}`}
      priority={priority}
    />
  );
}

async function SmartCollections() {
  if (!resolved.hasDatabase) return null;
  const featured = await getFeaturedCollections();
  if (featured.length === 0) return null;
  return (
    <section className="px-4 py-6 sm:px-6">
      <p className="eyebrow mb-1 text-phosphor/80">Curated by the concierge</p>
      <h2 className="font-display mb-4 text-xl font-semibold tracking-tight text-linen">
        Smart collections
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.slice(0, 6).map((c) => (
          <CollectionCard key={c.id} collection={c} />
        ))}
      </div>
    </section>
  );
}

function RailSkeleton() {
  return (
    <div className="px-4 py-6 sm:px-6">
      <Skeleton className="mb-4 h-6 w-44" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-36 shrink-0 rounded-xl sm:w-44" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl pb-16">
      <div className="px-4 pb-2 pt-10 sm:px-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          Browse
        </h1>
        <p className="mt-1 text-sm text-ash">
          The pulse of what&apos;s worth watching — or{" "}
          <Link href="/chat" className="text-phosphor underline-offset-4 hover:underline">
            ask the concierge
          </Link>{" "}
          for something specific.
        </p>
      </div>

      {RAILS.map((r, i) => (
        <Suspense key={r.list} fallback={<RailSkeleton />}>
          <Rail {...r} priority={i === 0} />
        </Suspense>
      ))}

      <Suspense fallback={null}>
        <SmartCollections />
      </Suspense>
    </main>
  );
}
