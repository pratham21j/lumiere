import type { MovieSummary } from "@/lib/providers/movie/types";

/**
 * Domain types for the AI provider boundary.
 * Chat, embeddings, explanations, and summaries all flow through this
 * interface; only lib/providers/ai/* knows whether OpenAI is behind it.
 */

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** A recommendation the assistant surfaces alongside its prose. */
export interface Recommendation {
  movieId: number;
  title: string;
  /** The "why this was recommended" explanation — always present. */
  reason: string;
}

export interface ChatResult {
  /** Streamed conversational text. */
  stream: ReadableStream<string>;
  /** Resolves after the stream ends with structured recommendations. */
  recommendations: Promise<Recommendation[]>;
}

export interface ReviewSummaryResult {
  pros: string[];
  cons: string[];
  verdict: string;
}

export interface TasteAnalysis {
  /** Short natural-language portrait of the user's taste. */
  summary: string;
  /** genre name -> 0..1 weight */
  genreWeights: Record<string, number>;
}

export interface ChatContext {
  /** Candidate movies the assistant may recommend from (grounding set). */
  candidates: MovieSummary[];
  /** Optional taste portrait for personalization. */
  tasteSummary?: string;
  /** Titles the user has liked, for "because you liked X" explanations. */
  likedTitles?: string[];
}

export const EMBEDDING_DIM = 1536;

export interface AIProvider {
  /** Embed arbitrary text into the shared vector space. */
  embed(text: string): Promise<number[]>;
  /** Conversational recommendations grounded in the candidate set. */
  chat(messages: ChatMessage[], context: ChatContext): Promise<ChatResult>;
  /** Compress raw reviews into pros / cons / verdict. */
  summarizeReviews(title: string, reviews: string[]): Promise<ReviewSummaryResult>;
  /** Personal taste portrait from liked/rated titles. */
  analyzeTaste(input: {
    likedTitles: string[];
    ratedTitles: { title: string; rating: number }[];
    genreCounts: Record<string, number>;
  }): Promise<TasteAnalysis>;
}
