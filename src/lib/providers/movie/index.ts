import { resolved } from "@/lib/env";
import type { MovieProvider } from "./types";
import { MockMovieProvider } from "./mock";
import { TmdbMovieProvider } from "./tmdb";

let instance: MovieProvider | null = null;

/** Factory — the only place that knows which movie backend is active. */
export function getMovieProvider(): MovieProvider {
  if (!instance) {
    instance =
      resolved.movieProvider === "tmdb"
        ? new TmdbMovieProvider()
        : new MockMovieProvider();
  }
  return instance;
}

export * from "./types";
