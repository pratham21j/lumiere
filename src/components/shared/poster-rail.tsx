import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MovieSummary } from "@/lib/providers/movie";
import { MovieCard } from "./movie-card";

interface Props {
  title: string;
  movies: MovieSummary[];
  href?: string; // "see all" target
  eyebrow?: string;
  priority?: boolean; // eager-load first images (above the fold)
}

/** Horizontal scroll rail with snap — the browse workhorse. */
export function PosterRail({ title, movies, href, eyebrow, priority }: Props) {
  if (movies.length === 0) return null;
  return (
    <section className="py-6">
      <div className="mb-4 flex items-end justify-between px-4 sm:px-6">
        <div>
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h2 className="font-display text-xl font-semibold tracking-tight text-linen">
            {title}
          </h2>
        </div>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-ash transition-colors hover:text-linen"
          >
            See all <ArrowRight aria-hidden className="size-3.5" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6">
        {movies.map((m, i) => (
          <div key={m.id} className="w-36 shrink-0 snap-start sm:w-44">
            <MovieCard movie={m} priority={priority && i < 6} />
          </div>
        ))}
      </div>
    </section>
  );
}
