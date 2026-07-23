import { Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import { getReviewSummary } from "../review-summary";

/**
 * AI-compressed review consensus — pros, cons, verdict. Phosphor-tagged
 * like every AI-generated artifact. Renders nothing when a film has no
 * reviews to summarize.
 */
export async function ReviewSummarySection({ movieId }: { movieId: number }) {
  const summary = await getReviewSummary(movieId);
  if (!summary) return null;

  return (
    <section className="glow-ai mt-10 rounded-2xl border border-phosphor/20 bg-surface p-6">
      <p className="eyebrow mb-4 flex items-center gap-1.5 text-phosphor/80">
        <Sparkles aria-hidden className="size-3" /> What reviewers agree on
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-linen">
            <ThumbsUp aria-hidden className="size-3.5 text-tungsten" /> Praised
          </h3>
          <ul className="space-y-1.5">
            {summary.pros.map((p) => (
              <li key={p} className="text-sm leading-relaxed text-ash">
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-medium text-linen">
            <ThumbsDown aria-hidden className="size-3.5 text-ash" /> Criticized
          </h3>
          <ul className="space-y-1.5">
            {summary.cons.map((c) => (
              <li key={c} className="text-sm leading-relaxed text-ash">
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="mt-5 border-t border-border/60 pt-4 text-sm leading-relaxed text-linen/90">
        {summary.verdict}
      </p>
    </section>
  );
}
