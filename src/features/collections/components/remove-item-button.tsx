"use client";

import { useTransition } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { removeFromCollection } from "../actions";

export function RemoveItemButton({
  collectionId,
  movieId,
  title,
}: {
  collectionId: string;
  movieId: number;
  title: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      aria-label={`Remove ${title} from collection`}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          try {
            await removeFromCollection(collectionId, movieId);
            toast(`Removed ${title}`);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Couldn't remove the film.");
          }
        })
      }
      className="absolute right-2 top-2 z-10 rounded-md bg-ink/80 p-1.5 text-ash opacity-0 backdrop-blur transition-opacity hover:text-linen focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-phosphor group-hover/item:opacity-100"
    >
      {pending ? (
        <Loader2 aria-hidden className="size-3.5 animate-spin" />
      ) : (
        <X aria-hidden className="size-3.5" />
      )}
    </button>
  );
}
