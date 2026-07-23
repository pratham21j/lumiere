/**
 * Domain types for the movie provider boundary.
 * Everything above this layer (UI, features, actions) speaks these types;
 * only lib/providers/movie/* knows whether data came from TMDB or mocks.
 */

export interface Genre {
  id: number;
  name: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface WatchProvider {
  name: string;
  logoPath: string | null;
  kind: "stream" | "rent" | "buy";
}

export interface MovieSummary {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string; // ISO yyyy-mm-dd
  voteAverage: number; // 0–10
  popularity: number;
  genres: Genre[];
}

export interface MovieDetails extends MovieSummary {
  runtime: number | null; // minutes
  tagline: string | null;
  budget: number;
  revenue: number;
  originalLanguage: string;
  cast: CastMember[];
  crew: CrewMember[];
  trailerKey: string | null; // YouTube key
  watchProviders: WatchProvider[];
  keywords: string[];
  awards: string[];
  reviews: MovieReview[];
}

export interface MovieReview {
  author: string;
  content: string;
  rating: number | null;
  createdAt: string;
}

export type BrowseList =
  | "trending"
  | "popular"
  | "top_rated"
  | "upcoming"
  | "now_playing";

export interface Paginated<T> {
  results: T[];
  page: number;
  totalPages: number;
}

/**
 * The contract every movie data source implements.
 * Swap implementations via MOVIE_PROVIDER env — no callers change.
 */
export interface MovieProvider {
  browse(list: BrowseList, page?: number): Promise<Paginated<MovieSummary>>;
  details(id: number): Promise<MovieDetails | null>;
  similar(id: number, limit?: number): Promise<MovieSummary[]>;
  searchByKeyword(query: string, page?: number): Promise<Paginated<MovieSummary>>;
  /** All movies known to the provider — used for seeding and embedding sync. */
  catalog(): Promise<MovieDetails[]>;
}
