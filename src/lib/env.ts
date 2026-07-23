import { z } from "zod";

/**
 * Zod-validated environment. Every external service is optional —
 * the app boots with zero keys and falls back to mock providers.
 * Provider selection is explicit via MOVIE_PROVIDER / AI_PROVIDER,
 * defaulting to whatever the available keys support.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  DATABASE_URL: z.string().url().optional(),

  // Provider switches: "mock" needs no keys, real providers need theirs.
  MOVIE_PROVIDER: z.enum(["mock", "tmdb"]).optional(),
  AI_PROVIDER: z.enum(["mock", "openai"]).optional(),

  TMDB_API_KEY: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),

  AUTH_SECRET: z.string().min(1).optional(),
  AUTH_GOOGLE_ID: z.string().min(1).optional(),
  AUTH_GOOGLE_SECRET: z.string().min(1).optional(),
  AUTH_GITHUB_ID: z.string().min(1).optional(),
  AUTH_GITHUB_SECRET: z.string().min(1).optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables — see errors above.");
}

export const env = parsed.data;

/** Resolved provider choices: explicit env wins, otherwise keys decide. */
export const resolved = {
  movieProvider: env.MOVIE_PROVIDER ?? (env.TMDB_API_KEY ? "tmdb" : "mock"),
  aiProvider: env.AI_PROVIDER ?? (env.OPENAI_API_KEY ? "openai" : "mock"),
  hasDatabase: Boolean(env.DATABASE_URL),
  hasGoogleAuth: Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
  hasGithubAuth: Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET),
} as const;
