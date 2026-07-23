import { prisma } from "@/lib/db";
import { getAIProvider, type ReviewSummaryResult } from "@/lib/providers/ai";
import { getMovieDetails } from "./queries";
import { logger } from "@/lib/logger";

const CACHE_DAYS = 30;

/**
 * Review summary with a DB cache: computed once per movie per month,
 * recomputed on demand without a database.
 */
export async function getReviewSummary(
  movieId: number,
): Promise<ReviewSummaryResult | null> {
  if (prisma) {
    const cached = await prisma.reviewSummary.findUnique({ where: { movieId } });
    if (
      cached &&
      Date.now() - cached.generatedAt.getTime() < CACHE_DAYS * 86_400_000
    ) {
      return {
        pros: cached.pros as string[],
        cons: cached.cons as string[],
        verdict: cached.verdict,
      };
    }
  }

  const movie = await getMovieDetails(movieId);
  if (!movie) return null;
  if (movie.reviews.length === 0) return null;

  const summary = await getAIProvider().summarizeReviews(
    movie.title,
    movie.reviews.map((r) => r.content),
  );

  if (prisma) {
    await prisma.reviewSummary
      .upsert({
        where: { movieId },
        create: { movieId, ...summary, generatedAt: new Date() },
        update: { ...summary, generatedAt: new Date() },
      })
      .catch((e) => logger.warn("review summary cache write failed", { error: String(e) }));
  }
  return summary;
}
