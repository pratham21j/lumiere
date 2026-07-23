"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SearchIcon, Loader2 } from "lucide-react";
import type { MovieSummary } from "@/lib/providers/movie/types";
import type { ApiResponse } from "@/lib/api";
import { MovieCard } from "@/components/shared/movie-card";
import { VoiceButton } from "./voice-button";

interface Hit {
  movie: MovieSummary;
  similarity: number | null;
}

type Mode = "semantic" | "keyword";

const VIBE_EXAMPLES = [
  "slow psychological thriller",
  "sad romance",
  "time travel",
  "movies where the villain wins",
  "underrated gems",
];

export function SearchExperience({ initialQuery }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery ?? "");
  const [mode, setMode] = useState<Mode>("semantic");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(async (q: string, m: Mode) => {
    abortRef.current?.abort();
    if (!q.trim()) {
      setHits(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(q.trim())}&mode=${m}`,
        { signal: controller.signal },
      );
      const json = (await res.json()) as ApiResponse<{ hits: Hit[] }>;
      if (!json.ok) throw new Error(json.error.message);
      setHits(json.data.hits);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Search failed. Try again.");
    } finally {
      if (abortRef.current === controller) setLoading(false);
    }
  }, []);

  // Debounced live search.
  useEffect(() => {
    const t = setTimeout(() => void runSearch(query, mode), 350);
    return () => clearTimeout(t);
  }, [query, mode, runSearch]);

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="glow-ai flex flex-1 items-center gap-3 rounded-2xl border border-phosphor/20 bg-surface/90 p-1.5 pl-4 focus-within:border-phosphor/50">
          <SearchIcon aria-hidden className="size-4 shrink-0 text-ash" />
          <label htmlFor="search-input" className="sr-only">
            Search films by vibe or title
          </label>
          <input
            id="search-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              mode === "semantic"
                ? "Describe it — “slow psychological thriller”"
                : "Search by title, actor, or director"
            }
            autoComplete="off"
            autoFocus
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-linen outline-none placeholder:text-ash/70"
          />
          {loading && <Loader2 aria-hidden className="mr-2 size-4 animate-spin text-ash" />}
        </div>
        <VoiceButton onTranscript={setQuery} />
      </div>

      <div className="mt-3 flex items-center gap-2" role="radiogroup" aria-label="Search mode">
        {(["semantic", "keyword"] as const).map((m) => (
          <button
            key={m}
            role="radio"
            aria-checked={mode === m}
            onClick={() => setMode(m)}
            className={`rounded-full px-3 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor ${
              mode === m
                ? m === "semantic"
                  ? "bg-phosphor/15 text-phosphor"
                  : "bg-surface-raised text-linen"
                : "text-ash hover:text-linen"
            }`}
          >
            {m === "semantic" ? "By vibe (AI)" : "By keyword"}
          </button>
        ))}
      </div>

      {/* Results / empty states */}
      <div className="mt-8" aria-live="polite">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {!error && hits === null && (
          <div className="py-12 text-center">
            <p className="text-sm text-ash">Try searching the way you&apos;d describe it to a friend:</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {VIBE_EXAMPLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setQuery(v)}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-ash transition-colors hover:border-phosphor/40 hover:text-linen"
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        )}

        {!error && hits !== null && hits.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-ash">
            Nothing matched that. Try different words — moods and themes work
            better than exact plots.
          </p>
        )}

        {!error && hits !== null && hits.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {hits.map((h) => (
              <div key={h.movie.id}>
                <MovieCard movie={h.movie} />
                {h.similarity !== null && (
                  <div
                    aria-hidden
                    className="mx-0.5 mt-2 h-0.5 overflow-hidden rounded-full bg-surface-raised"
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-phosphor to-phosphor-soft"
                      style={{ width: `${Math.round(Math.min(1, h.similarity) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
