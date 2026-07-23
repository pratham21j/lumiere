import type { Metadata } from "next";
import { z } from "zod";
import { getBrowseList } from "@/features/movies/queries";
import { MovieGrid } from "@/features/movies/components/movie-grid";
import type { BrowseList } from "@/lib/providers/movie";

const LIST_TITLES: Record<BrowseList, string> = {
  trending: "Trending today",
  popular: "Popular this week",
  top_rated: "Top rated",
  upcoming: "Upcoming",
  now_playing: "Now playing",
};

const listSchema = z
  .enum(["trending", "popular", "top_rated", "upcoming", "now_playing"])
  .catch("popular");

interface Props {
  searchParams: Promise<{ list?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const list = listSchema.parse((await searchParams).list);
  return { title: LIST_TITLES[list] };
}

export default async function MoviesPage({ searchParams }: Props) {
  const list = listSchema.parse((await searchParams).list);
  const initial = await getBrowseList(list);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        <p className="eyebrow mb-1">Browse</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          {LIST_TITLES[list]}
        </h1>
      </div>
      <MovieGrid list={list} initial={initial} />
    </main>
  );
}
