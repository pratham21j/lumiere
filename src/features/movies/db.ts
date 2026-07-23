import type { Movie as DbMovie, Prisma } from "@prisma/client";
import { requireDb } from "@/lib/db";
import { getMovieProvider, type Genre, type MovieSummary } from "@/lib/providers/movie";
import { getAIProvider } from "@/lib/providers/ai";
import { movieEmbeddingText } from "@/lib/providers/ai/mock-embeddings";
import { logger } from "@/lib/logger";

/** Map a DB movie row back to the domain summary shape. */
export function dbMovieToSummary(m: DbMovie): MovieSummary {
  return {
    id: m.id,
    title: m.title,
    overview: m.overview,
    posterPath: m.posterPath,
    backdropPath: m.backdropPath,
    releaseDate: m.releaseDate,
    voteAverage: m.voteAverage,
    popularity: m.popularity,
    genres: m.genres as unknown as Genre[],
  };
}

function vectorLiteral(v: number[]): string {
  return `[${v.map((x) => x.toFixed(6)).join(",")}]`;
}

/**
 * Guarantee a movie row exists before referencing it (watchlist, ratings,
 * collections). In mock mode the seed pre-loads everything; in TMDB mode
 * rows are created lazily on first touch, embedding included.
 */
export async function ensureMovieInDb(movieId: number): Promise<void> {
  const db = requireDb();
  const exists = await db.movie.findUnique({ where: { id: movieId }, select: { id: true } });
  if (exists) return;

  const details = await getMovieProvider().details(movieId);
  if (!details) throw new Error(`Movie ${movieId} was not found.`);

  await db.movie.create({
    data: {
      id: details.id,
      title: details.title,
      overview: details.overview,
      posterPath: details.posterPath,
      backdropPath: details.backdropPath,
      releaseDate: details.releaseDate,
      runtime: details.runtime,
      tagline: details.tagline,
      budget: BigInt(details.budget),
      revenue: BigInt(details.revenue),
      language: details.originalLanguage,
      voteAverage: details.voteAverage,
      popularity: details.popularity,
      genres: details.genres as unknown as Prisma.InputJsonValue,
      cast: details.cast as unknown as Prisma.InputJsonValue,
      crew: details.crew as unknown as Prisma.InputJsonValue,
      keywords: details.keywords as unknown as Prisma.InputJsonValue,
      awards: details.awards as unknown as Prisma.InputJsonValue,
      trailerKey: details.trailerKey,
      watchProviders: details.watchProviders as unknown as Prisma.InputJsonValue,
    },
  });

  try {
    const embedding = await getAIProvider().embed(movieEmbeddingText(details));
    await db.$executeRawUnsafe(
      `UPDATE "Movie" SET embedding = $1::vector WHERE id = $2`,
      vectorLiteral(embedding),
      movieId,
    );
  } catch (err) {
    // Embedding failures shouldn't block saving to a watchlist.
    logger.warn("embedding backfill failed", {
      movieId,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}
