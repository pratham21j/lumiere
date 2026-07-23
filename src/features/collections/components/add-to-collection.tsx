"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addToCollection } from "../actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  movieId: number;
  signedIn: boolean;
  collections: { id: string; name: string }[];
}

export function AddToCollection({ movieId, signedIn, collections }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <button
        type="button"
        onClick={() =>
          toast("Sign in to organize films into collections", {
            action: { label: "Sign in", onClick: () => router.push("/login") },
          })
        }
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-linen transition-colors hover:border-tungsten/40"
      >
        <FolderPlus aria-hidden className="size-4" />
        Add to collection
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-linen transition-colors hover:border-tungsten/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor">
        {pending ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <FolderPlus aria-hidden className="size-4" />
        )}
        Add to collection
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {collections.length === 0 ? (
          <DropdownMenuLabel className="font-normal text-ash">
            No collections yet
          </DropdownMenuLabel>
        ) : (
          collections.map((c) => (
            <DropdownMenuItem
              key={c.id}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await addToCollection(c.id, movieId);
                    toast(`Added to “${c.name}”`);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Couldn't add the film.");
                  }
                })
              }
            >
              {c.name}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/collections")}>
          Create a collection…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
