import { resolved } from "@/lib/env";
import type { AIProvider } from "./types";
import { MockAIProvider } from "./mock";
import { OpenAIProvider } from "./openai";

let instance: AIProvider | null = null;

/** Factory — the only place that knows which AI backend is active. */
export function getAIProvider(): AIProvider {
  if (!instance) {
    instance =
      resolved.aiProvider === "openai" ? new OpenAIProvider() : new MockAIProvider();
  }
  return instance;
}

export * from "./types";
