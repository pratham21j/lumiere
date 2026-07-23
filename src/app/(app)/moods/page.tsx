import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { semanticSearch } from "@/features/search/service";
import { MovieCard } from "@/components/shared/movie-card";

export const metadata: Metadata = { title: "Moods" };

/**
 * Mood → curated semantic query. The emoji is the interface; the query
 * underneath is tuned vocabulary for the embedding space.
 */
const MOODS = [
  {
    key: "happy",
    emoji: "😊",
    label: "Happy",
    blurb: "Warm, funny, leaves you lighter",
    query: "feel-good wholesome charming funny uplifting crowd-pleaser",
  },
  {
    key: "sad",
    emoji: "😢",
    label: "A good cry",
    blurb: "Tearjerkers that earn it",
    query: "sad emotional tearjerker melancholy grief bittersweet moving",
  },
  {
    key: "mindblown",
    emoji: "🤯",
    label: "Mind blown",
    blurb: "Twists, puzzles, big ideas",
    query: "mind-bending twist puzzle nonlinear philosophical cerebral",
  },
  {
    key: "horror",
    emoji: "😨",
    label: "Scare me",
    blurb: "Dread done properly",
    query: "horror scary unsettling dread creepy disturbing tension",
  },
  {
    key: "relaxing",
    emoji: "😌",
    label: "Relaxing",
    blurb: "Low stakes, high comfort",
    query: "relaxing gentle cozy charming comfort feel-good easy watch",
  },
] as const;

const moodSchema = z.enum(["happy", "sad", "mindblown", "horror", "relaxing"]).optional().catch(undefined);

export default async function MoodsPage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string }>;
}) {
  const selectedKey = moodSchema.parse((await searchParams).mood);
  const selected = MOODS.find((m) => m.key === selectedKey) ?? null;
  const hits = selected ? await semanticSearch(selected.query, 15) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        <p className="eyebrow mb-1">Mood picker</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          How do you want to feel tonight?
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5" role="group" aria-label="Pick a mood">
        {MOODS.map((m) => {
          const active = m.key === selected?.key;
          return (
            <Link
              key={m.key}
              href={active ? "/moods" : `/moods?mood=${m.key}`}
              aria-current={active ? "true" : undefined}
              className={`rounded-2xl border p-4 text-center transition-all focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor ${
                active
                  ? "glow-ai border-phosphor/40 bg-surface"
                  : "border-border bg-surface hover:-translate-y-0.5 hover:border-phosphor/30"
              }`}
            >
              <span aria-hidden className="block text-3xl">
                {m.emoji}
              </span>
              <span className="font-display mt-2 block text-sm font-semibold text-linen">
                {m.label}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-ash">{m.blurb}</span>
            </Link>
          );
        })}
      </div>

      {selected && (
        <section className="mt-12">
          <p className="eyebrow mb-1 text-phosphor/80">The concierge suggests</p>
          <h2 className="font-display mb-6 text-xl font-semibold text-linen">
            {selected.emoji} {selected.label} — {hits.length} picks
          </h2>
          {hits.length === 0 ? (
            <p className="text-sm text-ash">
              Nothing surfaced for this mood yet — try another, or ask the chat directly.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {hits.map((h) => (
                <MovieCard key={h.movie.id} movie={h.movie} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
