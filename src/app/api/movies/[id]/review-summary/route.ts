import { z } from "zod";
import { apiOk, apiError, handleApiError } from "@/lib/api";
import { getReviewSummary } from "@/features/movies/review-summary";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = paramsSchema.parse(await ctx.params);
    const summary = await getReviewSummary(id);
    if (!summary) {
      return apiError("NOT_FOUND", "No reviews to summarize for this film.", 404);
    }
    return apiOk(summary);
  } catch (err) {
    return handleApiError(err, "/api/movies/[id]/review-summary");
  }
}
