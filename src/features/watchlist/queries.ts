import type { WatchStatus } from "@prisma/client";
import { requireDb } from "@/lib/db";
import { dbMovieToSummary } from "@/features/movies/db";
import type { MovieSummary } from "@/lib/providers/movie";

export interface WatchlistEntry {
  movie: MovieSummary;
  status: WatchStatus;
  addedAt: Date;
  watchedAt: Date | null;
}

export async function getWatchlist(userId: string): Promise<WatchlistEntry[]> {
  const db = requireDb();
  const items = await db.watchlistItem.findMany({
    where: { userId },
    include: { movie: true },
    orderBy: { addedAt: "desc" },
  });
  return items.map((i) => ({
    movie: dbMovieToSummary(i.movie),
    status: i.status,
    addedAt: i.addedAt,
    watchedAt: i.watchedAt,
  }));
}

export async function getWatchlistState(
  userId: string,
  movieId: number,
): Promise<{ saved: boolean; status: WatchStatus | null }> {
  const db = requireDb();
  const item = await db.watchlistItem.findUnique({
    where: { userId_movieId: { userId, movieId } },
    select: { status: true },
  });
  return { saved: Boolean(item), status: item?.status ?? null };
}
