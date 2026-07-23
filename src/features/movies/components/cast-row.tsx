import Image from "next/image";
import type { CastMember } from "@/lib/providers/movie";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function CastRow({ cast }: { cast: CastMember[] }) {
  return (
    <ul className="no-scrollbar flex gap-5 overflow-x-auto pb-2">
      {cast.slice(0, 12).map((c) => (
        <li key={c.id} className="w-20 shrink-0 text-center">
          <div className="relative mx-auto size-16 overflow-hidden rounded-full border border-border bg-surface-raised">
            {c.profilePath ? (
              <Image
                src={c.profilePath}
                alt={c.name}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden
                className="font-display grid h-full w-full place-items-center text-sm font-semibold text-ash"
              >
                {initials(c.name)}
              </span>
            )}
          </div>
          <div className="mt-2 line-clamp-2 text-xs leading-snug text-linen">{c.name}</div>
          {c.character && (
            <div className="mt-0.5 line-clamp-1 text-[10px] text-ash">{c.character}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
