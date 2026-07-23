"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * The Marquee Prompt — Lumière's signature element.
 * The hero IS the product: a live AI prompt that auto-types rotating
 * example queries and casts phosphor light on the dark around it.
 * Submitting routes straight into the chat with the query attached.
 */

const EXAMPLE_QUERIES = [
  "something funny but emotional…",
  "mind-bending movies like Interstellar…",
  "a slow psychological thriller…",
  "movies where the villain wins…",
  "anime with amazing world building…",
  "what should we watch on family night?…",
];

const TYPE_MS = 55;
const HOLD_MS = 2200;
const ERASE_MS = 22;

function useTypewriter(paused: boolean, reduced: boolean) {
  const [text, setText] = useState("");
  const state = useRef({ phrase: 0, char: 0, dir: 1 as 1 | -1 });

  useEffect(() => {
    if (paused) return;
    if (reduced) {
      setText(EXAMPLE_QUERIES[0]);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const s = state.current;
      const phrase = EXAMPLE_QUERIES[s.phrase];
      s.char += s.dir;
      setText(phrase.slice(0, s.char));
      let delay = s.dir === 1 ? TYPE_MS : ERASE_MS;
      if (s.dir === 1 && s.char >= phrase.length) {
        s.dir = -1;
        delay = HOLD_MS;
      } else if (s.dir === -1 && s.char <= 0) {
        s.dir = 1;
        s.phrase = (s.phrase + 1) % EXAMPLE_QUERIES.length;
        delay = 400;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [paused, reduced]);

  return text;
}

export function MarqueePrompt() {
  const router = useRouter();
  const reduced = useReducedMotion() ?? false;
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const ghost = useTypewriter(focused || value.length > 0, reduced);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/chat?q=${encodeURIComponent(q)}` : "/chat");
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-2xl"
    >
      {/* Light spill — the prompt is the light source of the page */}
      <div
        aria-hidden
        className="absolute -inset-x-16 -inset-y-12 -z-10 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in srgb, var(--phosphor) 22%, transparent), transparent 70%)",
        }}
      />

      <div
        className={`glow-ai flex items-center gap-3 rounded-2xl border bg-surface/80 p-2 pl-5 backdrop-blur transition-shadow duration-500 ${
          focused ? "border-phosphor/50" : "border-phosphor/20"
        }`}
      >
        <label htmlFor="marquee-prompt" className="sr-only">
          Describe what you feel like watching
        </label>
        <input
          id="marquee-prompt"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={ghost || "Describe what you feel like watching"}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-linen outline-none placeholder:text-ash/80 sm:text-lg"
        />
        <button
          type="submit"
          aria-label="Ask Lumière"
          className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-phosphor to-phosphor-soft text-ink transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor active:scale-95"
        >
          <ArrowUp className="size-5" strokeWidth={2.5} />
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-ash">
        Try it — no account needed. Plain language works best.
      </p>
    </motion.form>
  );
}
