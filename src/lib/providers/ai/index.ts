import { resolved } from "@/lib/env";
import type { AIProvider, ChatMessage, ChatContext } from "./types";
import { MockAIProvider } from "./mock";
import { OpenAIProvider } from "./openai";

let instance: AIProvider | null = null;

function shouldFallbackError(err: unknown): boolean {
  try {
    const msg = String((err as any).message ?? err);
    return /429|insufficient_quota|credit_balance_exhausted|no credits remaining|credit/i.test(msg);
  } catch {
    return false;
  }
}

class FallbackAIProvider implements AIProvider {
  private primary = new OpenAIProvider();
  private fallback = new MockAIProvider();

  async embed(text: string) {
    try {
      return await this.primary.embed(text);
    } catch (err) {
      if (shouldFallbackError(err)) console.warn("OpenAI embed failed — falling back to mock provider:", String(err));
      return this.fallback.embed(text);
    }
  }

  async chat(messages: ChatMessage[], context: ChatContext) {
    try {
      return await this.primary.chat(messages, context);
    } catch (err) {
      if (shouldFallbackError(err)) console.warn("OpenAI chat failed — falling back to mock provider:", String(err));
      return this.fallback.chat(messages, context);
    }
  }

  async summarizeReviews(title: string, reviews: string[]) {
    try {
      return await this.primary.summarizeReviews(title, reviews);
    } catch (err) {
      if (shouldFallbackError(err)) console.warn("OpenAI summarizeReviews failed — falling back to mock provider:", String(err));
      return this.fallback.summarizeReviews(title, reviews);
    }
  }

  async analyzeTaste(input: Parameters<AIProvider["analyzeTaste"]>[0]) {
    try {
      return await this.primary.analyzeTaste(input as any);
    } catch (err) {
      if (shouldFallbackError(err)) console.warn("OpenAI analyzeTaste failed — falling back to mock provider:", String(err));
      return this.fallback.analyzeTaste(input as any);
    }
  }
}

/** Factory — the only place that knows which AI backend is active. */
export function getAIProvider(): AIProvider {
  if (!instance) {
    if (resolved.aiProvider === "openai") {
      instance = new FallbackAIProvider();
    } else {
      instance = new MockAIProvider();
    }
  }
  return instance;
}

export * from "./types";
