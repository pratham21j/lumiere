import type { Metadata } from "next";
import { SearchExperience } from "@/features/search/components/search-experience";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        <p className="eyebrow mb-1">Semantic search</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          Search by feeling, not keyword
        </h1>
      </div>
      <SearchExperience initialQuery={q?.slice(0, 200)} />
    </main>
  );
}
