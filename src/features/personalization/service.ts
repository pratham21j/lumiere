import type { MovieSummary } from "@/lib/providers/movie";

const logger = {
  warn: (message: string, meta?: Record<string, unknown>) => {
    if (process.env.NODE_ENV !== "test") {
      console.warn(message, meta);
    }
  },
};

export interface DashboardRecommendation {
  movie: MovieSummary;
  reason: string;
  score: number;
}

export interface DashboardData {
  profileSummary: string;
  favoriteGenres: string[];
  favoriteLanguages: string[];
  stats: {
    likes: number;
    ratings: number;
    watchlistCount: number;
    collectionCount: number;
  };
  recentActivity: Array<{
    id: string;
    type: "LIKE" | "DISLIKE" | "VIEW" | "RATING";
    title: string;
    movieTitle: string;
    createdAt: string;
  }>;
  watchlist: Array<{
    movie: MovieSummary;
    status: "PLANNED" | "WATCHING" | "WATCHED";
    addedAt: Date;
    watchedAt: Date | null;
  }>;
  collections: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    count: number;
    preview: MovieSummary[];
  }>;
  recommendations: DashboardRecommendation[];
}

function normalizeGenres(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const maybeName = (item as { name?: unknown }).name;
    return typeof maybeName === "string" && maybeName.trim() ? [maybeName.trim()] : [];
  });
}

function buildProfileSummary(favoriteGenres: string[], favoriteLanguages: string[]): string {
  if (favoriteGenres.length === 0) {
    return "Your taste profile is still forming. Start liking, rating, or saving films to build a sharper dashboard.";
  }

  const topGenres = favoriteGenres.slice(0, 3).join(", ");
  const languageHint = favoriteLanguages[0]
    ? `You also seem drawn to ${favoriteLanguages[0]} stories.`
    : "";
  return `You tend to gravitate toward ${topGenres}. ${languageHint}`.trim();
}

export function summarizeTasteProfile(
  genreWeights: Record<string, number>,
  languages: string[],
): { summary: string; favoriteGenres: string[]; favoriteLanguages: string[] } {
  const rankedGenres = Object.entries(genreWeights)
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
  const favoriteGenres = rankedGenres.slice(0, 4);
  const favoriteLanguages = languages.slice(0, 3);
  return {
    summary: buildProfileSummary(favoriteGenres, favoriteLanguages),
    favoriteGenres,
    favoriteLanguages,
  };
}

export function scoreRecommendation(
  movieGenres: string[],
  favoriteGenres: string[],
  popularity: number,
): number {
  const overlap = movieGenres.reduce((score, genre) => {
    return score + (favoriteGenres.includes(genre) ? 1.5 : 0);
  }, 0);
  return overlap + Math.min(popularity / 1000, 1.2);
}

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const [{ requireDb }, { dbMovieToSummary }] = await Promise.all([
    import("@/lib/db"),
    import("@/features/movies/db"),
  ]);
  const db = requireDb();
  const { getMovieProvider } = await import("@/lib/providers/movie");

  const [interactions, ratings, watchlist, collections, providerData] = await Promise.all([
    db.interaction.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    db.rating.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.watchlistItem.findMany({
      where: { userId },
      include: { movie: true },
      orderBy: { addedAt: "desc" },
      take: 6,
    }),
    db.collection.findMany({
      where: { userId },
      include: {
        items: { take: 4, include: { movie: true }, orderBy: { position: "asc" } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    Promise.all([
      getMovieProvider().browse("popular", 1),
      getMovieProvider().browse("top_rated", 1),
      getMovieProvider().browse("trending", 1),
    ]),
  ]);

  const genreWeights: Record<string, number> = {};
  const languageBuckets = new Set<string>();

  for (const interaction of interactions) {
    const movieGenres = normalizeGenres((interaction.movie as { genres?: unknown }).genres);
    for (const genre of movieGenres) {
      genreWeights[genre] =
        (genreWeights[genre] ?? 0) + (interaction.type === "LIKE" ? 1.4 : 0.7);
    }
    if (interaction.movie.language) languageBuckets.add(interaction.movie.language);
  }

  for (const rating of ratings) {
    const movieGenres = normalizeGenres((rating.movie as { genres?: unknown }).genres);
    for (const genre of movieGenres) {
      genreWeights[genre] = (genreWeights[genre] ?? 0) + rating.value / 10;
    }
    if (rating.movie.language) languageBuckets.add(rating.movie.language);
  }

  const profile = summarizeTasteProfile(genreWeights, Array.from(languageBuckets));

  await db.tasteProfile
    .upsert({
      where: { userId },
      create: {
        userId,
        genreWeights: JSON.parse(JSON.stringify(genreWeights)),
        favoriteActors: [],
        languages: JSON.parse(JSON.stringify(Array.from(languageBuckets))),
        summary: profile.summary,
      },
      update: {
        genreWeights: JSON.parse(JSON.stringify(genreWeights)),
        languages: JSON.parse(JSON.stringify(Array.from(languageBuckets))),
        summary: profile.summary,
      },
    })
    .catch((error) => logger.warn("dashboard profile write failed", { error: String(error) }));

  const [popular, topRated, trending] = providerData;
  const candidates = [...popular.results, ...topRated.results, ...trending.results];
  const seen = new Set<number>();
  const recommendations = candidates
    .filter((movie) => {
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    })
    .map((movie) => ({
      movie,
      reason:
        profile.favoriteGenres.length > 0
          ? `Matches your recent interest in ${profile.favoriteGenres.slice(0, 2).join(" and ")}`
          : "A strong cross-section of popular picks",
      score: scoreRecommendation(
        movie.genres.map((genre) => genre.name),
        profile.favoriteGenres,
        movie.popularity,
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    profileSummary: profile.summary,
    favoriteGenres: profile.favoriteGenres,
    favoriteLanguages: profile.favoriteLanguages,
    stats: {
      likes: interactions.filter((item) => item.type === "LIKE").length,
      ratings: ratings.length,
      watchlistCount: watchlist.length,
      collectionCount: collections.length,
    },
    recentActivity: [
      ...interactions.map((item) => ({
        id: item.id,
        type: item.type as DashboardData["recentActivity"][number]["type"],
        title: item.type === "LIKE" ? "Liked" : item.type === "DISLIKE" ? "Disliked" : "Viewed",
        movieTitle: item.movie.title,
        createdAt: item.createdAt.toISOString(),
      })),
      ...ratings.map((item) => ({
        id: item.id,
        type: "RATING" as const,
        title: `Rated ${item.value}/10`,
        movieTitle: item.movie.title,
        createdAt: item.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
    watchlist: watchlist.map((entry) => ({
      movie: dbMovieToSummary(entry.movie),
      status: entry.status,
      addedAt: entry.addedAt,
      watchedAt: entry.watchedAt,
    })),
    collections: collections.map((entry) => ({
      id: entry.id,
      name: entry.name,
      slug: entry.slug,
      description: entry.description,
      count: entry._count.items,
      preview: entry.items.map((item) => dbMovieToSummary(item.movie)),
    })),
    recommendations,
  };
}
