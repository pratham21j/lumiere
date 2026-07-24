import { NextResponse } from "next/server";
import { resolved } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "ok",
    service: "lumiere",
    environment: process.env.NODE_ENV ?? "development",
    database: resolved.hasDatabase,
    movieProvider: resolved.movieProvider,
    aiProvider: resolved.aiProvider,
  });
}
