"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  Sparkles,
  ListVideo,
  Compass,
  Mic,
  GaugeCircle,
} from "lucide-react";

/**
 * Features grid. The AI features carry the phosphor treatment; the
 * catalog features stay in warm neutrals — the palette IS the taxonomy.
 */

const FEATURES = [
  {
    icon: MessageCircle,
    ai: true,
    title: "Talk, don't filter",
    body: "Describe a feeling, a memory, an evening. The chat understands “mind-bending like Interstellar” and answers with films, not links.",
  },
  {
    icon: Sparkles,
    ai: true,
    title: "Every pick, explained",
    body: "No black-box recommendations. Each film arrives with the reason it was chosen for you — because you liked what you liked.",
  },
  {
    icon: Compass,
    ai: true,
    title: "Search by vibe",
    body: "“Slow psychological thriller.” “Sad romance.” “Movies where the villain wins.” Semantic search reads the meaning, not the keywords.",
  },
  {
    icon: ListVideo,
    ai: false,
    title: "A watchlist that thinks",
    body: "Save films, track what you've watched, and let smart collections sort your queue into Weekend Chill and Sci-Fi Marathon.",
  },
  {
    icon: GaugeCircle,
    ai: false,
    title: "Your taste, mapped",
    body: "Likes, ratings, and history become a taste profile you can read — favorite genres, patterns, and a monthly rhythm of what you watch.",
  },
  {
    icon: Mic,
    ai: false,
    title: "Just say it",
    body: "Voice search when your hands are full of popcorn. Reviews of 2,000 strangers compressed into three honest lines.",
  },
];

export function Features() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <p className="eyebrow mb-4">What Lumière does</p>
      <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-linen sm:text-4xl">
        Built like an assistant, not a catalog
      </h2>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.article
            key={f.title}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: (i % 3) * 0.08, duration: 0.5, ease: "easeOut" }}
            className={`group rounded-2xl border bg-surface p-6 transition-colors ${
              f.ai
                ? "border-phosphor/15 hover:border-phosphor/35"
                : "border-border hover:border-tungsten/30"
            }`}
          >
            <div
              className={`mb-5 grid size-10 place-items-center rounded-xl ${
                f.ai
                  ? "bg-gradient-to-br from-phosphor/20 to-phosphor-soft/20 text-phosphor"
                  : "bg-tungsten/10 text-tungsten"
              }`}
            >
              <f.icon className="size-5" aria-hidden />
            </div>
            {f.ai && (
              <span className="eyebrow mb-2 block !text-[10px] text-phosphor/80">
                AI-powered
              </span>
            )}
            <h3 className="font-display text-lg font-semibold text-linen">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ash">{f.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
