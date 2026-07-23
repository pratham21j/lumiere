import { auth } from "@/lib/auth";
import { resolved } from "@/lib/env";
import { getWatchlistState } from "@/features/watchlist/queries";
import { getUserCollections } from "@/features/collections/queries";
import { WatchlistButton } from "@/features/watchlist/components/watchlist-button";
import { AddToCollection } from "@/features/collections/components/add-to-collection";

/**
 * Personal actions on a movie page (save, status, collections).
 * Reads the viewer's state server-side; renders sign-in prompts when
 * signed out, and works fully once auth + DB exist.
 */
export async function MovieActions({ movieId }: { movieId: number }) {
  const session = resolved.hasDatabase ? await auth() : null;
  const userId = session?.user?.id ?? null;

  const [state, collections] = await Promise.all([
    userId
      ? getWatchlistState(userId, movieId)
      : Promise.resolve({ saved: false, status: null }),
    userId ? getUserCollections(userId) : Promise.resolve([]),
  ]);

  return (
    <>
      <WatchlistButton
        movieId={movieId}
        saved={state.saved}
        status={state.status}
        signedIn={Boolean(userId)}
      />
      <AddToCollection
        movieId={movieId}
        signedIn={Boolean(userId)}
        collections={collections.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
