import { prisma } from "@/lib/db";
import { getAIProvider } from "@/lib/providers/ai";
import { mockEmbed, movieEmbeddingText } from "@/lib/providers/ai/mock-embeddings";
import { getMovieProvider, type MovieSummary, type Genre } from "@/lib/providers/movie";
import { logger } from "@/lib/logger";

/**
 * Semantic search — one entry point, two engines:
 *
 * 1. Database present: query embedding via the active AI provider, then a
 *    pgvector cosine scan over Movie.embedding (HNSW-indexed).
 * 2. No database: in-memory cosine over the provider catalog using the
 *    deterministic mock embeddings, so vibe search works with zero setup.
 */

export interface SearchHit {
  movie: MovieSummary;
  /** 0..1, higher is closer. */
  similarity: number;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // vectors are L2-normalized
}

// ---- In-memory engine (no DB) ----

let memoryIndex: { movie: MovieSummary; vector: number[] }[] | null = null;

async function getMemoryIndex() {
  if (!memoryIndex) {
    const catalog = await getMovieProvider().catalog();
    memoryIndex = catalog.map((m) => ({
      movie: {
        id: m.id,
        title: m.title,
        overview: m.overview,
        posterPath: m.posterPath,
        backdropPath: m.backdropPath,
        releaseDate: m.releaseDate,
        voteAverage: m.voteAverage,
        popularity: m.popularity,
        genres: m.genres,
      },
      vector: mockEmbed(movieEmbeddingText(m)),
    }));
  }
  return memoryIndex;
}

// ---- pgvector engine ----

interface VectorRow {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  popularity: number;
  genres: unknown;
  distance: number;
}

async function pgvectorSearch(queryVector: number[], limit: number): Promise<SearchHit[]> {
  const literal = `[${queryVector.map((x) => x.toFixed(6)).join(",")}]`;
  const rows = await prisma!.$queryRawUnsafe<VectorRow[]>(
    `SELECT id, title, overview, "posterPath", "backdropPath", "releaseDate",
            "voteAverage", popularity, genres,
            (embedding <=> $1::vector) AS distance
     FROM "Movie"
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    literal,
    limit,
  );
  return rows.map((r) => ({
    movie: {
      id: r.id,
      title: r.title,
      overview: r.overview,
      posterPath: r.posterPath,
      backdropPath: r.backdropPath,
      releaseDate: r.releaseDate,
      voteAverage: r.voteAverage,
      popularity: r.popularity,
      genres: r.genres as Genre[],
    },
    similarity: Math.max(0, 1 - r.distance),
  }));
}

export async function semanticSearch(query: string, limit = 20): Promise<SearchHit[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (prisma) {
    try {
      const vector = await getAIProvider().embed(trimmed);
      return await pgvectorSearch(vector, limit);
    } catch (err) {
      logger.warn("pgvector search failed; falling back to memory index", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const index = await getMemoryIndex();
  const queryVector = mockEmbed(trimmed);
  return index
    .map(({ movie, vector }) => ({ movie, similarity: cosine(queryVector, vector) }))
    .filter((h) => h.similarity > 0.01)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

/** Candidate pool for the chat: semantic hits + a popularity backfill. */
export async function chatCandidates(query: string, limit = 24): Promise<MovieSummary[]> {
  const hits = await semanticSearch(query, limit);
  const seen = new Set(hits.map((h) => h.movie.id));
  const results = hits.map((h) => h.movie);
  if (results.length < limit) {
    const popular = await getMovieProvider().browse("popular");
    for (const m of popular.results) {
      if (results.length >= limit) break;
      if (!seen.has(m.id)) {
        results.push(m);
        seen.add(m.id);
      }
    }
  }
  return results;
}
