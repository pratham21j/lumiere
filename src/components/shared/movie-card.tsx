import Link from "next/link";
import { Star } from "lucide-react";
import type { MovieSummary } from "@/lib/providers/movie";
import { formatRating, formatYear } from "@/lib/format";
import { MoviePoster } from "./movie-poster";

interface Props {
  movie: MovieSummary;
  priority?: boolean;
}

export function MovieCard({ movie, priority }: Props) {
  return (
    <Link
      href={`/movies/${movie.id}`}
      className="group block w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl border border-border bg-surface transition duration-300 group-hover:-translate-y-1 group-hover:border-tungsten/40 group-hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.8)]">
        <MoviePoster
          title={movie.title}
          posterPath={movie.posterPath}
          releaseDate={movie.releaseDate}
          priority={priority}
        />
        {movie.voteAverage > 0 && (
          <span className="font-data absolute right-2 top-2 flex items-center gap-1 rounded-md bg-ink/80 px-1.5 py-0.5 text-[11px] text-tungsten backdrop-blur">
            <Star aria-hidden className="size-3 fill-current" />
            {formatRating(movie.voteAverage)}
          </span>
        )}
      </div>
      <div className="mt-2.5 px-0.5">
        <h3 className="truncate text-sm font-medium text-linen">{movie.title}</h3>
        <p className="font-data mt-0.5 text-xs text-ash">
          {formatYear(movie.releaseDate)}
          {movie.genres[0]?.name ? ` · ${movie.genres[0].name}` : ""}
        </p>
      </div>
    </Link>
  );
}
