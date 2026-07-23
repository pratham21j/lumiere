import { requireDb } from "@/lib/db";
import { dbMovieToSummary } from "@/features/movies/db";
import type { MovieSummary } from "@/lib/providers/movie";

export interface CollectionCard {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSmart: boolean;
  count: number;
  preview: MovieSummary[]; // first few films, for cover art
}

export interface CollectionDetail extends CollectionCard {
  ownedByViewer: boolean;
  items: { movie: MovieSummary; reason: string | null }[];
}

const cardInclude = {
  items: {
    orderBy: { position: "asc" as const },
    take: 4,
    include: { movie: true },
  },
  _count: { select: { items: true } },
};

type CardRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isSmart: boolean;
  items: { movie: Parameters<typeof dbMovieToSummary>[0] }[];
  _count: { items: number };
};

function toCard(c: CardRow): CollectionCard {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isSmart: c.isSmart,
    count: c._count.items,
    preview: c.items.map((i) => dbMovieToSummary(i.movie)),
  };
}

/** Site-wide featured (smart) collections. */
export async function getFeaturedCollections(): Promise<CollectionCard[]> {
  const db = requireDb();
  const rows = await db.collection.findMany({
    where: { isFeatured: true, userId: null },
    include: cardInclude,
    orderBy: { name: "asc" },
  });
  return rows.map(toCard);
}

export async function getUserCollections(userId: string): Promise<CollectionCard[]> {
  const db = requireDb();
  const rows = await db.collection.findMany({
    where: { userId },
    include: cardInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toCard);
}

/** A collection by slug — site collections are public, user ones owner-only. */
export async function getCollectionBySlug(
  slug: string,
  viewerId: string | null,
): Promise<CollectionDetail | null> {
  const db = requireDb();
  const c = await db.collection.findUnique({
    where: { slug },
    include: {
      items: { orderBy: { position: "asc" }, include: { movie: true } },
      _count: { select: { items: true } },
    },
  });
  if (!c) return null;
  if (c.userId && c.userId !== viewerId) return null; // private to its owner
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    isSmart: c.isSmart,
    count: c._count.items,
    preview: c.items.slice(0, 4).map((i) => dbMovieToSummary(i.movie)),
    ownedByViewer: Boolean(c.userId && c.userId === viewerId),
    items: c.items.map((i) => ({
      movie: dbMovieToSummary(i.movie),
      reason: i.reason,
    })),
  };
}
