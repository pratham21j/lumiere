import type {
  AIProvider,
  ChatContext,
  ChatMessage,
  ChatResult,
  Recommendation,
  ReviewSummaryResult,
  TasteAnalysis,
} from "./types";
import { mockEmbed } from "./mock-embeddings";

/**
 * Mock AI provider: no API calls, deterministic, streams like the real one.
 * Recommendations are picked by cosine similarity between the user's message
 * and the candidate set, and "why" explanations are composed from real
 * metadata — so the product experience is genuine even offline.
 */

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot; // both are L2-normalized
}

function streamText(text: string, onDone?: () => void): ReadableStream<string> {
  const words = text.split(/(?<=\s)/);
  let i = 0;
  return new ReadableStream<string>({
    async pull(controller) {
      if (i >= words.length) {
        controller.close();
        onDone?.();
        return;
      }
      controller.enqueue(words[i++]);
      // Believable typing cadence without being slow.
      await new Promise((r) => setTimeout(r, 18));
    },
  });
}

export class MockAIProvider implements AIProvider {
  async embed(text: string): Promise<number[]> {
    return mockEmbed(text);
  }

  async chat(messages: ChatMessage[], context: ChatContext): Promise<ChatResult> {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    const query = lastUser?.content ?? "";
    const queryVec = mockEmbed(query);

    const scored = context.candidates
      .map((movie) => ({
        movie,
        score: cosine(
          queryVec,
          mockEmbed(`${movie.title} ${movie.overview} ${movie.genres.map((g) => g.name).join(" ")}`),
        ),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .filter((s) => s.score > 0.01);

    const liked = context.likedTitles?.slice(0, 2) ?? [];

    const recommendations: Recommendation[] = scored.map(({ movie }) => {
      const genres = movie.genres.slice(0, 2).map((g) => g.name.toLowerCase()).join(" and ");
      const year = movie.releaseDate.slice(0, 4);
      const becauseLiked =
        liked.length > 0
          ? `Because you enjoyed ${liked.join(" and ")}, this ${genres} film should land — `
          : "";
      return {
        movieId: movie.id,
        title: movie.title,
        reason: `${becauseLiked}${movie.title} (${year}) matches what you asked for: ${movie.overview.split(". ")[0]}.`,
      };
    });

    const intro =
      scored.length > 0
        ? `Here's what I'd put on tonight. I read your request as: ${summarizeIntent(query)}. ` +
          `${scored.length === 1 ? "One film stands out" : `${scored.length} films stand out`} — each with the reason it made the cut.`
        : `I couldn't find a strong match for that in the catalog yet. Try describing the feeling you're after — "slow psychological thriller", "funny but emotional", "movies where the villain wins" — and I'll narrow it down.`;

    let resolveRecs!: (r: Recommendation[]) => void;
    const recsPromise = new Promise<Recommendation[]>((res) => (resolveRecs = res));

    return {
      stream: streamText(intro, () => resolveRecs(recommendations)),
      recommendations: recsPromise,
    };
  }

  async summarizeReviews(title: string, reviews: string[]): Promise<ReviewSummaryResult> {
    if (reviews.length === 0) {
      return {
        pros: [],
        cons: [],
        verdict: `Not enough reviews yet to summarize opinions on ${title}.`,
      };
    }
    // Deterministic heuristic pass over review text.
    const text = reviews.join(" ").toLowerCase();
    const pros: string[] = [];
    const cons: string[] = [];
    const has = (...words: string[]) => words.some((w) => text.includes(w));

    if (has("visual", "gorgeous", "stunning", "cinematography")) pros.push("Frequently praised for its visuals and cinematography");
    if (has("score", "music", "soundtrack")) pros.push("The score is repeatedly singled out by reviewers");
    if (has("emotional", "wrecked", "cried", "hits")) pros.push("Lands emotionally — several reviewers mention being moved");
    if (has("screenplay", "writing", "editing", "master-class", "perfect")) pros.push("Craft (writing and editing) draws consistent praise");
    if (has("performance", "acting", "cast")) pros.push("Strong performances across the cast");
    if (pros.length === 0) pros.push("Reviewers respond positively overall");

    if (has("exposition", "heavy", "slow")) cons.push("Some find the pacing or exposition heavy in places");
    if (has("long", "runtime", "bloated")) cons.push("Length is a sticking point for a minority");
    if (has("confusing", "convoluted")) cons.push("A few reviewers found the plot hard to follow");
    if (cons.length === 0) cons.push("Few consistent criticisms across reviews");

    const avgSignal = reviews.length >= 3 ? "strongly positive" : "positive";
    return {
      pros: pros.slice(0, 3),
      cons: cons.slice(0, 2),
      verdict: `Consensus on ${title} is ${avgSignal}: reviewers agree the film delivers on its ambitions, with minor reservations noted above. Summarized from ${reviews.length} review${reviews.length === 1 ? "" : "s"}.`,
    };
  }

  async analyzeTaste(input: {
    likedTitles: string[];
    ratedTitles: { title: string; rating: number }[];
    genreCounts: Record<string, number>;
  }): Promise<TasteAnalysis> {
    const total = Object.values(input.genreCounts).reduce((a, b) => a + b, 0) || 1;
    const genreWeights = Object.fromEntries(
      Object.entries(input.genreCounts).map(([g, c]) => [g, +(c / total).toFixed(3)]),
    );
    const top = Object.entries(input.genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);

    const anchor = input.likedTitles[0] ?? input.ratedTitles[0]?.title;
    const summary =
      top.length === 0
        ? "Not enough activity yet to read your taste — like or rate a few films and I'll build your profile."
        : `You gravitate toward ${top.join(", ").toLowerCase()}${anchor ? `, anchored by films like ${anchor}` : ""}. ` +
          `You seem to favor stories with strong atmosphere over pure spectacle — I'll weight recommendations accordingly.`;

    return { summary, genreWeights };
  }
}

function summarizeIntent(query: string): string {
  const q = query.trim().replace(/\s+/g, " ");
  return q.length > 90 ? `${q.slice(0, 87)}…` : q || "an open-ended pick";
}
