import Link from "next/link";
import { Sparkles } from "lucide-react";
import { MoviePoster } from "@/components/shared/movie-poster";
import type { CollectionCard as CardData } from "../queries";

/** Collection tile with a 2×2 poster mosaic cover. */
export function CollectionCard({ collection }: { collection: CardData }) {
  return (
    <Link
      href={`/collections/${collection.slug}`}
      className={`group block overflow-hidden rounded-2xl border bg-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-phosphor ${
        collection.isSmart
          ? "border-phosphor/15 hover:border-phosphor/40"
          : "border-border hover:border-tungsten/40"
      }`}
    >
      <div className="grid aspect-[2/1] grid-cols-4 gap-px overflow-hidden bg-border/50">
        {Array.from({ length: 4 }).map((_, i) => {
          const m = collection.preview[i];
          return (
            <div key={i} className="relative bg-surface-raised">
              {m && (
                <MoviePoster
                  title={m.title}
                  posterPath={m.posterPath}
                  releaseDate={m.releaseDate}
                  sizes="120px"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="p-4">
        {collection.isSmart && (
          <span className="eyebrow mb-1.5 flex items-center gap-1 !text-[10px] text-phosphor/80">
            <Sparkles aria-hidden className="size-3" /> AI-curated
          </span>
        )}
        <h3 className="font-display text-base font-semibold text-linen">
          {collection.name}
        </h3>
        {collection.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ash">
            {collection.description}
          </p>
        )}
        <p className="font-data mt-2 text-[11px] text-ash/70">
          {collection.count} film{collection.count === 1 ? "" : "s"}
        </p>
      </div>
    </Link>
  );
}
