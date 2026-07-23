/**
 * Seed: loads the curated catalog into Postgres with embeddings, and
 * creates the smart/featured collections. Idempotent (upserts).
 *
 * Run: npx prisma db seed   (configured in package.json)
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { MOCK_CATALOG } from "../src/lib/providers/movie/mock-catalog";
import { mockEmbed, movieEmbeddingText } from "../src/lib/providers/ai/mock-embeddings";

const prisma = new PrismaClient();

const SMART_COLLECTIONS: {
  name: string;
  slug: string;
  description: string;
  pick: (m: (typeof MOCK_CATALOG)[number]) => boolean;
  reason: (m: (typeof MOCK_CATALOG)[number]) => string;
}[] = [
  {
    name: "Mind Bending",
    slug: "mind-bending",
    description: "Films that fold back on themselves — puzzles, twists, and timelines that reward a second watch.",
    pick: (m) => m.keywords.some((k) => ["mind-bending", "puzzle", "nonlinear", "twist"].includes(k)),
    reason: (m) => `${m.title} earns its place with structure you'll want to re-watch to fully unpack.`,
  },
  {
    name: "Weekend Chill",
    slug: "weekend-chill",
    description: "Low-stakes, high-warmth picks for a slow Saturday.",
    pick: (m) => m.keywords.some((k) => ["feel-good", "wholesome", "charming", "cozy-mystery"].includes(k)) && m.runtime !== null && m.runtime <= 135,
    reason: (m) => `${m.title} keeps things warm and easy — ideal when you don't want the film to ask too much.`,
  },
  {
    name: "Oscar Winners",
    slug: "oscar-winners",
    description: "Academy Award winners from the catalog.",
    pick: (m) => m.awards.some((a) => a.includes("Academy Award")),
    reason: (m) => `${m.awards.find((a) => a.includes("Academy Award"))}.`,
  },
  {
    name: "Underrated Gems",
    slug: "underrated-gems",
    description: "Smaller films that outperform their fame.",
    pick: (m) => m.keywords.includes("underrated") || (m.popularity < 45 && m.voteAverage >= 7.4),
    reason: (m) => `${m.title} flies under the radar — strong ratings, small spotlight.`,
  },
  {
    name: "Family Night",
    slug: "family-night",
    description: "Safe for everyone on the couch, boring for no one.",
    pick: (m) => m.genres.some((g) => g.name === "Family"),
    reason: (m) => `${m.title} works for every age in the room at once.`,
  },
  {
    name: "Sci-Fi Marathon",
    slug: "sci-fi-marathon",
    description: "Back-to-back science fiction, ordered for momentum.",
    pick: (m) => m.genres.some((g) => g.name === "Science Fiction") && m.voteAverage >= 7.5,
    reason: (m) => `${m.title} anchors a marathon: big ideas, ${m.runtime} minutes.`,
  },
];

function vectorLiteral(v: number[]): string {
  return `[${v.map((x) => x.toFixed(6)).join(",")}]`;
}

async function main() {
  console.log(`Seeding ${MOCK_CATALOG.length} movies…`);

  for (const m of MOCK_CATALOG) {
    const data = {
      title: m.title,
      overview: m.overview,
      posterPath: m.posterPath,
      backdropPath: m.backdropPath,
      releaseDate: m.releaseDate,
      runtime: m.runtime,
      tagline: m.tagline,
      budget: BigInt(m.budget),
      revenue: BigInt(m.revenue),
      language: m.originalLanguage,
      voteAverage: m.voteAverage,
      popularity: m.popularity,
      genres: m.genres as unknown as Prisma.InputJsonValue,
      cast: m.cast as unknown as Prisma.InputJsonValue,
      crew: m.crew as unknown as Prisma.InputJsonValue,
      keywords: m.keywords as unknown as Prisma.InputJsonValue,
      awards: m.awards as unknown as Prisma.InputJsonValue,
      trailerKey: m.trailerKey,
      watchProviders: m.watchProviders as unknown as Prisma.InputJsonValue,
    };
    await prisma.movie.upsert({ where: { id: m.id }, create: { id: m.id, ...data }, update: data });

    const embedding = mockEmbed(movieEmbeddingText(m));
    await prisma.$executeRawUnsafe(
      `UPDATE "Movie" SET embedding = $1::vector WHERE id = $2`,
      vectorLiteral(embedding),
      m.id,
    );
  }

  console.log("Seeding smart collections…");
  for (const c of SMART_COLLECTIONS) {
    const collection = await prisma.collection.upsert({
      where: { slug: c.slug },
      create: { name: c.name, slug: c.slug, description: c.description, isSmart: true, isFeatured: true },
      update: { name: c.name, description: c.description },
    });
    const members = MOCK_CATALOG.filter(c.pick).slice(0, 12);
    for (const [i, m] of members.entries()) {
      await prisma.collectionItem.upsert({
        where: { collectionId_movieId: { collectionId: collection.id, movieId: m.id } },
        create: { collectionId: collection.id, movieId: m.id, position: i, reason: c.reason(m) },
        update: { position: i, reason: c.reason(m) },
      });
    }
    console.log(`  ${c.name}: ${members.length} films`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
