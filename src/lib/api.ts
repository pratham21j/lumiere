import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "@/lib/logger";

/** Uniform REST envelope for all route handlers. */
export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export function apiOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data } satisfies ApiResponse<T>, init);
}

export function apiError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json(
    { ok: false, error: { code, message } } satisfies ApiResponse<never>,
    { status },
  );
}

/** Central error mapper — every handler funnels its catch here. */
export function handleApiError(err: unknown, route: string): NextResponse {
  if (err instanceof ZodError) {
    return apiError("VALIDATION", err.issues.map((i) => i.message).join("; "), 400);
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  logger.error("API error", { route, message });
  return apiError("INTERNAL", "Something went wrong. Try again.", 500);
}

export function rateLimited(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: { code: "RATE_LIMITED", message: "Too many requests. Slow down a little." },
    } satisfies ApiResponse<never>,
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
