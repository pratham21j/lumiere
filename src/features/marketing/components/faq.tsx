"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Do I need an account to try it?",
    a: "No. The chat and search work immediately. An account adds the parts that need memory: your watchlist, ratings, taste profile, and personalized recommendations.",
  },
  {
    q: "Where does the movie data come from?",
    a: "Catalog data — titles, posters, cast, trailers, streaming availability — comes from TMDB. Lumière adds the intelligence layer on top: semantic search, explanations, and taste analysis.",
  },
  {
    q: "How are recommendations explained?",
    a: "Every pick includes the specific reason it was chosen: the films you liked that it resembles, the mood you asked for, or the pattern in your ratings it matches. If we can't explain it, we don't recommend it.",
  },
  {
    q: "What does Lumière learn about me?",
    a: "Only your in-app activity: likes, ratings, watch history, and saved films. That builds your taste profile, which you can read in full on your dashboard. Delete your account and the profile goes with it.",
  },
  {
    q: "Is it free?",
    a: "Yes while in beta. The core — chat, search, watchlist — will stay free.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="border-t border-border/60">
      <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 sm:py-32">
        <p className="eyebrow mb-4">Questions</p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-linen sm:text-4xl">
          Fair questions, straight answers
        </h2>

        <div className="mt-12 divide-y divide-border">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor"
                >
                  <span className="text-base font-medium text-linen">{f.q}</span>
                  <ChevronDown
                    aria-hidden
                    className={`size-4 shrink-0 text-ash transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <div
                  id={`faq-panel-${i}`}
                  hidden={!isOpen}
                  className="pb-5 text-sm leading-relaxed text-ash"
                >
                  {f.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
