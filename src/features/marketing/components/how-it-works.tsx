"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * "How it works" — a real 3-step sequence (ask → reasoned picks → taste
 * learning), so the numbered structure encodes actual order.
 */

const STEPS = [
  {
    n: "01",
    title: "Ask in your own words",
    body: "“Something funny but emotional.” “Anime with amazing world building.” No genres, no dropdowns — the way you'd ask a friend who works at a video store.",
    demo: { role: "you", text: "movies to watch with family that won't bore the adults?" },
  },
  {
    n: "02",
    title: "Get picks with reasons",
    body: "Lumière answers with a handful of films — and, for each one, exactly why it fits your request and your history.",
    demo: {
      role: "lumiere",
      text: "Paddington 2 — because you loved Up: the same warmth, and the adults will laugh first.",
    },
  },
  {
    n: "03",
    title: "It learns your taste",
    body: "Every like, rating, and finished film sharpens your profile. The tenth recommendation knows you better than the first.",
    demo: { role: "lumiere", text: "Noticing a pattern: you rate slow-burn sci-fi highest after 10pm." },
  },
];

export function HowItWorks() {
  const reduced = useReducedMotion() ?? false;

  return (
    <section id="how" className="border-y border-border/60 bg-surface/40">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <p className="eyebrow mb-4">How it works</p>
        <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-linen sm:text-4xl">
          Three steps from &ldquo;no idea&rdquo; to &ldquo;press play&rdquo;
        </h2>

        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.li
              key={s.n}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: "easeOut" }}
              className="flex flex-col"
            >
              <span className="font-data text-sm text-tungsten">{s.n}</span>
              <h3 className="font-display mt-3 text-xl font-semibold text-linen">
                {s.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ash">{s.body}</p>

              <div
                className={`mt-6 rounded-xl border p-4 text-sm leading-snug ${
                  s.demo.role === "you"
                    ? "border-border bg-ink text-linen"
                    : "glow-ai border-phosphor/20 bg-surface text-linen"
                }`}
              >
                <span
                  className={`eyebrow mb-1.5 block !text-[10px] ${
                    s.demo.role === "you" ? "" : "text-phosphor/80"
                  }`}
                >
                  {s.demo.role === "you" ? "You" : "Lumière"}
                </span>
                {s.demo.text}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
