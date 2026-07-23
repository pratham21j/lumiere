import type { Metadata } from "next";
import { resolved } from "@/lib/env";
import { auth } from "@/lib/auth";
import {
  getFeaturedCollections,
  getUserCollections,
} from "@/features/collections/queries";
import { CollectionCard } from "@/features/collections/components/collection-card";
import { CreateCollection } from "@/features/collections/components/create-collection";
import { DbRequiredNotice } from "@/components/shared/db-required-notice";

export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  if (!resolved.hasDatabase) {
    return <DbRequiredNotice feature="Collections" />;
  }

  const session = await auth();
  const [featured, mine] = await Promise.all([
    getFeaturedCollections(),
    session?.user?.id ? getUserCollections(session.user.id) : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <div className="pb-8 pt-10">
        <p className="eyebrow mb-1">Curation</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-linen">
          Collections
        </h1>
      </div>

      {session?.user && (
        <section className="mb-12">
          <h2 className="font-display mb-4 text-xl font-semibold text-linen">
            Your collections
          </h2>
          <div className="mb-6">
            <CreateCollection />
          </div>
          {mine.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mine.map((c) => (
                <CollectionCard key={c.id} collection={c} />
              ))}
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="font-display mb-1 text-xl font-semibold text-linen">
          Curated by the concierge
        </h2>
        <p className="mb-6 text-sm text-ash">
          Auto-built from the catalog — every film includes why it belongs.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      </section>
    </main>
  );
}
