import { unstable_cache } from "next/cache";
import { getMovieProvider, type BrowseList } from "@/lib/providers/movie";

/**
 * Server-side movie queries. Browse lists are cached for an hour and
 * tagged for revalidation; details are cached for a day. The mock
 * provider is instant, but the same call sites serve TMDB unchanged.
 */

export const getBrowseList = (list: BrowseList, page = 1) =>
  unstable_cache(
    () => getMovieProvider().browse(list, page),
    ["browse", list, String(page)],
    { revalidate: 3600, tags: ["movies"] },
  )();

export const getMovieDetails = (id: number) =>
  unstable_cache(
    () => getMovieProvider().details(id),
    ["movie", String(id)],
    { revalidate: 86_400, tags: ["movies"] },
  )();

export const getSimilarMovies = (id: number, limit = 12) =>
  unstable_cache(
    () => getMovieProvider().similar(id, limit),
    ["similar", String(id), String(limit)],
    { revalidate: 86_400, tags: ["movies"] },
  )();
