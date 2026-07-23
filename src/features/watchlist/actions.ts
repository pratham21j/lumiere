"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/lib/db";
import { requireUserId } from "@/features/auth/session";
import { ensureMovieInDb } from "@/features/movies/db";

const movieIdSchema = z.number().int().positive();
const statusSchema = z.enum(["PLANNED", "WATCHING", "WATCHED"]);

function revalidate() {
  revalidatePath("/watchlist");
  revalidatePath("/movies/[id]", "page");
}

/** Add or remove a movie; returns the new saved state. */
export async function toggleWatchlist(rawMovieId: number): Promise<{ saved: boolean }> {
  const userId = await requireUserId();
  const movieId = movieIdSchema.parse(rawMovieId);
  const db = requireDb();

  const existing = await db.watchlistItem.findUnique({
    where: { userId_movieId: { userId, movieId } },
  });
  if (existing) {
    await db.watchlistItem.delete({ where: { id: existing.id } });
    revalidate();
    return { saved: false };
  }
  await ensureMovieInDb(movieId);
  await db.watchlistItem.create({ data: { userId, movieId } });
  revalidate();
  return { saved: true };
}

export async function setWatchStatus(
  rawMovieId: number,
  rawStatus: "PLANNED" | "WATCHING" | "WATCHED",
): Promise<void> {
  const userId = await requireUserId();
  const movieId = movieIdSchema.parse(rawMovieId);
  const status = statusSchema.parse(rawStatus);
  const db = requireDb();

  await ensureMovieInDb(movieId);
  await db.watchlistItem.upsert({
    where: { userId_movieId: { userId, movieId } },
    create: {
      userId,
      movieId,
      status,
      watchedAt: status === "WATCHED" ? new Date() : null,
    },
    update: {
      status,
      watchedAt: status === "WATCHED" ? new Date() : null,
    },
  });
  revalidate();
}
