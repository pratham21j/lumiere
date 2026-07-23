"use client";

import { motion, useReducedMotion } from "framer-motion";
import { MarqueePrompt } from "./marquee-prompt";

export function Hero() {
  const reduced = useReducedMotion() ?? false;
  const fadeUp = (delay: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="relative flex min-h-[92dvh] flex-col items-center justify-center overflow-hidden px-4 pt-16">
      {/* Tungsten wash from above — the "projector beam" */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60dvh]"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 0%, color-mix(in srgb, var(--tungsten) 9%, transparent), transparent 75%)",
        }}
      />

      <motion.p {...fadeUp(0.05)} className="eyebrow mb-6">
        AI film concierge
      </motion.p>

      <motion.h1
        {...fadeUp(0.15)}
        className="font-display max-w-3xl text-center text-4xl font-bold tracking-tight text-linen sm:text-6xl md:text-7xl"
        style={{ fontStretch: "condensed" }}
      >
        Say what you feel.
        <br />
        <span className="text-ai">We&apos;ll find the film.</span>
      </motion.h1>

      <motion.p
        {...fadeUp(0.3)}
        className="mt-6 max-w-xl text-center text-base leading-relaxed text-ash sm:text-lg"
      >
        Lumière understands &ldquo;slow psychological thriller&rdquo; and
        &ldquo;funny but emotional.&rdquo; Every recommendation comes with the
        reason it was picked for you.
      </motion.p>

      <div className="mt-10 w-full">
        <MarqueePrompt />
      </div>
    </section>
  );
}
