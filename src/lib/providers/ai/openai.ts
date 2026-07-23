import { env } from "@/lib/env";
import type {
  AIProvider,
  ChatContext,
  ChatMessage,
  ChatResult,
  Recommendation,
  ReviewSummaryResult,
  TasteAnalysis,
} from "./types";

/**
 * OpenAI-backed provider. Activated with OPENAI_API_KEY (+ AI_PROVIDER=openai).
 * Uses the REST API directly (no SDK dependency) — chat streams via SSE,
 * structured outputs come back as JSON.
 */

const API = "https://api.openai.com/v1";
const CHAT_MODEL = "gpt-4o-mini";
const EMBED_MODEL = "text-embedding-3-small"; // 1536 dims — matches pgvector column

async function openai(path: string, body: unknown): Promise<Response> {
  const res = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`OpenAI ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res;
}

async function jsonCompletion<T>(system: string, user: string): Promise<T> {
  const res = await openai("/chat/completions", {
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content) as T;
}

export class OpenAIProvider implements AIProvider {
  async embed(text: string): Promise<number[]> {
    const res = await openai("/embeddings", { model: EMBED_MODEL, input: text.slice(0, 8000) });
    const data = await res.json();
    return data.data[0].embedding as number[];
  }

  async chat(messages: ChatMessage[], context: ChatContext): Promise<ChatResult> {
    const candidateList = context.candidates
      .map(
        (m) =>
          `- id=${m.id} "${m.title}" (${m.releaseDate.slice(0, 4)}) [${m.genres.map((g) => g.name).join(", ")}]: ${m.overview.slice(0, 160)}`,
      )
      .join("\n");

    const system = [
      "You are Lumière, an AI film concierge. Recommend ONLY from the candidate list below.",
      "Be warm, specific, and brief. Never invent movies.",
      context.tasteSummary ? `The user's taste profile: ${context.tasteSummary}` : "",
      context.likedTitles?.length
        ? `The user has liked: ${context.likedTitles.join(", ")}. Reference these in explanations when relevant ("Because you enjoyed X…").`
        : "",
      "After your conversational reply, output a line `===RECS===` followed by a JSON array of",
      '{"movieId": number, "title": string, "reason": string} — 2 to 4 items, each reason one',
      "sentence explaining specifically why this film fits the request.",
      "Candidates:",
      candidateList,
    ]
      .filter(Boolean)
      .join("\n");

    const res = await openai("/chat/completions", {
      model: CHAT_MODEL,
      stream: true,
      messages: [{ role: "system", content: system }, ...messages],
    });

    let resolveRecs!: (r: Recommendation[]) => void;
    const recsPromise = new Promise<Recommendation[]>((r) => (resolveRecs = r));

    // Stream tokens to the caller, holding back everything after ===RECS===.
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let full = "";
    let inRecs = false;

    const stream = new ReadableStream<string>({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          const recsMatch = full.split("===RECS===")[1];
          try {
            const jsonStart = recsMatch?.indexOf("[");
            resolveRecs(jsonStart != null && jsonStart >= 0 ? JSON.parse(recsMatch.slice(jsonStart)) : []);
          } catch {
            resolveRecs([]);
          }
          return;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ") || line.includes("[DONE]")) continue;
          try {
            const delta: string = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content ?? "";
            if (!delta) continue;
            full += delta;
            if (!inRecs) {
              const idx = full.indexOf("===RECS===");
              if (idx >= 0) {
                inRecs = true;
                // Emit only text before the marker.
                const visible = full.slice(0, idx);
                const alreadySent = full.length - delta.length;
                if (visible.length > alreadySent) controller.enqueue(visible.slice(alreadySent));
              } else {
                controller.enqueue(delta);
              }
            }
          } catch {
            // skip malformed SSE line
          }
        }
      },
      cancel() {
        reader.cancel();
        resolveRecs([]);
      },
    });

    return { stream, recommendations: recsPromise };
  }

  async summarizeReviews(title: string, reviews: string[]): Promise<ReviewSummaryResult> {
    if (reviews.length === 0) {
      return { pros: [], cons: [], verdict: `Not enough reviews yet to summarize opinions on ${title}.` };
    }
    return jsonCompletion<ReviewSummaryResult>(
      'Summarize film reviews into JSON: {"pros": string[3 max], "cons": string[2 max], "verdict": string (2 sentences)}. Be concrete; cite recurring themes, not one-off opinions.',
      `Film: ${title}\n\nReviews:\n${reviews.map((r, i) => `${i + 1}. ${r.slice(0, 600)}`).join("\n")}`,
    );
  }

  async analyzeTaste(input: {
    likedTitles: string[];
    ratedTitles: { title: string; rating: number }[];
    genreCounts: Record<string, number>;
  }): Promise<TasteAnalysis> {
    return jsonCompletion<TasteAnalysis>(
      'Analyze a user\'s film taste. Output JSON: {"summary": string (2 warm sentences, second person), "genreWeights": {genreName: number 0..1}}.',
      JSON.stringify(input),
    );
  }
}
