import type {
  BrowseList,
  MovieDetails,
  MovieProvider,
  MovieSummary,
  Paginated,
} from "./types";
import { MOCK_BY_ID, MOCK_CATALOG } from "./mock-catalog";

const PAGE_SIZE = 20;

function toSummary(m: MovieDetails): MovieSummary {
  const { id, title, overview, posterPath, backdropPath, releaseDate, voteAverage, popularity, genres } = m;
  return { id, title, overview, posterPath, backdropPath, releaseDate, voteAverage, popularity, genres };
}

function paginate(items: MovieSummary[], page: number): Paginated<MovieSummary> {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const p = Math.min(Math.max(1, page), totalPages);
  return { results: items.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE), page: p, totalPages };
}

/** "Now" for upcoming/now-playing lists; fixed logic, data-driven dates. */
function isUpcoming(m: MovieDetails): boolean {
  return new Date(m.releaseDate) > new Date();
}
function isNowPlaying(m: MovieDetails): boolean {
  const release = new Date(m.releaseDate).getTime();
  const now = Date.now();
  const days = (now - release) / 86_400_000;
  return days >= 0 && days <= 90;
}

/**
 * Zero-dependency provider backed by the curated catalog.
 * Deterministic ordering so lists are stable across renders/tests.
 */
export class MockMovieProvider implements MovieProvider {
  async browse(list: BrowseList, page = 1): Promise<Paginated<MovieSummary>> {
    let items: MovieDetails[];
    switch (list) {
      case "trending":
        items = [...MOCK_CATALOG].sort((a, b) => b.popularity - a.popularity);
        break;
      case "popular":
        items = [...MOCK_CATALOG].sort(
          (a, b) => b.popularity * b.voteAverage - a.popularity * a.voteAverage,
        );
        break;
      case "top_rated":
        items = [...MOCK_CATALOG]
          .filter((m) => m.voteAverage > 0)
          .sort((a, b) => b.voteAverage - a.voteAverage);
        break;
      case "upcoming":
        items = MOCK_CATALOG.filter(isUpcoming).sort(
          (a, b) => +new Date(a.releaseDate) - +new Date(b.releaseDate),
        );
        break;
      case "now_playing":
        items = MOCK_CATALOG.filter(isNowPlaying).sort((a, b) => b.popularity - a.popularity);
        break;
    }
    return paginate(items.map(toSummary), page);
  }

  async details(id: number): Promise<MovieDetails | null> {
    return MOCK_BY_ID.get(id) ?? null;
  }

  async similar(id: number, limit = 12): Promise<MovieSummary[]> {
    const target = MOCK_BY_ID.get(id);
    if (!target) return [];
    const targetKeywords = new Set(target.keywords);
    const targetGenres = new Set(target.genres.map((g) => g.id));
    return MOCK_CATALOG.filter((m) => m.id !== id)
      .map((m) => {
        const kw = m.keywords.filter((k) => targetKeywords.has(k)).length;
        const gn = m.genres.filter((g) => targetGenres.has(g.id)).length;
        return { movie: m, score: kw * 2 + gn };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => toSummary(s.movie));
  }

  async searchByKeyword(query: string, page = 1): Promise<Paginated<MovieSummary>> {
    const q = query.trim().toLowerCase();
    if (!q) return { results: [], page: 1, totalPages: 1 };
    const matches = MOCK_CATALOG.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        m.keywords.some((k) => k.includes(q)) ||
        m.cast.some((c) => c.name.toLowerCase().includes(q)) ||
        m.crew.some((c) => c.name.toLowerCase().includes(q)),
    ).sort((a, b) => b.popularity - a.popularity);
    return paginate(matches.map(toSummary), page);
  }

  async catalog(): Promise<MovieDetails[]> {
    return MOCK_CATALOG;
  }
}
