"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireDb } from "@/lib/db";
import { requireUserId } from "@/features/auth/session";
import { ensureMovieInDb } from "@/features/movies/db";

const nameSchema = z
  .string()
  .trim()
  .min(2, "Give the collection a name (2+ characters).")
  .max(50, "Keep the name under 50 characters.");

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

export async function createCollection(
  rawName: string,
): Promise<{ id: string; slug: string }> {
  const userId = await requireUserId();
  const name = nameSchema.parse(rawName);
  const db = requireDb();

  const collection = await db.collection.create({
    data: { userId, name, slug: slugify(name) },
  });
  revalidatePath("/collections");
  return { id: collection.id, slug: collection.slug };
}

export async function deleteCollection(collectionId: string): Promise<void> {
  const userId = await requireUserId();
  const db = requireDb();
  // Owner-scoped delete: smart/site collections (userId null) are untouchable here.
  await db.collection.deleteMany({ where: { id: collectionId, userId } });
  revalidatePath("/collections");
}

export async function addToCollection(
  collectionId: string,
  rawMovieId: number,
): Promise<void> {
  const userId = await requireUserId();
  const movieId = z.number().int().positive().parse(rawMovieId);
  const db = requireDb();

  const collection = await db.collection.findFirst({
    where: { id: collectionId, userId },
    select: { id: true, slug: true },
  });
  if (!collection) throw new Error("That collection doesn't exist or isn't yours.");

  await ensureMovieInDb(movieId);
  const last = await db.collectionItem.findFirst({
    where: { collectionId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  await db.collectionItem.upsert({
    where: { collectionId_movieId: { collectionId, movieId } },
    create: { collectionId, movieId, position: (last?.position ?? -1) + 1 },
    update: {},
  });
  revalidatePath(`/collections/${collection.slug}`);
  revalidatePath("/collections");
}

export async function removeFromCollection(
  collectionId: string,
  movieId: number,
): Promise<void> {
  const userId = await requireUserId();
  const db = requireDb();

  const collection = await db.collection.findFirst({
    where: { id: collectionId, userId },
    select: { slug: true },
  });
  if (!collection) throw new Error("That collection doesn't exist or isn't yours.");

  await db.collectionItem.deleteMany({ where: { collectionId, movieId } });
  revalidatePath(`/collections/${collection.slug}`);
}
