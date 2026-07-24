import { describe, expect, it } from "vitest";
import { buildSecurityHeaders } from "./security";

describe("buildSecurityHeaders", () => {
  it("adds baseline hardening headers", () => {
    const headers = buildSecurityHeaders();

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
  });
});
