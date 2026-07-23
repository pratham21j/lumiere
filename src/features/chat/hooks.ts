"use client";

import { useCallback, useRef, useState } from "react";
import type { Recommendation } from "@/lib/providers/ai/types";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  recommendations?: Recommendation[];
  /** True while this assistant turn is still streaming. */
  streaming?: boolean;
}

const RECS_MARKER = "\n@@RECS@@";

/**
 * Chat state + streaming transport for POST /api/chat.
 * Parses the text stream and the @@RECS@@ JSON trailer into turns.
 */
export function useChat() {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string | null>(null);

  const send = useCallback(
    async (message: string) => {
      const text = message.trim();
      if (!text || busy) return;
      setError(null);
      setBusy(true);

      const history = [...turns, { role: "user" as const, content: text }];
      setTurns([...history, { role: "assistant", content: "", streaming: true }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: history.map(({ role, content }) => ({ role, content })),
            ...(conversationId.current ? { conversationId: conversationId.current } : {}),
          }),
        });
        if (!res.ok || !res.body) {
          const detail = await res.json().catch(() => null);
          throw new Error(detail?.error?.message ?? "The concierge is unavailable. Try again.");
        }
        conversationId.current = res.headers.get("x-conversation-id") ?? conversationId.current;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = "";

        const patchLast = (patch: Partial<ChatTurn>) =>
          setTurns((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...next[next.length - 1], ...patch };
            return next;
          });

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          const markerAt = full.indexOf(RECS_MARKER);
          patchLast({ content: markerAt >= 0 ? full.slice(0, markerAt) : full });
        }

        const markerAt = full.indexOf(RECS_MARKER);
        let recommendations: Recommendation[] = [];
        if (markerAt >= 0) {
          try {
            recommendations = JSON.parse(full.slice(markerAt + RECS_MARKER.length));
          } catch {
            // trailer garbled — keep the prose, drop the cards
          }
        }
        patchLast({
          content: markerAt >= 0 ? full.slice(0, markerAt) : full,
          recommendations,
          streaming: false,
        });
      } catch (e) {
        setTurns((prev) => prev.slice(0, -1)); // drop the empty assistant turn
        setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      } finally {
        setBusy(false);
      }
    },
    [busy, turns],
  );

  const reset = useCallback(() => {
    setTurns([]);
    setError(null);
    conversationId.current = null;
  }, []);

  return { turns, busy, error, send, reset };
}
