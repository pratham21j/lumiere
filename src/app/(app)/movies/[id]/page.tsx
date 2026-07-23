import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PosterRail } from "@/components/shared/poster-rail";
import { MoviePoster } from "@/components/shared/movie-poster";
import { getMovieDetails, getSimilarMovies } from "@/features/movies/queries";
import {
  formatLanguage,
  formatMoney,
  formatRating,
  formatRuntime,
  formatYear,
} from "@/lib/format";
import { Suspense } from "react";
import { CastRow } from "@/features/movies/components/cast-row";
import { TrailerEmbed } from "@/features/movies/components/trailer-embed";
import { MovieActions } from "@/features/movies/components/movie-actions";
import { ReviewSummarySection } from "@/features/movies/components/review-summary-section";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = Number((await params).id);
  const movie = Number.isInteger(id) ? await getMovieDetails(id) : null;
  return movie
    ? { title: movie.title, description: movie.overview }
    : { title: "Film not found" };
}

function backdropHue(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h % 360;
}

export default async function MovieDetailsPage({ params }: Props) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const movie = await getMovieDetails(id);
  if (!movie) notFound();

  const similar = await getSimilarMovies(id);
  const directors = movie.crew.filter((c) => c.job === "Director");
  const facts = [
    { label: "Rating", value: movie.voteAverage > 0 ? `${formatRating(movie.voteAverage)} / 10` : "Not rated" },
    { label: "Runtime", value: formatRuntime(movie.runtime) },
    { label: "Language", value: formatLanguage(movie.originalLanguage) },
    { label: "Budget", value: formatMoney(movie.budget) },
    { label: "Revenue", value: formatMoney(movie.revenue) },
  ];

  return (
    <main className="pb-16">
      {/* Backdrop band */}
      <div className="relative h-[38dvh] min-h-56 w-full overflow-hidden sm:h-[46dvh]">
        {movie.backdropPath ? (
          <Image
            src={movie.backdropPath}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(120deg,
                hsl(${backdropHue(movie.title)} 32% 13%),
                var(--ink) 65%,
                hsl(${(backdropHue(movie.title) + 40) % 360} 28% 10%))`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Title block */}
        <div className="relative -mt-24 flex flex-col gap-6 sm:-mt-32 sm:flex-row sm:items-end">
          <div className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl sm:w-48">
            <MoviePoster
              title={movie.title}
              posterPath={movie.posterPath}
              releaseDate={movie.releaseDate}
              priority
              sizes="(max-width: 640px) 144px, 192px"
            />
          </div>
          <div className="min-w-0 pb-1">
            <h1
              className="font-display text-3xl font-bold tracking-tight text-linen sm:text-5xl"
              style={{ fontStretch: "condensed" }}
            >
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="mt-2 text-sm italic text-ash">&ldquo;{movie.tagline}&rdquo;</p>
            )}
            <p className="font-data mt-3 text-sm text-ash">
              {formatYear(movie.releaseDate)} · {formatRuntime(movie.runtime)}
              {directors.length > 0 && (
                <> · Directed by <span className="text-linen">{directors.map((d) => d.name).join(", ")}</span></>
              )}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {movie.voteAverage > 0 && (
                <span className="font-data flex items-center gap-1 rounded-md bg-tungsten/15 px-2 py-1 text-xs text-tungsten">
                  <Star aria-hidden className="size-3 fill-current" />
                  {formatRating(movie.voteAverage)}
                </span>
              )}
              {movie.genres.map((g) => (
                <Badge key={g.id} variant="secondary" className="bg-surface-raised text-ash">
                  {g.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-3">
          {movie.trailerKey && <TrailerEmbed trailerKey={movie.trailerKey} title={movie.title} />}
          <Suspense fallback={null}>
            <MovieActions movieId={movie.id} />
          </Suspense>
          <Link
            href={`/chat?q=${encodeURIComponent(`Tell me about ${movie.title} — should I watch it?`)}`}
            className="glow-ai flex items-center gap-2 rounded-xl border border-phosphor/25 bg-surface px-4 py-2 text-sm text-phosphor transition-colors hover:border-phosphor/50"
          >
            <MessageCircle aria-hidden className="size-4" />
            Ask the concierge about this film
          </Link>
        </div>

        {/* Overview */}
        <section className="mt-10 max-w-3xl">
          <p className="eyebrow mb-3">Overview</p>
          <p className="leading-relaxed text-linen/90">{movie.overview}</p>
        </section>

        {/* Fact strip */}
        <section aria-label="Details" className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-5">
          {facts.map((f) => (
            <div key={f.label} className="bg-surface p-4">
              <div className="eyebrow !text-[10px]">{f.label}</div>
              <div className="font-data mt-1.5 text-sm text-linen">{f.value}</div>
            </div>
          ))}
        </section>

        {/* Awards */}
        {movie.awards.length > 0 && (
          <section className="mt-10">
            <p className="eyebrow mb-3">Awards</p>
            <ul className="space-y-1.5">
              {movie.awards.map((a) => (
                <li key={a} className="flex items-center gap-2 text-sm text-linen/90">
                  <span aria-hidden className="text-tungsten">✦</span> {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Cast */}
        {movie.cast.length > 0 && (
          <section className="mt-10">
            <p className="eyebrow mb-4">Cast</p>
            <CastRow cast={movie.cast} />
          </section>
        )}

        {/* Crew */}
        {movie.crew.length > 0 && (
          <section className="mt-10">
            <p className="eyebrow mb-3">Crew</p>
            <ul className="grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
              {movie.crew.map((c) => (
                <li key={`${c.id}-${c.job}`} className="flex justify-between gap-4 border-b border-border/50 py-1.5">
                  <span className="text-linen">{c.name}</span>
                  <span className="font-data text-xs text-ash">{c.job}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Where to watch */}
        {movie.watchProviders.length > 0 && (
          <section className="mt-10">
            <p className="eyebrow mb-3">Where to watch</p>
            <div className="flex flex-wrap gap-2">
              {movie.watchProviders.map((p) => (
                <span
                  key={`${p.name}-${p.kind}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-sm text-linen"
                >
                  {p.logoPath && (
                    <Image src={p.logoPath} alt="" width={20} height={20} className="rounded" />
                  )}
                  {p.name}
                  <span className="font-data text-[10px] uppercase text-ash">{p.kind}</span>
                </span>
              ))}
            </div>
          </section>
        )}

        {/* AI review consensus */}
        {movie.reviews.length > 0 && (
          <Suspense fallback={null}>
            <ReviewSummarySection movieId={movie.id} />
          </Suspense>
        )}

        {/* Reviews */}
        {movie.reviews.length > 0 && (
          <section className="mt-10">
            <p className="eyebrow mb-4">Reviews</p>
            <div className="space-y-4">
              {movie.reviews.slice(0, 4).map((r) => (
                <blockquote key={r.author} className="rounded-xl border border-border bg-surface p-5">
                  <p className="text-sm leading-relaxed text-linen/90">{r.content}</p>
                  <footer className="font-data mt-3 flex items-center gap-3 text-xs text-ash">
                    <span>{r.author}</span>
                    {r.rating !== null && (
                      <span className="flex items-center gap-1 text-tungsten">
                        <Star aria-hidden className="size-3 fill-current" /> {r.rating}/10
                      </span>
                    )}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Similar */}
      {similar.length > 0 && (
        <div className="mx-auto mt-12 max-w-7xl">
          <PosterRail
            eyebrow={`Because you're looking at ${movie.title}`}
            title="You might also enjoy"
            movies={similar}
          />
        </div>
      )}

    </main>
  );
}
