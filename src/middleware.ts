import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { buildSecurityHeaders } from "@/lib/security";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const headers = buildSecurityHeaders();

  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  response.headers.set("x-request-id", request.headers.get("x-request-id") ?? crypto.randomUUID());
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
