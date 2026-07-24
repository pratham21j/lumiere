import { describe, expect, it } from "vitest";
import { scoreRecommendation, summarizeTasteProfile } from "./service";

describe("personalization helpers", () => {
  it("builds a concise taste summary from weighted genres", () => {
    const profile = summarizeTasteProfile(
      { Drama: 3, "Sci-Fi": 2.4, Comedy: 1.2 },
      ["en", "fr"],
    );

    expect(profile.favoriteGenres[0]).toBe("Drama");
    expect(profile.favoriteLanguages[0]).toBe("en");
    expect(profile.summary).toContain("Drama");
  });

  it("scores recommendations in favor of favorite genres", () => {
    const score = scoreRecommendation(["Drama", "Sci-Fi"], ["Drama", "Comedy"], 1200);
    expect(score).toBeGreaterThan(2);
  });
});
