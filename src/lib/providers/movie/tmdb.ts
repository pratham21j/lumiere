import { env } from "@/lib/env";
import type {
  BrowseList,
  MovieDetails,
  MovieProvider,
  MovieSummary,
  Paginated,
  WatchProvider,
} from "./types";

/**
 * TMDB-backed provider. Activated with TMDB_API_KEY (+ MOVIE_PROVIDER=tmdb).
 * Uses Next's fetch cache with tag-based revalidation.
 */

const BASE = "https://api.themoviedb.org/3";
const LIST_PATH: Record<BrowseList, string> = {
  trending: "/trending/movie/day",
  popular: "/movie/popular",
  top_rated: "/movie/top_rated",
  upcoming: "/movie/upcoming",
  now_playing: "/movie/now_playing",
};

// Loose typing at the boundary; normalized before leaving this file.
/* eslint-disable @typescript-eslint/no-explicit-any */

async function tmdb<T>(path: string, params: Record<string, string> = {}, revalidate = 3600): Promise<T> {
  const url = new URL(BASE + path);
  url.searchParams.set("api_key", env.TMDB_API_KEY ?? "");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { next: { revalidate } });
  if (!res.ok) throw new Error(`TMDB ${path} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function toSummary(m: any): MovieSummary {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview ?? "",
    posterPath: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
    backdropPath: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : null,
    releaseDate: m.release_date ?? "",
    voteAverage: m.vote_average ?? 0,
    popularity: m.popularity ?? 0,
    genres: (m.genres ?? m.genre_ids?.map((id: number) => ({ id, name: "" })) ?? []) as MovieSummary["genres"],
  };
}

export class TmdbMovieProvider implements MovieProvider {
  async browse(list: BrowseList, page = 1): Promise<Paginated<MovieSummary>> {
    const data = await tmdb<any>(LIST_PATH[list], { page: String(page) });
    return {
      results: (data.results ?? []).map(toSummary),
      page: data.page ?? page,
      totalPages: Math.min(data.total_pages ?? 1, 500),
    };
  }

  async details(id: number): Promise<MovieDetails | null> {
    try {
      const m = await tmdb<any>(
        `/movie/${id}`,
        { append_to_response: "credits,videos,watch/providers,keywords,reviews" },
        86_400,
      );
      const trailer = (m.videos?.results ?? []).find(
        (v: any) => v.site === "YouTube" && v.type === "Trailer",
      );
      const providersRegion = m["watch/providers"]?.results?.US ?? {};
      const providers: WatchProvider[] = (["flatrate", "rent", "buy"] as const).flatMap(
        (kind) =>
          (providersRegion[kind] ?? []).map((p: any) => ({
            name: p.provider_name,
            logoPath: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
            kind: kind === "flatrate" ? ("stream" as const) : (kind as "rent" | "buy"),
          })),
      );
      return {
        ...toSummary(m),
        runtime: m.runtime ?? null,
        tagline: m.tagline || null,
        budget: m.budget ?? 0,
        revenue: m.revenue ?? 0,
        originalLanguage: m.original_language ?? "en",
        cast: (m.credits?.cast ?? []).slice(0, 20).map((c: any, i: number) => ({
          id: c.id,
          name: c.name,
          character: c.character ?? "",
          profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null,
          order: c.order ?? i,
        })),
        crew: (m.credits?.crew ?? [])
          .filter((c: any) => ["Director", "Screenplay", "Writer", "Producer"].includes(c.job))
          .slice(0, 12)
          .map((c: any) => ({ id: c.id, name: c.name, job: c.job, department: c.department })),
        trailerKey: trailer?.key ?? null,
        watchProviders: providers,
        keywords: (m.keywords?.keywords ?? []).map((k: any) => k.name),
        awards: [], // TMDB has no awards endpoint; enriched via AI provider if desired
        reviews: (m.reviews?.results ?? []).slice(0, 20).map((r: any) => ({
          author: r.author,
          content: r.content,
          rating: r.author_details?.rating ?? null,
          createdAt: r.created_at,
        })),
      };
    } catch {
      return null;
    }
  }

  async similar(id: number, limit = 12): Promise<MovieSummary[]> {
    const data = await tmdb<any>(`/movie/${id}/recommendations`);
    return (data.results ?? []).slice(0, limit).map(toSummary);
  }

  async searchByKeyword(query: string, page = 1): Promise<Paginated<MovieSummary>> {
    const data = await tmdb<any>("/search/movie", { query, page: String(page) }, 600);
    return {
      results: (data.results ?? []).map(toSummary),
      page: data.page ?? page,
      totalPages: Math.min(data.total_pages ?? 1, 500),
    };
  }

  async catalog(): Promise<MovieDetails[]> {
    // For TMDB, "catalog" = top popular pages; used only for embedding sync jobs.
    const pages = await Promise.all(
      [1, 2, 3].map((p) => tmdb<any>("/movie/popular", { page: String(p) })),
    );
    const ids: number[] = pages.flatMap((d) => (d.results ?? []).map((m: any) => m.id));
    const details = await Promise.all(ids.map((id) => this.details(id)));
    return details.filter((d): d is MovieDetails => d !== null);
  }
}
