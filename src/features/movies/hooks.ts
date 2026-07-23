"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MovieSummary, Paginated } from "@/lib/providers/movie/types";
import type { ApiResponse } from "@/lib/api";

/**
 * Infinite-scroll pagination over /api/movies/[list].
 * Feed `sentinelRef` to an element near the end of the list; the next page
 * loads when it enters the viewport.
 */
export function useInfiniteMovies(list: string, initial: Paginated<MovieSummary>) {
  const [movies, setMovies] = useState<MovieSummary[]>(initial.results);
  const [page, setPage] = useState(initial.page);
  const [totalPages, setTotalPages] = useState(initial.totalPages);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/browse/${list}?page=${page + 1}`);
      const json = (await res.json()) as ApiResponse<Paginated<MovieSummary>>;
      if (!json.ok) throw new Error(json.error.message);
      setMovies((prev) => {
        const seen = new Set(prev.map((m) => m.id));
        return [...prev, ...json.data.results.filter((m) => !seen.has(m.id))];
      });
      setPage(json.data.page);
      setTotalPages(json.data.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load more films.");
    } finally {
      setLoading(false);
    }
  }, [list, page, hasMore, loading]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, hasMore]);

  return { movies, loading, error, hasMore, sentinelRef, loadMore };
}
