/** Single source of truth for product identity — rename here to rebrand. */
export const SITE = {
  name: "Lumière",
  tagline: "Your AI film concierge",
  description:
    "An AI-powered entertainment assistant. Describe what you feel like watching — in plain language — and get recommendations that come with reasons.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;
