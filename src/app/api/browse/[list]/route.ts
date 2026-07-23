import { z } from "zod";
import { apiOk, handleApiError } from "@/lib/api";
import { getBrowseList } from "@/features/movies/queries";

const paramsSchema = z.object({
  list: z.enum(["trending", "popular", "top_rated", "upcoming", "now_playing"]),
});
const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export async function GET(
  req: Request,
  ctx: { params: Promise<{ list: string }> },
) {
  try {
    const { list } = paramsSchema.parse(await ctx.params);
    const { page } = querySchema.parse(
      Object.fromEntries(new URL(req.url).searchParams),
    );
    const data = await getBrowseList(list, page);
    return apiOk(data);
  } catch (err) {
    return handleApiError(err, "/api/browse/[list]");
  }
}
