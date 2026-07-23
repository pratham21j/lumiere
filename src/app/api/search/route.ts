import { z } from "zod";
import { apiOk, handleApiError, rateLimited } from "@/lib/api";
import { rateLimiters, clientKey } from "@/lib/rate-limit";
import { semanticSearch } from "@/features/search/service";
import { getMovieProvider } from "@/lib/providers/movie";

const querySchema = z.object({
  q: z.string().trim().min(1, "Type something to search for.").max(200),
  mode: z.enum(["semantic", "keyword"]).default("semantic"),
});

export async function GET(req: Request) {
  try {
    const limit = await rateLimiters.search.check(clientKey(req));
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const { q, mode } = querySchema.parse(
      Object.fromEntries(new URL(req.url).searchParams),
    );

    if (mode === "keyword") {
      const { results } = await getMovieProvider().searchByKeyword(q);
      return apiOk({ hits: results.map((movie) => ({ movie, similarity: null })) });
    }

    const hits = await semanticSearch(q);
    return apiOk({ hits });
  } catch (err) {
    return handleApiError(err, "/api/search");
  }
}
