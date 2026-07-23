"use client";

import { motion, useReducedMotion } from "framer-motion";

const TESTIMONIALS = [
  {
    quote:
      "I typed “sad but not depressing, we have work tomorrow” and it gave me Her with a reason that was more thoughtful than most of my friends.",
    name: "Maya K.",
    role: "Early access user",
  },
  {
    quote:
      "The explanations are the whole product. I don't trust a recommendation until I know why — Lumière is the first thing that tells me why.",
    name: "Daniel O.",
    role: "Film club organizer",
  },
  {
    quote:
      "Family night went from a 40-minute argument to a 40-second question. My kids think I got good at picking movies.",
    name: "Priya S.",
    role: "Parent of three critics",
  },
];

export function Testimonials() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
      <p className="eyebrow mb-4">From early access</p>
      <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-linen sm:text-4xl">
        The last &ldquo;what should we watch?&rdquo;
      </h2>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.figure
            key={t.name}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6"
          >
            <blockquote className="text-sm leading-relaxed text-linen">
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6">
              <div className="text-sm font-medium text-linen">{t.name}</div>
              <div className="font-data mt-0.5 text-xs text-ash">{t.role}</div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
