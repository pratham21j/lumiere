import { z } from "zod";
import { apiOk, handleApiError } from "@/lib/api";
import { getSimilarMovies } from "@/features/movies/queries";

const paramsSchema = z.object({ id: z.coerce.number().int().positive() });

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = paramsSchema.parse(await ctx.params);
    return apiOk({ results: await getSimilarMovies(id) });
  } catch (err) {
    return handleApiError(err, "/api/movies/[id]/similar");
  }
}
