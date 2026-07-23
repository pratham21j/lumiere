/** Presentation helpers for movie metadata. */

export function formatYear(releaseDate: string): string {
  return releaseDate ? releaseDate.slice(0, 4) : "TBA";
}

export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatMoney(amount: number | bigint): string {
  const n = Number(amount);
  if (!n) return "—";
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
  return `$${n.toLocaleString("en-US")}`;
}

export function formatRating(voteAverage: number): string {
  return voteAverage > 0 ? voteAverage.toFixed(1) : "–";
}

const LANGUAGES: Record<string, string> = {
  en: "English",
  ko: "Korean",
  ja: "Japanese",
  fr: "French",
  it: "Italian",
  pt: "Portuguese",
  es: "Spanish",
  de: "German",
  zh: "Chinese",
  hi: "Hindi",
};

export function formatLanguage(code: string): string {
  return LANGUAGES[code] ?? code.toUpperCase();
}
