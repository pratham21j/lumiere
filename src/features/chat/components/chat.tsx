"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, RotateCcw, Sparkles } from "lucide-react";
import { useChat, type ChatTurn } from "../hooks";
import { VoiceButton } from "@/features/search/components/voice-button";

const SUGGESTIONS = [
  "Mind-bending movies like Interstellar",
  "Something funny but emotional",
  "Anime with amazing world building",
  "Movies where the villain wins",
  "What should we watch on family night?",
];

function RecommendationCards({ turn }: { turn: ChatTurn }) {
  if (!turn.recommendations?.length) return null;
  return (
    <ul className="mt-4 space-y-3">
      {turn.recommendations.map((r) => (
        <li key={r.movieId}>
          <Link
            href={`/movies/${r.movieId}`}
            className="group block rounded-xl border border-phosphor/15 bg-surface p-4 transition-colors hover:border-phosphor/40"
          >
            <div className="font-display text-base font-semibold text-linen group-hover:text-phosphor">
              {r.title}
            </div>
            <p className="mt-1.5 border-l-2 border-phosphor/40 pl-2.5 text-sm leading-relaxed text-ash">
              {r.reason}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Chat({ initialQuery }: { initialQuery?: string }) {
  const { turns, busy, error, send, reset } = useChat();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const sentInitial = useRef(false);

  // Auto-send the query carried in from the Marquee Prompt / details page.
  useEffect(() => {
    if (initialQuery && !sentInitial.current) {
      sentInitial.current = true;
      void send(initialQuery);
    }
  }, [initialQuery, send]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns]);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!draft.trim() || busy) return;
    void send(draft);
    setDraft("");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-3.5rem)] max-w-3xl flex-col px-4 sm:px-6">
      {/* Transcript */}
      <div className="flex-1 py-8">
        {turns.length === 0 && !busy ? (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <div className="glow-ai mb-6 grid size-14 place-items-center rounded-2xl border border-phosphor/25 bg-surface">
              <Sparkles aria-hidden className="size-6 text-phosphor" />
            </div>
            <h1 className="font-display text-2xl font-bold text-linen">
              What do you feel like watching?
            </h1>
            <p className="mt-2 max-w-sm text-sm text-ash">
              Describe a mood, a memory, or a movie you loved. Every pick comes
              with its reason.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-ash transition-colors hover:border-phosphor/40 hover:text-linen"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="space-y-6">
            {turns.map((t, i) => (
              <li key={i} className={t.role === "user" ? "flex justify-end" : ""}>
                {t.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-surface-raised px-4 py-2.5 text-sm text-linen">
                    {t.content}
                  </div>
                ) : (
                  <div className="max-w-[95%]">
                    <span className="eyebrow mb-2 block !text-[10px] text-phosphor/80">
                      Lumière
                    </span>
                    <div className="text-sm leading-relaxed text-linen/90">
                      {t.content}
                      {t.streaming && (
                        <span aria-hidden className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-phosphor/70 align-text-bottom" />
                      )}
                    </div>
                    <RecommendationCards turn={t} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        {error && (
          <p role="alert" className="mt-6 text-sm text-destructive">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 bg-gradient-to-t from-ink via-ink to-transparent pb-6 pt-2">
        <form onSubmit={submit} className="flex items-center gap-2">
          {turns.length > 0 && (
            <button
              type="button"
              onClick={reset}
              aria-label="Start a new conversation"
              className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-surface text-ash transition-colors hover:text-linen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor"
            >
              <RotateCcw aria-hidden className="size-4" />
            </button>
          )}
          <div className="glow-ai flex flex-1 items-center gap-2 rounded-2xl border border-phosphor/20 bg-surface/90 p-1.5 pl-4 backdrop-blur focus-within:border-phosphor/50">
            <label htmlFor="chat-input" className="sr-only">
              Message the concierge
            </label>
            <input
              id="chat-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="e.g. a slow sci-fi that will make me cry"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2 text-sm text-linen outline-none placeholder:text-ash/70"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Send"
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-phosphor to-phosphor-soft text-ink transition-transform enabled:hover:scale-105 disabled:opacity-40"
            >
              <ArrowUp aria-hidden className="size-4" strokeWidth={2.5} />
            </button>
          </div>
          <VoiceButton onTranscript={(text) => void send(text)} />
        </form>
      </div>
    </div>
  );
}
