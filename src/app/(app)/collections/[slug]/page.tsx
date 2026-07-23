import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { resolved } from "@/lib/env";
import { auth } from "@/lib/auth";
import { getCollectionBySlug } from "@/features/collections/queries";
import { MovieCard } from "@/components/shared/movie-card";
import { RemoveItemButton } from "@/features/collections/components/remove-item-button";
import { DbRequiredNotice } from "@/components/shared/db-required-notice";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!resolved.hasDatabase) return { title: "Collections" };
  const session = await auth();
  const c = await getCollectionBySlug((await params).slug, session?.user?.id ?? null);
  return { title: c?.name ?? "Collection not found" };
}

export default async function CollectionPage({ params }: Props) {
  if (!resolved.hasDatabase) {
    return <DbRequiredNotice feature="Collections" />;
  }
  const session = await auth();
  const collection = await getCollectionBySlug(
    (await params).slug,
    session?.user?.id ?? null,
  );
  if (!collection) notFound();

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        {collection.isSmart ? (
          <p className="eyebrow mb-1 flex items-center gap-1.5 text-phosphor/80">
            <Sparkles aria-hidden className="size-3" /> AI-curated collection
          </p>
        ) : (
          <p className="eyebrow mb-1">Your collection</p>
        )}
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          {collection.name}
        </h1>
        {collection.description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ash">
            {collection.description}
          </p>
        )}
        <p className="font-data mt-2 text-xs text-ash/70">
          {collection.count} film{collection.count === 1 ? "" : "s"}
        </p>
      </div>

      {collection.items.length === 0 ? (
        <p className="mt-8 text-sm text-ash">
          Empty so far. Open any film and choose “Add to collection.”
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {collection.items.map(({ movie, reason }) => (
            <div key={movie.id} className="group/item relative">
              {collection.ownedByViewer && (
                <RemoveItemButton
                  collectionId={collection.id}
                  movieId={movie.id}
                  title={movie.title}
                />
              )}
              <MovieCard movie={movie} />
              {reason && (
                <p className="mt-2 border-l-2 border-phosphor/40 pl-2 text-xs leading-relaxed text-ash">
                  {reason}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
