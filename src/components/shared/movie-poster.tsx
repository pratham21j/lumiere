import Image from "next/image";
import { formatYear } from "@/lib/format";

/**
 * Poster with a designed fallback. In mock mode (no TMDB key) there are no
 * poster images, so we render a deterministic "printed card" per film:
 * a hue derived from the title, poster-style type, and a film-frame border.
 * With TMDB active, this becomes a plain next/image poster.
 */

function hueFromTitle(title: string): number {
  let h = 0;
  for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return h % 360;
}

interface Props {
  title: string;
  posterPath: string | null;
  releaseDate: string;
  sizes?: string;
  priority?: boolean;
}

export function MoviePoster({ title, posterPath, releaseDate, sizes, priority }: Props) {
  if (posterPath) {
    return (
      <Image
        src={posterPath}
        alt={`${title} poster`}
        fill
        sizes={sizes ?? "(max-width: 640px) 40vw, 200px"}
        priority={priority}
        className="object-cover"
      />
    );
  }

  const hue = hueFromTitle(title);
  return (
    <div
      aria-hidden
      className="absolute inset-0 flex flex-col justify-between p-3"
      style={{
        background: `linear-gradient(160deg,
          hsl(${hue} 30% 16%) 0%,
          hsl(${hue} 38% 9%) 55%,
          hsl(${(hue + 40) % 360} 32% 12%) 100%)`,
      }}
    >
      <span className="font-data text-[10px] tracking-[0.2em] text-linen/40">
        {formatYear(releaseDate)}
      </span>
      <span
        className="font-display text-lg font-bold leading-tight text-linen/90"
        style={{ fontStretch: "condensed" }}
      >
        {title}
      </span>
    </div>
  );
}
