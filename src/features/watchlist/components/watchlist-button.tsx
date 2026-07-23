"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { WatchStatus } from "@prisma/client";
import { toggleWatchlist, setWatchStatus } from "../actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  movieId: number;
  saved: boolean;
  status: WatchStatus | null;
  signedIn: boolean;
}

const STATUS_LABEL: Record<WatchStatus, string> = {
  PLANNED: "Plan to watch",
  WATCHING: "Watching",
  WATCHED: "Watched",
};

export function WatchlistButton({ movieId, saved, status, signedIn }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic({ saved, status });

  function requireSignIn(): boolean {
    if (!signedIn) {
      toast("Sign in to keep a watchlist", {
        action: { label: "Sign in", onClick: () => router.push("/login") },
      });
      return true;
    }
    return false;
  }

  function onToggle() {
    if (requireSignIn()) return;
    startTransition(async () => {
      setOptimistic({ saved: !optimistic.saved, status: optimistic.saved ? null : "PLANNED" });
      try {
        const res = await toggleWatchlist(movieId);
        toast(res.saved ? "Added to your watchlist" : "Removed from your watchlist");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't update the watchlist.");
      }
    });
  }

  function onStatus(next: WatchStatus) {
    if (requireSignIn()) return;
    startTransition(async () => {
      setOptimistic({ saved: true, status: next });
      try {
        await setWatchStatus(movieId, next);
        toast(`Marked as “${STATUS_LABEL[next]}”`);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Couldn't update the status.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        aria-pressed={optimistic.saved}
        className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor ${
          optimistic.saved
            ? "border-tungsten/50 bg-tungsten/10 text-tungsten"
            : "border-border bg-surface text-linen hover:border-tungsten/40"
        }`}
      >
        {pending ? (
          <Loader2 aria-hidden className="size-4 animate-spin" />
        ) : (
          <Bookmark
            aria-hidden
            className={`size-4 ${optimistic.saved ? "fill-current" : ""}`}
          />
        )}
        {optimistic.saved ? "In your watchlist" : "Save to watchlist"}
      </button>

      {optimistic.saved && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ash transition-colors hover:text-linen focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor">
            {optimistic.status === "WATCHED" ? (
              <Check aria-hidden className="size-4 text-tungsten" />
            ) : (
              <Eye aria-hidden className="size-4" />
            )}
            {optimistic.status ? STATUS_LABEL[optimistic.status] : "Status"}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {(Object.keys(STATUS_LABEL) as WatchStatus[]).map((s) => (
              <DropdownMenuItem key={s} onClick={() => onStatus(s)}>
                {STATUS_LABEL[s]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
