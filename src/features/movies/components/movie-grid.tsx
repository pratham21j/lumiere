"use client";

import { Loader2 } from "lucide-react";
import type { MovieSummary, Paginated } from "@/lib/providers/movie/types";
import { MovieCard } from "@/components/shared/movie-card";
import { useInfiniteMovies } from "../hooks";

interface Props {
  list: string;
  initial: Paginated<MovieSummary>;
}

export function MovieGrid({ list, initial }: Props) {
  const { movies, loading, error, hasMore, sentinelRef, loadMore } =
    useInfiniteMovies(list, initial);

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {movies.map((m, i) => (
          <MovieCard key={m.id} movie={m} priority={i < 5} />
        ))}
      </div>

      <div ref={sentinelRef} aria-hidden className="h-px" />

      <div className="flex justify-center py-10" aria-live="polite">
        {loading && (
          <span className="flex items-center gap-2 text-sm text-ash">
            <Loader2 aria-hidden className="size-4 animate-spin" /> Loading more…
          </span>
        )}
        {error && (
          <button
            type="button"
            onClick={loadMore}
            className="text-sm text-destructive underline-offset-4 hover:underline"
          >
            {error} — tap to retry
          </button>
        )}
        {!hasMore && !loading && movies.length > 0 && (
          <span className="font-data text-xs text-ash/60">
            {movies.length} films — that&apos;s the end of this list
          </span>
        )}
      </div>
    </>
  );
}
